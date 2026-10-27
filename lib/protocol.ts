import type { DeckId } from './decks';
import { isDeckId } from './decks';

export const PROTOCOL_VERSION = 1;

export const CARD_ICONS = [
  'anchor',
  'kite',
  'cactus',
  'moon',
  'teapot',
  'umbrella',
  'key',
  'snail',
  'lighthouse',
  'plane',
  'mushroom',
  'cassette',
  'pear',
  'fish',
  'planet',
  'leaf',
] as const;
export type CardIcon = (typeof CARD_ICONS)[number];

export function isCardIcon(v: unknown): v is CardIcon {
  return typeof v === 'string' && (CARD_ICONS as readonly string[]).includes(v);
}

export interface RoomConfig {
  name: string;
  deck: DeckId;
}

export interface RevealPayload {
  value: string;
  salt: string;
}

interface Base {
  v: typeof PROTOCOL_VERSION;
  from: string;
}

export interface JoinMsg extends Base {
  t: 'join';
  name: string;
  joinedAt: number;
  round: number;
  commit: string | null;
  icon: CardIcon | null;
  reveal: RevealPayload | null;
}

export interface ConfigMsg extends Base {
  t: 'config';
  config: RoomConfig;
  hostCid: string;
  hostEpoch: number;
  round: number;
}

export interface VoteCommitMsg extends Base {
  t: 'vote-commit';
  round: number;
  commit: string;
  icon: CardIcon;
}

export interface RevealMsg extends Base {
  t: 'reveal';
  round: number;
  value: string;
  salt: string;
}

export interface KickMsg extends Base {
  t: 'kick';
  target: string;
}

export interface ResetMsg extends Base {
  t: 'reset';
  round: number;
}

export interface LeaveMsg extends Base {
  t: 'leave';
}

export interface HeartbeatMsg extends Base {
  t: 'heartbeat';
  name: string;
  joinedAt: number;
  round: number;
  commit: string | null;
  icon: CardIcon | null;
  reveal: RevealPayload | null;
  hostCid: string | null;
  hostEpoch: number;
}

export interface HostChangeMsg extends Base {
  t: 'host-change';
  hostCid: string;
  hostEpoch: number;
}

export type Msg =
  JoinMsg | ConfigMsg | VoteCommitMsg | RevealMsg | KickMsg | ResetMsg | LeaveMsg | HeartbeatMsg | HostChangeMsg;

export type WithoutEnvelope<T> = T extends unknown ? Omit<T, 'v' | 'from'> : never;
