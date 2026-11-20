import assert from 'node:assert/strict';
import { test } from 'node:test';
import { announceJoin, announceLeave, routeFrame, type RelayPeer } from '../lib/relay-room';
import { createRelayTransport } from '../lib/sync';

function createFakeRelay() {
  const peers: (RelayPeer & { socket: FakeSocket })[] = [];
  const sockets: FakeSocket[] = [];

  class FakeSocket {
    readyState = 0;
    onopen: (() => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    readonly id: string;

    constructor() {
      sockets.push(this);
      this.id = `c${sockets.length}`;
      setTimeout(() => {
        this.readyState = 1;
        peers.push({
          id: this.id,
          socket: this,
          send: (frame) => queueMicrotask(() => this.onmessage?.({ data: frame })),
        });
        this.onopen?.();
        announceJoin(this.id, peers);
      }, 0);
    }
    send(raw: string) {
      if (raw === 'ping') return queueMicrotask(() => this.onmessage?.({ data: 'pong' }));
      routeFrame(raw, this.id, peers);
    }
    close() {
      if (this.readyState === 3) return;
      this.readyState = 3;
      const index = peers.findIndex((peer) => peer.socket === this);
      if (index >= 0) peers.splice(index, 1);
      announceLeave(this.id, peers);
      queueMicrotask(() => this.onclose?.());
    }
  }

  const connect = (code: string) =>
    createRelayTransport(code, { baseUrl: 'ws://relay', createSocket: () => new FakeSocket() as unknown as WebSocket });
  return { connect, sockets };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

function listener() {
  const events: string[] = [];
  return {
    events,
    handlers: {
      onMessage: (message: unknown, from: string) => events.push(`msg:${from}:${JSON.stringify(message)}`),
      onPeerJoin: (id: string) => events.push(`join:${id}`),
      onPeerLeave: (id: string) => events.push(`leave:${id}`),
    },
  };
}

test('peers see each other, broadcast and targeted messages arrive', async () => {
  const relay = createFakeRelay();
  const a = relay.connect('abcd1234');
  const b = relay.connect('abcd1234');
  const c = relay.connect('abcd1234');
  const la = listener();
  const lb = listener();
  const lc = listener();
  await a.connect(la.handlers);
  await tick();
  await b.connect(lb.handlers);
  await tick();
  await c.connect(lc.handlers);
  await tick();

  assert.deepEqual(la.events, ['join:c2', 'join:c3']);
  assert.deepEqual(lc.events.slice().sort(), ['join:c1', 'join:c2']);

  a.send({ t: 'leave', v: 1, from: 'x' } as never);
  b.send({ t: 'leave', v: 1, from: 'y' } as never, 'c3');
  await tick();
  assert.ok(lb.events.some((e) => e.startsWith('msg:c1:')));
  assert.ok(lc.events.some((e) => e.startsWith('msg:c1:')));
  assert.ok(lc.events.some((e) => e.startsWith('msg:c2:')));
  assert.ok(!la.events.some((e) => e.startsWith('msg:c2:')));

  await b.disconnect();
  await tick();
  assert.ok(la.events.includes('leave:c2'));
  assert.ok(lc.events.includes('leave:c2'));
  await a.disconnect();
  await c.disconnect();
});

test('reconnect reports only the peers that really changed', async () => {
  const relay = createFakeRelay();
  const a = relay.connect('abcd1234');
  const b = relay.connect('abcd1234');
  const la = listener();
  await a.connect(la.handlers);
  await tick();
  await b.connect(listener().handlers);
  await tick();
  assert.deepEqual(la.events, ['join:c2']);

  relay.sockets[0].close();
  await new Promise((resolve) => setTimeout(resolve, 900));
  assert.deepEqual(la.events, ['join:c2']);
  assert.equal(relay.sockets.length, 3);
  await a.disconnect();
  await b.disconnect();
});

test('routeFrame drops malformed frames', () => {
  const sent: string[] = [];
  const peers: RelayPeer[] = [{ id: 'p', send: (f) => sent.push(f) }];
  assert.equal(routeFrame('not json', 'q', peers), false);
  assert.equal(routeFrame(JSON.stringify({ nodata: 1 }), 'q', peers), false);
  assert.equal(routeFrame(JSON.stringify({ to: 5, data: 1 }), 'q', peers), false);
  assert.equal(routeFrame('x'.repeat(20_000), 'q', peers), false);
  assert.deepEqual(sent, []);
});
