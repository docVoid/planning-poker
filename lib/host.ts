import type { Member } from './member';

export class HostElection {
  epoch = 0;

  constructor(public cid: string | null) {}

  /** A higher epoch wins; on a tie the smaller id wins, so all clients converge on one host. */
  adopt(cid: string | null, epoch: number): void {
    if (!cid) return;
    const supersedes =
      this.cid === null ? epoch >= this.epoch : epoch > this.epoch || (epoch === this.epoch && cid < this.cid);
    if (!supersedes) return;
    this.cid = cid;
    this.epoch = epoch;
  }

  /** Every client applies this to the same members, so every client picks the same successor. */
  electFrom(membersInJoinOrder: Member[]): { hostCid: string; hostEpoch: number } | null {
    const successor = membersInJoinOrder[0];
    if (!successor) return null;
    this.epoch += 1;
    this.cid = successor.cid;
    return { hostCid: this.cid, hostEpoch: this.epoch };
  }

  isMissingFrom(members: Member[]): boolean {
    return this.cid !== null && !members.some((member) => member.cid === this.cid);
  }
}
