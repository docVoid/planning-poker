import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PeerDirectory } from '../lib/peer-directory';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('a reconnect under a new peer id cancels the pending removal', async () => {
  const peers = new PeerDirectory();
  let removed = false;
  peers.bind('old', 'anna');
  assert.equal(peers.unbind('old'), 'anna');
  peers.scheduleRemoval('anna', 20, () => (removed = true));
  peers.bind('new', 'anna');
  await sleep(40);
  assert.equal(removed, false);
  assert.equal(peers.isConnected('anna'), true);
});

test('a scheduled removal fires when nobody reconnects', async () => {
  const peers = new PeerDirectory();
  let removed = false;
  peers.scheduleRemoval('anna', 10, () => (removed = true));
  await sleep(30);
  assert.equal(removed, true);
});

test('a kicked player is ignored until a fresh join or the grace period ends', () => {
  const peers = new PeerDirectory();
  peers.ignore('ben', 1000);
  assert.equal(peers.shouldIgnore('ben', 500, false), true);
  assert.equal(peers.shouldIgnore('ben', 500, true), false);
  assert.equal(peers.shouldIgnore('ben', 500, false), false);
  peers.ignore('ben', 1000);
  assert.equal(peers.shouldIgnore('ben', 1000, false), false);
});

test('forgetting a player drops all of its connections', () => {
  const peers = new PeerDirectory();
  peers.bind('p1', 'anna');
  peers.bind('p2', 'anna');
  peers.forget('anna');
  assert.equal(peers.isConnected('anna'), false);
});
