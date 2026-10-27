import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getDeck } from '../lib/decks';
import { commitFor, computeStats, displayNames, tiltOf } from '../lib/game';

test('numeric stats ignore abstentions and report low, high, average', () => {
  const stats = computeStats(getDeck('fibonacci'), ['3', '5', '13', 'coffee']);
  assert.equal(stats.low, '3');
  assert.equal(stats.high, '13');
  assert.equal(stats.avg, 7);
  assert.equal(stats.counted, 3);
  assert.equal(stats.consensus, false);
  assert.deepEqual(
    stats.tally.map((entry) => entry.value),
    ['3', '5', '13', 'coffee'],
  );
});

test('the half card counts as 0.5 and sorts between 0 and 1', () => {
  const stats = computeStats(getDeck('modified'), ['½', '1', '0']);
  assert.equal(stats.low, '0');
  assert.equal(stats.avg, 0.5);
  assert.deepEqual(
    stats.tally.map((entry) => entry.value),
    ['0', '½', '1'],
  );
});

test('t-shirt sizes are ordered by size and have no average', () => {
  const stats = computeStats(getDeck('tshirt'), ['XL', 'S', 'M']);
  assert.equal(stats.low, 'S');
  assert.equal(stats.high, 'XL');
  assert.equal(stats.avg, null);
});

test('consensus needs two identical votes and ignores abstentions', () => {
  const deck = getDeck('fibonacci');
  assert.equal(computeStats(deck, ['8', '8', 'coffee']).consensus, true);
  assert.equal(computeStats(deck, ['8']).consensus, false);
  assert.equal(computeStats(deck, ['coffee', 'coffee']).low, null);
});

test('equal names are numbered in join order, case-insensitively', () => {
  const names = displayNames([
    { cid: 'c', name: 'Sam', joinedAt: 3 },
    { cid: 'a', name: 'Sam', joinedAt: 1 },
    { cid: 'b', name: 'sam', joinedAt: 2 },
    { cid: 'd', name: 'Kim', joinedAt: 4 },
  ]);
  assert.deepEqual(names, { a: 'Sam', b: 'sam 2', c: 'Sam 3', d: 'Kim' });
});

test('a commitment depends on round, player, value and salt', () => {
  const base = commitFor(1, 'cid', '5', 'salt');
  assert.equal(base, commitFor(1, 'cid', '5', 'salt'));
  for (const other of [
    commitFor(2, 'cid', '5', 'salt'),
    commitFor(1, 'x', '5', 'salt'),
    commitFor(1, 'cid', '8', 'salt'),
  ]) {
    assert.notEqual(base, other);
  }
});

test('the card tilt stays within three degrees', () => {
  for (const commit of ['0000', 'ffff', '8000', 'abcd']) {
    assert.ok(Math.abs(tiltOf(commit)) <= 3);
  }
});
