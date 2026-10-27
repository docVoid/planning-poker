import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { RoomSession, type Timing } from '../lib/session';
import type { RoomSnapshot } from '../lib/snapshot';
import type { SavedVote } from '../lib/vote-storage';
import { sha256Hex } from '../lib/sha256';
import { createHub } from './memory-transport';

const TIMING: Partial<Timing> = {
  heartbeatMs: 80,
  peerTimeoutMs: 500,
  peerLeaveGraceMs: 80,
  notFoundMs: 250,
  notFoundExtendMs: 250,
  countdownMs: 40,
  revealTimeoutMs: 200,
  tickMs: 40,
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const CONFIG = { name: 'Sprint', deck: 'fibonacci' as const };
const id = (c: string) => c.repeat(16);

function client(hub: ReturnType<typeof createHub>, cid: string, name: string, create = false) {
  const t = hub.transport();
  let snap!: RoomSnapshot;
  const session = new RoomSession({
    code: 'abcd1234',
    selfCid: cid,
    name,
    transport: t,
    createConfig: create ? CONFIG : undefined,
    onChange: (s) => (snap = s),
    timing: TIMING,
  });
  session.start();
  return {
    session,
    t,
    get snap() {
      return snap;
    },
  };
}

async function until(cond: () => boolean, ms = 2500) {
  const end = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > end) throw new Error('timeout waiting for condition');
    await sleep(10);
  }
}

test('sha256 matches node crypto', () => {
  for (const s of ['', 'abc', '5:cid:13:salt', 'x'.repeat(1000), 'äöü½']) {
    assert.equal(sha256Hex(s), createHash('sha256').update(s).digest('hex'));
  }
});

test('join gets config, votes are secret until everybody voted, then verified reveal', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  const b = client(hub, id('b'), 'Ben');
  await until(() => b.snap.status === 'ready' && b.snap.seats.length === 2 && a.snap.seats.length === 2);
  assert.equal(b.snap.config?.name, 'Sprint');
  assert.equal(a.snap.isHost, true);
  assert.equal(b.snap.isHost, false);

  a.session.vote('5');
  await until(() => b.snap.seats.find((s) => s.name === 'Anna')?.voted === true);
  assert.equal(b.snap.phase, 'voting');
  assert.ok(!hub.log.some((l) => l.msg.t === 'reveal'), 'no reveal before all voted');
  const commits = hub.log.filter((l) => l.msg.t === 'vote-commit');
  assert.ok(commits.length > 0);
  assert.ok(commits.every((l) => !JSON.stringify(l.msg).includes('"5"')));
  assert.ok(b.snap.seats.every((s) => s.value === null));

  b.session.vote('13');
  await until(() => a.snap.phase === 'revealed' && b.snap.phase === 'revealed');
  const vals = (s: RoomSnapshot) => s.seats.map((x) => x.value).sort();
  assert.deepEqual(vals(a.snap), ['13', '5']);
  assert.deepEqual(vals(b.snap), ['13', '5']);
  assert.equal(a.snap.stats?.low, '5');
  assert.equal(a.snap.stats?.high, '13');
  assert.equal(a.snap.stats?.avg, 9);
  assert.equal(a.snap.stats?.consensus, false);

  a.session.vote('1');
  assert.equal(a.snap.myValue, '5', 'vote is fixed after reveal');
  a.session.leave();
  b.session.leave();
});

test('a reveal that does not match the commitment is flagged invalid', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  const b = client(hub, id('b'), 'Ben');
  await until(() => b.snap.status === 'ready' && a.snap.seats.length === 2);
  a.session.vote('5');
  await until(() => b.snap.seats.find((s) => !s.isSelf)?.voted === true);

  const realSend = b.t.send.bind(b.t);
  b.t.send = (msg, target) => {
    if (msg.t === 'reveal') msg = { ...msg, value: '13' };
    else if ((msg.t === 'heartbeat' || msg.t === 'join') && msg.reveal)
      msg = { ...msg, reveal: { ...msg.reveal, value: '13' } };
    realSend(msg, target);
  };
  b.session.vote('3');
  await until(() => a.snap.phase === 'revealed');
  const ben = a.snap.seats.find((s) => s.name === 'Ben')!;
  assert.equal(ben.invalid, true);
  assert.equal(ben.value, null);
  assert.equal(a.snap.stats?.counted, 1);
  a.session.leave();
  b.session.leave();
});

test('host leaves -> same successor everywhere; new host can reset and kick', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  const b = client(hub, id('b'), 'Ben');
  await until(() => b.snap.status === 'ready');
  const c = client(hub, id('c'), 'Cleo');
  await until(() => c.snap.status === 'ready' && a.snap.seats.length === 3 && b.snap.seats.length === 3);

  a.session.leave();
  await until(() => b.snap.seats.length === 2 && c.snap.seats.length === 2);
  await until(() => b.snap.hostCid === c.snap.hostCid && b.snap.hostCid !== id('a'));
  assert.equal(b.snap.hostCid, id('b'));
  assert.equal(b.snap.isHost, true);
  assert.equal(c.snap.isHost, false);

  c.session.kick(id('b'));
  c.session.newRound();
  await sleep(100);
  assert.equal(b.snap.seats.length, 2, 'non-host cannot kick');
  assert.equal(b.snap.round, 0, 'non-host cannot reset');

  b.session.vote('3');
  c.session.vote('3');
  await until(() => b.snap.phase === 'revealed' && c.snap.phase === 'revealed');
  assert.equal(b.snap.stats?.consensus, true);
  b.session.newRound();
  await until(() => c.snap.round === 1 && c.snap.phase === 'voting' && c.snap.myValue === null);
  assert.ok(c.snap.seats.every((s) => !s.voted));

  b.session.kick(id('c'));
  await until(() => c.snap.status === 'removed' && b.snap.seats.length === 1);
  b.session.leave();
});

test('crashed host (no leave message) is replaced after the grace period', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  const b = client(hub, id('b'), 'Ben');
  await until(() => b.snap.status === 'ready');
  const c = client(hub, id('c'), 'Cleo');
  await until(() => c.snap.status === 'ready' && a.snap.seats.length === 3 && b.snap.seats.length === 3);
  a.t.drop();
  await until(() => b.snap.seats.length === 2 && c.snap.seats.length === 2);
  await until(() => b.snap.hostCid === id('b') && c.snap.hostCid === id('b'));
  [a, b, c].forEach((x) => x.session.leave());
});

test('newcomer after reveal re-covers the table until they voted; leaving auto-reveals', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  const b = client(hub, id('b'), 'Ben');
  await until(() => b.snap.status === 'ready');
  a.session.vote('2');
  b.session.vote('8');
  await until(() => a.snap.phase === 'revealed' && b.snap.phase === 'revealed');

  const c = client(hub, id('c'), 'Cleo');
  await until(() => c.snap.status === 'ready' && a.snap.seats.length === 3);
  assert.equal(a.snap.phase, 'voting');
  assert.ok(a.snap.seats.every((s) => s.value === null));
  assert.equal(a.snap.locked, true, 'earlier voters stay locked');
  c.session.vote('5');
  await until(() => a.snap.phase === 'revealed' && c.snap.phase === 'revealed');
  assert.deepEqual(a.snap.seats.map((s) => s.value).sort(), ['2', '5', '8']);
  assert.deepEqual(c.snap.seats.map((s) => s.value).sort(), ['2', '5', '8']);

  a.session.newRound();
  await until(() => c.snap.round === 1 && b.snap.round === 1);
  a.session.vote('1');
  b.session.vote('1');
  await sleep(150);
  assert.equal(a.snap.phase, 'voting');
  c.session.leave();
  await until(() => a.snap.phase === 'revealed' && b.snap.phase === 'revealed');
  assert.equal(a.snap.stats?.consensus, true);
  a.session.leave();
  b.session.leave();
});

test('joining without anybody present ends in not-found', async () => {
  const hub = createHub();
  const x = client(hub, id('e'), 'Xena');
  assert.equal(x.snap.status, 'connecting');
  await until(() => x.snap.status === 'not-found', 3000);
});

test('duplicate names are numbered; abstain counts as vote but not in stats', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Sam', true);
  const b = client(hub, id('b'), 'sam');
  await until(() => b.snap.status === 'ready');
  const c = client(hub, id('c'), 'Sam');
  await until(() => a.snap.seats.length === 3 && c.snap.status === 'ready');
  assert.deepEqual(
    a.snap.seats.map((s) => s.name),
    ['Sam', 'sam 2', 'Sam 3'],
  );
  a.session.vote('coffee');
  b.session.vote('8');
  c.session.vote('8');
  await until(() => a.snap.phase === 'revealed');
  assert.equal(a.snap.stats?.counted, 2);
  assert.equal(a.snap.stats?.avg, 8);
  assert.equal(a.snap.stats?.consensus, true);
  [a, b, c].forEach((x) => x.session.leave());
});

test('reload with same cid replaces the old member', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  const b = client(hub, id('b'), 'Ben');
  await until(() => b.snap.status === 'ready');
  b.t.drop();
  const b2 = client(hub, id('b'), 'Ben');
  await until(() => b2.snap.status === 'ready');
  await sleep(400);
  assert.equal(a.snap.seats.length, 2);
  assert.deepEqual(
    a.snap.seats.map((s) => s.name),
    ['Anna', 'Ben'],
  );
  [a, b, b2].forEach((x) => x.session.leave());
});

test('own vote survives a reload (same tab storage) and is re-announced', async () => {
  const hub = createHub();
  const a = client(hub, id('a'), 'Anna', true);
  let saved: SavedVote | null = null;
  const storage = {
    load: () => saved,
    save: (v: SavedVote | null) => (saved = v),
  };
  const mk = () => {
    const t = hub.transport();
    let snap!: RoomSnapshot;
    const session = new RoomSession({
      code: 'abcd1234',
      selfCid: id('b'),
      name: 'Ben',
      transport: t,
      storage,
      onChange: (s) => (snap = s),
      timing: TIMING,
    });
    session.start();
    return {
      session,
      get snap() {
        return snap;
      },
    };
  };
  const b = mk();
  await until(() => b.snap.status === 'ready');
  b.session.vote('8');
  await until(() => a.snap.seats.find((s) => s.name === 'Ben')?.voted === true);
  b.session.leave();
  await until(() => a.snap.seats.length === 1);
  const b2 = mk();
  await until(() => b2.snap.status === 'ready' && b2.snap.myValue === '8');
  await until(() => a.snap.seats.find((s) => s.name === 'Ben')?.voted === true);
  a.session.vote('8');
  await until(() => a.snap.phase === 'revealed' && b2.snap.phase === 'revealed');
  assert.equal(a.snap.stats?.consensus, true);
  a.session.leave();
  b2.session.leave();
});
