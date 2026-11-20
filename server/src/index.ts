import { DurableObject } from 'cloudflare:workers';
import {
  MAX_FRAME_CHARS,
  PING,
  PONG,
  announceJoin,
  announceLeave,
  routeFrame,
  type RelayPeer,
} from '../../lib/relay-room';

interface Env {
  ROOM: DurableObjectNamespace<Room>;
  ALLOWED_ORIGINS?: string;
}

const ROOM_PATH = /^\/room\/([0-9a-f]{8})$/;
const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function originAllowed(origin: string | null, env: Env): boolean {
  const allowed = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  return origin !== null && (allowed.includes(origin) || LOCAL_ORIGIN.test(origin));
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/health') return new Response('ok');

    const match = ROOM_PATH.exec(url.pathname);
    if (!match) return new Response('Not found', { status: 404 });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
    if (!originAllowed(request.headers.get('Origin'), env)) return new Response('Forbidden', { status: 403 });

    return env.ROOM.get(env.ROOM.idFromName(match[1])).fetch(request);
  },
} satisfies ExportedHandler<Env>;

export class Room extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
  }

  override async fetch(): Promise<Response> {
    const { 0: client, 1: server } = new WebSocketPair();
    const id = crypto.randomUUID();
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ id });
    announceJoin(id, this.peers());
    return new Response(null, { status: 101, webSocket: client });
  }

  override webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    if (typeof message !== 'string' || message.length > MAX_FRAME_CHARS) {
      ws.close(1009, 'Frame rejected');
      return;
    }
    routeFrame(message, this.idOf(ws), this.peers());
  }

  override webSocketClose(ws: WebSocket): void {
    this.drop(ws);
  }

  override webSocketError(ws: WebSocket): void {
    this.drop(ws);
  }

  private drop(ws: WebSocket): void {
    try {
      ws.close(1000);
    } catch {
      return;
    }
    announceLeave(
      this.idOf(ws),
      this.peers().filter((peer) => peer.id !== this.idOf(ws)),
    );
  }

  private idOf(ws: WebSocket): string {
    return (ws.deserializeAttachment() as { id: string }).id;
  }

  private peers(): RelayPeer[] {
    return this.ctx.getWebSockets().map((ws) => ({ id: this.idOf(ws), send: (frame) => ws.send(frame) }));
  }
}
