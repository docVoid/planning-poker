import type { CardIcon, RevealPayload } from './protocol';

export interface Member {
  cid: string;
  name: string;
  joinedAt: number;
  lastSeen: number;
  commit: string | null;
  icon: CardIcon | null;
  reveal: (RevealPayload & { valid?: boolean }) | null;
}
