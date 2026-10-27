import type { Msg } from './protocol';

export interface SyncHandlers {
  onMessage(message: unknown, peerId: string): void;
  onPeerJoin(peerId: string): void;
  onPeerLeave(peerId: string): void;
}

export interface SyncTransport {
  connect(handlers: SyncHandlers): void | Promise<void>;
  send(message: Msg, targetPeerId?: string): void;
  disconnect(): void | Promise<void>;
}

const APP_ID = 'planning-poker.pngrtz.com';
const ACTION_NAME = 'pp';

export function createTrysteroTransport(roomCode: string): SyncTransport {
  let room: import('trystero').Room | null = null;
  let sendToPeers: ((message: Msg, targetPeerId?: string) => void) | null = null;
  let closed = false;

  return {
    async connect(handlers) {
      const { joinRoom } = await import('trystero');
      if (closed) return;
      room = joinRoom({ appId: APP_ID }, roomCode);
      const action = room.makeAction<never>(ACTION_NAME);
      action.onMessage = (data, { peerId }) => handlers.onMessage(data, peerId);
      room.onPeerJoin = handlers.onPeerJoin;
      room.onPeerLeave = handlers.onPeerLeave;
      sendToPeers = (message, targetPeerId) => {
        void action.send(message as never, targetPeerId ? { target: targetPeerId } : undefined).catch(() => undefined);
      };
    },
    send(message, targetPeerId) {
      sendToPeers?.(message, targetPeerId);
    },
    async disconnect() {
      closed = true;
      sendToPeers = null;
      await room?.leave().catch(() => undefined);
      room = null;
    },
  };
}
