import type { CardIcon, RoomConfig } from './protocol';

export type Status = 'connecting' | 'ready' | 'not-found' | 'removed';
export type Phase = 'voting' | 'revealing' | 'revealed';

export interface SeatInfo {
  cid: string;
  name: string;
  isSelf: boolean;
  isHost: boolean;
  voted: boolean;
  icon: CardIcon | null;
  commit: string | null;
  tilt: number;
  value: string | null;
  invalid: boolean;
}

export interface Stats {
  low: string | null;
  high: string | null;
  avg: number | null;
  consensus: boolean;
  tally: { value: string; n: number }[];
  counted: number;
}

export interface RoomSnapshot {
  status: Status;
  code: string;
  selfCid: string;
  config: RoomConfig | null;
  round: number;
  phase: Phase;
  revealStartedAt: number | null;
  countdownMs: number;
  seats: SeatInfo[];
  hostCid: string | null;
  isHost: boolean;
  myValue: string | null;
  locked: boolean;
  votedCount: number;
  stats: Stats | null;
}

export type ReadyRoomSnapshot = RoomSnapshot & { config: RoomConfig };

export function isRoomReady(snapshot: RoomSnapshot | null): snapshot is ReadyRoomSnapshot {
  return snapshot !== null && snapshot.status === 'ready' && snapshot.config !== null;
}
