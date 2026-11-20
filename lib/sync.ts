import type { Msg } from './protocol';
import { PING, PONG, type ClientFrame, type ServerFrame } from './relay-room';

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

const DEFAULT_RELAY_URL = 'ws://localhost:8787';
const OPEN = 1;
const PING_INTERVAL_MS = 20_000;
const PONG_TIMEOUT_MS = 8_000;
const RECONNECT_BASE_MS = 400;
const RECONNECT_MAX_MS = 5_000;

export function relayUrl(): string {
  return (process.env.NEXT_PUBLIC_RELAY_URL || DEFAULT_RELAY_URL).replace(/\/+$/, '');
}

export interface RelayTransportOptions {
  baseUrl?: string;
  createSocket?: (url: string) => WebSocket;
}

export function createRelayTransport(roomCode: string, options: RelayTransportOptions = {}): SyncTransport {
  const url = `${options.baseUrl ?? relayUrl()}/room/${roomCode}`;
  const createSocket = options.createSocket ?? ((target: string) => new WebSocket(target));

  let handlers: SyncHandlers | null = null;
  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let pingTimer: ReturnType<typeof setInterval> | undefined;
  let pongTimer: ReturnType<typeof setTimeout> | undefined;
  let peers = new Set<string>();

  function stopKeepAlive(): void {
    clearInterval(pingTimer);
    clearTimeout(pongTimer);
  }

  function startKeepAlive(ws: WebSocket): void {
    stopKeepAlive();
    pingTimer = setInterval(() => {
      if (ws.readyState !== OPEN) return;
      ws.send(PING);
      clearTimeout(pongTimer);
      pongTimer = setTimeout(() => ws.close(), PONG_TIMEOUT_MS);
    }, PING_INTERVAL_MS);
  }

  function scheduleReconnect(): void {
    if (closed || reconnectTimer) return;
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
    attempt += 1;
    reconnectTimer = setTimeout(
      () => {
        reconnectTimer = undefined;
        open();
      },
      delay * (0.75 + Math.random() * 0.5),
    );
  }

  function reconnectNow(): void {
    if (closed || (socket && socket.readyState <= OPEN)) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
    open();
  }

  function applyRoster(next: string[]): void {
    const present = new Set(next);
    const before = peers;
    peers = present;
    for (const id of before) if (!present.has(id)) handlers?.onPeerLeave(id);
    for (const id of present) if (!before.has(id)) handlers?.onPeerJoin(id);
  }

  function onFrame(frame: ServerFrame): void {
    switch (frame.t) {
      case 'hello':
        return applyRoster(frame.peers);
      case 'join':
        if (peers.has(frame.id)) return;
        peers.add(frame.id);
        return handlers?.onPeerJoin(frame.id);
      case 'leave':
        if (!peers.delete(frame.id)) return;
        return handlers?.onPeerLeave(frame.id);
      case 'msg':
        return handlers?.onMessage(frame.data, frame.from);
    }
  }

  function open(): void {
    if (closed) return;
    let ws: WebSocket;
    try {
      ws = createSocket(url);
    } catch {
      return scheduleReconnect();
    }
    socket = ws;
    ws.onopen = () => {
      attempt = 0;
      startKeepAlive(ws);
    };
    ws.onmessage = (event) => {
      if (socket !== ws) return;
      if (event.data === PONG) return clearTimeout(pongTimer);
      if (typeof event.data !== 'string') return;
      try {
        onFrame(JSON.parse(event.data) as ServerFrame);
      } catch {
        return;
      }
    };
    ws.onclose = () => {
      if (socket !== ws) return;
      socket = null;
      stopKeepAlive();
      scheduleReconnect();
    };
    ws.onerror = () => undefined;
  }

  const onOnline = (): void => reconnectNow();

  return {
    connect(next) {
      handlers = next;
      if (typeof window !== 'undefined') window.addEventListener('online', onOnline);
      open();
    },
    send(message, targetPeerId) {
      if (!socket || socket.readyState !== OPEN) return;
      const frame: ClientFrame = { data: message, ...(targetPeerId ? { to: targetPeerId } : {}) };
      socket.send(JSON.stringify(frame));
    },
    disconnect() {
      closed = true;
      handlers = null;
      clearTimeout(reconnectTimer);
      stopKeepAlive();
      if (typeof window !== 'undefined') window.removeEventListener('online', onOnline);
      const ws = socket;
      socket = null;
      try {
        ws?.close(1000);
      } catch {
        return;
      }
    },
  };
}
