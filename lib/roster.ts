import { byJoinOrder } from './game';
import { sanitizeName } from './ids';
import type { Member } from './member';

const DEFAULT_NAME = 'Guest';

export class Roster {
  private readonly members = new Map<string, Member>();

  constructor(
    private readonly selfCid: string,
    selfName: string,
    now: number,
  ) {
    this.members.set(selfCid, {
      cid: selfCid,
      name: selfName,
      joinedAt: now,
      lastSeen: now,
      commit: null,
      icon: null,
      reveal: null,
    });
  }

  get me(): Member {
    return this.members.get(this.selfCid)!;
  }

  get(cid: string): Member | undefined {
    return this.members.get(cid);
  }

  has(cid: string): boolean {
    return this.members.has(cid);
  }

  /** All members in join order, which is identical on every client. */
  all(): Member[] {
    return [...this.members.values()].sort(byJoinOrder);
  }

  upsert(cid: string, rawName: string, joinedAt: number, now: number): Member {
    const name = sanitizeName(rawName) || DEFAULT_NAME;
    const existing = this.members.get(cid);
    if (existing) {
      Object.assign(existing, { name, joinedAt, lastSeen: now });
      return existing;
    }
    const member: Member = { cid, name, joinedAt, lastSeen: now, commit: null, icon: null, reveal: null };
    this.members.set(cid, member);
    return member;
  }

  touch(cid: string, now: number): void {
    const member = this.members.get(cid);
    if (member) member.lastSeen = now;
  }

  remove(cid: string): boolean {
    return cid !== this.selfCid && this.members.delete(cid);
  }

  silentSince(now: number, timeoutMs: number): string[] {
    return this.all()
      .filter((member) => member.cid !== this.selfCid && now - member.lastSeen > timeoutMs)
      .map((member) => member.cid);
  }

  joinAfterEveryoneElse(): void {
    const others = this.all().filter((member) => member.cid !== this.selfCid);
    const latest = Math.max(0, ...others.map((member) => member.joinedAt));
    this.me.joinedAt = Math.max(this.me.joinedAt, latest + 1);
  }
}
