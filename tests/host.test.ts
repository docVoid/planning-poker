import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HostElection } from '../lib/host';
import { Roster } from '../lib/roster';

function rosterWith(...members: [cid: string, joinedAt: number][]): Roster {
  const [[selfCid, selfJoinedAt], ...others] = members;
  const roster = new Roster(selfCid, selfCid, selfJoinedAt);
  for (const [cid, joinedAt] of others) roster.upsert(cid, cid, joinedAt, 0);
  return roster;
}

test('the earliest member becomes the successor, ties go to the smaller id', () => {
  const election = new HostElection('gone');
  assert.deepEqual(election.electFrom(rosterWith(['b', 2], ['c', 2], ['a', 3]).all()), { hostCid: 'b', hostEpoch: 1 });
});

test('every client elects the same successor from the same members', () => {
  const left = rosterWith(['x', 5], ['y', 1], ['z', 3]);
  const right = rosterWith(['z', 3], ['x', 5], ['y', 1]);
  assert.deepEqual(new HostElection(null).electFrom(left.all()), new HostElection(null).electFrom(right.all()));
});

test('a higher epoch wins, equal epochs resolve to the smaller id', () => {
  const election = new HostElection('m');
  election.adopt('z', 1);
  assert.equal(election.cid, 'z');
  election.adopt('a', 1);
  assert.equal(election.cid, 'a');
  election.adopt('b', 0);
  assert.equal(election.cid, 'a');
});

test('the roster never removes its own member and reports silent peers', () => {
  const roster = new Roster('me', 'Me', 0);
  roster.upsert('quiet', 'Quiet', 1, 0);
  assert.equal(roster.remove('me'), false);
  assert.deepEqual(roster.silentSince(20_000, 10_000), ['quiet']);
  roster.touch('quiet', 19_000);
  assert.deepEqual(roster.silentSince(20_000, 10_000), []);
});

test('a newcomer joins after everyone else regardless of its clock', () => {
  const roster = new Roster('me', 'Me', 100);
  roster.upsert('early', 'Early', 5_000, 0);
  roster.joinAfterEveryoneElse();
  assert.equal(roster.me.joinedAt, 5_001);
});
