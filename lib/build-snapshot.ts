import { type Deck, getDeck } from './decks';
import { computeStats, displayNames, tiltOf } from './game';
import type { HostElection } from './host';
import type { Roster } from './roster';
import type { RoomConfig } from './protocol';
import type { RoomSnapshot, SeatInfo, Status } from './snapshot';
import type { Voting } from './voting';

interface SnapshotSource {
  status: Status;
  code: string;
  config: RoomConfig | null;
  roster: Roster;
  host: HostElection;
  voting: Voting;
  now: number;
}

export function buildSnapshot({ status, code, config, roster, host, voting, now }: SnapshotSource): RoomSnapshot {
  const members = roster.all();
  const names = displayNames(members);
  const phase = status === 'ready' ? voting.phase(members, now) : 'voting';
  const deck = config ? getDeck(config.deck) : undefined;
  const revealedDeck = phase === 'revealed' ? deck : undefined;
  const selfCid = roster.me.cid;

  const seats: SeatInfo[] = members.map((member) => {
    const valid = revealedDeck !== undefined && voting.isRevealValid(member, revealedDeck);
    return {
      cid: member.cid,
      name: names[member.cid],
      isSelf: member.cid === selfCid,
      isHost: member.cid === host.cid,
      voted: !!member.commit,
      icon: member.icon,
      commit: member.commit,
      tilt: member.commit ? tiltOf(member.commit) : 0,
      value: valid && member.reveal ? member.reveal.value : null,
      invalid: revealedDeck !== undefined && !!member.commit && !valid,
    };
  });

  return {
    status,
    code,
    selfCid,
    config,
    round: voting.round,
    phase,
    revealStartedAt: phase === 'revealing' ? voting.revealStartedAt : null,
    countdownMs: voting.countdownMs,
    seats,
    hostCid: host.cid,
    isHost: host.cid === selfCid,
    myValue: voting.myValue,
    locked: voting.locked,
    votedCount: seats.filter((seat) => seat.voted).length,
    stats: revealedDeck ? statsOf(seats, revealedDeck) : null,
  };
}

function statsOf(seats: SeatInfo[], deck: Deck) {
  return computeStats(
    deck,
    seats.flatMap((seat) => (seat.value === null ? [] : [seat.value])),
  );
}
