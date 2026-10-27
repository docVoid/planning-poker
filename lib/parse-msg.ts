import { isDeckId } from './decks';
import {
  type CardIcon,
  type Msg,
  PROTOCOL_VERSION,
  type RevealPayload,
  type RoomConfig,
  type WithoutEnvelope,
  isCardIcon,
} from './protocol';

const MAX_ID_LENGTH = 40;
const MAX_NAME_LENGTH = 80;
const MAX_ROOM_NAME_LENGTH = 120;
const MAX_COMMIT_LENGTH = 64;
const MAX_VALUE_LENGTH = 8;
const MAX_SALT_LENGTH = 64;

type Fields = Record<string, unknown>;

const isRecord = (value: unknown): value is Fields => typeof value === 'object' && value !== null;
const text = (value: unknown, maxLength: number): string | undefined =>
  typeof value === 'string' && value.length <= maxLength ? value : undefined;
const count = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : undefined;

function reveal(value: unknown): RevealPayload | undefined {
  if (!isRecord(value)) return undefined;
  const revealed = text(value.value, MAX_VALUE_LENGTH);
  const salt = text(value.salt, MAX_SALT_LENGTH);
  return revealed === undefined || salt === undefined ? undefined : { value: revealed, salt };
}

function roomConfig(value: unknown): RoomConfig | undefined {
  if (!isRecord(value)) return undefined;
  const name = text(value.name, MAX_ROOM_NAME_LENGTH);
  return name !== undefined && isDeckId(value.deck) ? { name, deck: value.deck } : undefined;
}

function nullable<T>(value: unknown, parse: (value: unknown) => T | undefined): T | null | undefined {
  return value === null ? null : parse(value);
}

const commit = (value: unknown) => text(value, MAX_COMMIT_LENGTH);
const icon = (value: unknown): CardIcon | undefined => (isCardIcon(value) ? value : undefined);
const id = (value: unknown) => text(value, MAX_ID_LENGTH);

interface Presence {
  name: string;
  joinedAt: number;
  round: number;
  commit: string | null;
  icon: CardIcon | null;
  reveal: RevealPayload | null;
}

function presence(fields: Fields): Presence | undefined {
  const name = text(fields.name, MAX_NAME_LENGTH);
  const joinedAt = count(fields.joinedAt);
  const round = count(fields.round);
  const voteCommit = nullable(fields.commit, commit);
  const voteIcon = nullable(fields.icon, icon);
  const voteReveal = nullable(fields.reveal, reveal);
  if (
    name === undefined ||
    joinedAt === undefined ||
    round === undefined ||
    voteCommit === undefined ||
    voteIcon === undefined ||
    voteReveal === undefined
  ) {
    return undefined;
  }
  return { name, joinedAt, round, commit: voteCommit, icon: voteIcon, reveal: voteReveal };
}

function parseBody(fields: Fields): WithoutEnvelope<Msg> | undefined {
  switch (fields.t) {
    case 'join': {
      const parsed = presence(fields);
      return parsed && { t: 'join', ...parsed };
    }
    case 'heartbeat': {
      const parsed = presence(fields);
      const hostCid = nullable(fields.hostCid, id);
      const hostEpoch = count(fields.hostEpoch);
      if (!parsed || hostCid === undefined || hostEpoch === undefined) return undefined;
      return { t: 'heartbeat', ...parsed, hostCid, hostEpoch };
    }
    case 'config': {
      const config = roomConfig(fields.config);
      const hostCid = id(fields.hostCid);
      const hostEpoch = count(fields.hostEpoch);
      const round = count(fields.round);
      if (!config || hostCid === undefined || hostEpoch === undefined || round === undefined) return undefined;
      return { t: 'config', config, hostCid, hostEpoch, round };
    }
    case 'vote-commit': {
      const round = count(fields.round);
      const voteCommit = commit(fields.commit);
      const voteIcon = icon(fields.icon);
      if (round === undefined || voteCommit === undefined || voteIcon === undefined) return undefined;
      return { t: 'vote-commit', round, commit: voteCommit, icon: voteIcon };
    }
    case 'reveal': {
      const round = count(fields.round);
      const revealed = reveal(fields);
      return round === undefined || !revealed ? undefined : { t: 'reveal', round, ...revealed };
    }
    case 'kick': {
      const target = id(fields.target);
      return target === undefined ? undefined : { t: 'kick', target };
    }
    case 'reset': {
      const round = count(fields.round);
      return round === undefined ? undefined : { t: 'reset', round };
    }
    case 'leave':
      return { t: 'leave' };
    case 'host-change': {
      const hostCid = id(fields.hostCid);
      const hostEpoch = count(fields.hostEpoch);
      return hostCid === undefined || hostEpoch === undefined ? undefined : { t: 'host-change', hostCid, hostEpoch };
    }
    default:
      return undefined;
  }
}

/** Validates untrusted network data; anything malformed is dropped. */
export function parseMsg(data: unknown): Msg | null {
  if (!isRecord(data) || data.v !== PROTOCOL_VERSION) return null;
  const from = id(data.from);
  const body = from ? parseBody(data) : undefined;
  return from && body ? { ...body, v: PROTOCOL_VERSION, from } : null;
}
