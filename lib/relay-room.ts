export const MAX_FRAME_CHARS = 16 * 1024;
export const PING = 'ping';
export const PONG = 'pong';

export interface ClientFrame {
  to?: string;
  data: unknown;
}

export type ServerFrame =
  | { t: 'hello'; id: string; peers: string[] }
  | { t: 'join'; id: string }
  | { t: 'leave'; id: string }
  | { t: 'msg'; from: string; data: unknown };

export interface RelayPeer {
  id: string;
  send(frame: string): void;
}

function sendIfOpen(peer: RelayPeer, frame: ServerFrame | string): void {
  try {
    peer.send(typeof frame === 'string' ? frame : JSON.stringify(frame));
  } catch {
    return;
  }
}

export function parseClientFrame(raw: unknown): ClientFrame | null {
  if (typeof raw !== 'string' || raw.length > MAX_FRAME_CHARS) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null || !('data' in value)) return null;
  const { to, data } = value as { to?: unknown; data: unknown };
  if (to !== undefined && typeof to !== 'string') return null;
  return { to, data };
}

export function announceJoin(joinerId: string, peers: readonly RelayPeer[]): void {
  const joiner = peers.find((peer) => peer.id === joinerId);
  if (!joiner) return;
  const others = peers.filter((peer) => peer.id !== joinerId);
  sendIfOpen(joiner, { t: 'hello', id: joinerId, peers: others.map((peer) => peer.id) });
  for (const peer of others) sendIfOpen(peer, { t: 'join', id: joinerId });
}

export function announceLeave(leaverId: string, peers: readonly RelayPeer[]): void {
  for (const peer of peers) if (peer.id !== leaverId) sendIfOpen(peer, { t: 'leave', id: leaverId });
}

export function routeFrame(raw: unknown, fromId: string, peers: readonly RelayPeer[]): boolean {
  const frame = parseClientFrame(raw);
  if (!frame) return false;
  const out = JSON.stringify({ t: 'msg', from: fromId, data: frame.data } satisfies ServerFrame);
  for (const peer of peers) {
    if (peer.id === fromId) continue;
    if (frame.to !== undefined && peer.id !== frame.to) continue;
    sendIfOpen(peer, out);
  }
  return true;
}
