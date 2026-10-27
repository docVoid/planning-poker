import type { Msg } from '../lib/protocol';
import type { SyncHandlers, SyncTransport } from '../lib/sync';

export function createHub() {
  const peers = new Map<string, SyncHandlers>();
  const log: { from: string; to: string | null; msg: Msg }[] = [];
  let n = 0;

  const deliver = (fn: () => void) => setTimeout(fn, 0);

  function transport(peerId = `peer${++n}`): SyncTransport & { peerId: string; drop(): void } {
    let gone = false;
    return {
      peerId,
      connect(handlers) {
        deliver(() => {
          for (const [id, h] of peers) {
            h.onPeerJoin(peerId);
            handlers.onPeerJoin(id);
          }
          peers.set(peerId, handlers);
        });
      },
      send(msg, target) {
        if (gone) return;
        log.push({ from: peerId, to: target ?? null, msg });
        const copy = JSON.parse(JSON.stringify(msg));
        deliver(() => {
          for (const [id, h] of peers) {
            if (id === peerId) continue;
            if (target && id !== target) continue;
            h.onMessage(copy, peerId);
          }
        });
      },
      disconnect() {
        deliver(() => {
          gone = true;
          if (!peers.delete(peerId)) return;
          for (const h of peers.values()) h.onPeerLeave(peerId);
        });
      },
      drop() {
        this.disconnect();
      },
    };
  }
  return { transport, log, peers };
}
