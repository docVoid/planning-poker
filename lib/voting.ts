import { type Deck, isAllowedValue } from './decks';
import { commitFor, pickIcon } from './game';
import { randomHex } from './ids';
import type { Member } from './member';
import type { CardIcon, RevealPayload } from './protocol';
import type { Phase } from './snapshot';
import type { SavedVote } from './vote-storage';

const SALT_BYTES = 16;

export interface Commitment {
  commit: string;
  icon: CardIcon;
}

export interface RevealTiming {
  countdownMs: number;
  revealTimeoutMs: number;
}

export class Voting {
  round = 0;
  revealStartedAt: number | null = null;
  private vote: RevealPayload | null = null;
  private revealed = false;

  constructor(
    private readonly selfCid: string,
    private readonly timing: RevealTiming,
  ) {}

  get countdownMs(): number {
    return this.timing.countdownMs;
  }

  get myValue(): string | null {
    return this.vote?.value ?? null;
  }

  /** Once our vote is revealed it can no longer change. */
  get locked(): boolean {
    return this.revealed;
  }

  startRound(round: number, members: Member[]): void {
    this.round = round;
    for (const member of members) Object.assign(member, { commit: null, icon: null, reveal: null });
    this.vote = null;
    this.revealed = false;
    this.revealStartedAt = null;
  }

  castVote(me: Member, deck: Deck, value: string): Commitment | null {
    if (this.revealed || this.vote?.value === value || !isAllowedValue(deck, value)) return null;
    this.vote = { value, salt: randomHex(SALT_BYTES) };
    me.commit = commitFor(this.round, this.selfCid, value, this.vote.salt);
    me.icon = pickIcon(me.icon);
    me.reveal = null;
    return { commit: me.commit, icon: me.icon };
  }

  restore(me: Member, deck: Deck, saved: SavedVote | null): Commitment | null {
    if (!saved || saved.cid !== this.selfCid || saved.round !== this.round || !isAllowedValue(deck, saved.value)) {
      return null;
    }
    this.vote = { value: saved.value, salt: saved.salt };
    me.commit = commitFor(this.round, this.selfCid, saved.value, saved.salt);
    me.icon = saved.icon;
    return { commit: me.commit, icon: saved.icon };
  }

  toSavedVote(me: Member): SavedVote | null {
    return this.vote && me.icon ? { cid: this.selfCid, round: this.round, ...this.vote, icon: me.icon } : null;
  }

  applyRemoteVote(
    member: Member,
    round: number,
    commit: string | null,
    icon: CardIcon | null,
    reveal: RevealPayload | null,
  ): void {
    if (round !== this.round || member.cid === this.selfCid) return;
    if (member.commit !== commit) Object.assign(member, { commit, icon: commit ? icon : null, reveal: null });
    else if (commit && icon) member.icon = icon;
    if (commit && reveal) member.reveal = { value: reveal.value, salt: reveal.salt };
  }

  applyRemoteReveal(member: Member, round: number, reveal: RevealPayload): void {
    if (member.commit && round === this.round) member.reveal = { ...reveal };
  }

  everyoneVoted(members: Member[]): boolean {
    return members.length > 0 && members.every((member) => member.commit);
  }

  /** Starts the reveal countdown when the last vote arrives and stops it when somebody new joins. */
  syncRevealClock(members: Member[], now: number): void {
    if (!this.everyoneVoted(members)) this.revealStartedAt = null;
    else this.revealStartedAt ??= now;
  }

  /** Our own vote is opened once, as soon as everybody has voted. */
  takeOwnReveal(me: Member): RevealPayload | null {
    if (this.revealed || !this.vote) return null;
    this.revealed = true;
    me.reveal = { ...this.vote };
    return { ...this.vote };
  }

  phase(members: Member[], now: number): Phase {
    if (this.revealStartedAt === null || !this.everyoneVoted(members)) return 'voting';
    const countdownEnd = this.revealStartedAt + this.timing.countdownMs;
    if (now < countdownEnd) return 'revealing';
    const allRevealsIn = members.every((member) => member.reveal);
    return allRevealsIn || now >= countdownEnd + this.timing.revealTimeoutMs ? 'revealed' : 'revealing';
  }

  nextPhaseChangeAt(now: number): number | null {
    if (this.revealStartedAt === null) return null;
    const countdownEnd = this.revealStartedAt + this.timing.countdownMs;
    const upcoming = [countdownEnd, countdownEnd + this.timing.revealTimeoutMs].find((time) => time > now);
    return upcoming ?? null;
  }

  isRevealValid(member: Member, deck: Deck): boolean {
    const { reveal, commit } = member;
    if (!reveal || !commit) return false;
    reveal.valid ??=
      isAllowedValue(deck, reveal.value) && commitFor(this.round, member.cid, reveal.value, reveal.salt) === commit;
    return reveal.valid;
  }
}
