type Timer = ReturnType<typeof setTimeout>;

/** Which connection belongs to which player, plus the short grace periods around leaving and kicks. */
export class PeerDirectory {
  private readonly cidByPeer = new Map<string, string>();
  private readonly pendingRemovals = new Map<string, Timer>();
  private readonly ignoredUntil = new Map<string, number>();

  bind(peerId: string, cid: string): void {
    this.cidByPeer.set(peerId, cid);
    this.cancelRemoval(cid);
  }

  unbind(peerId: string): string | undefined {
    const cid = this.cidByPeer.get(peerId);
    this.cidByPeer.delete(peerId);
    return cid;
  }

  isConnected(cid: string): boolean {
    return [...this.cidByPeer.values()].includes(cid);
  }

  forget(cid: string): void {
    this.cancelRemoval(cid);
    for (const [peerId, boundCid] of this.cidByPeer) if (boundCid === cid) this.cidByPeer.delete(peerId);
  }

  scheduleRemoval(cid: string, delayMs: number, remove: () => void): void {
    this.cancelRemoval(cid);
    this.pendingRemovals.set(
      cid,
      setTimeout(() => {
        this.pendingRemovals.delete(cid);
        remove();
      }, delayMs),
    );
  }

  cancelAllRemovals(): void {
    this.pendingRemovals.forEach(clearTimeout);
    this.pendingRemovals.clear();
  }

  ignore(cid: string, until: number): void {
    this.ignoredUntil.set(cid, until);
  }

  // A just-kicked client may still send for a moment; only a fresh join is accepted.
  shouldIgnore(cid: string, now: number, isFreshJoin: boolean): boolean {
    const until = this.ignoredUntil.get(cid);
    if (until === undefined) return false;
    if (isFreshJoin || now >= until) {
      this.ignoredUntil.delete(cid);
      return false;
    }
    return true;
  }

  private cancelRemoval(cid: string): void {
    const timer = this.pendingRemovals.get(cid);
    if (timer) clearTimeout(timer);
    this.pendingRemovals.delete(cid);
  }
}
