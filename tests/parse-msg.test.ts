import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseMsg } from '../lib/parse-msg';

const envelope = { v: 1, from: 'abcd' };

test('valid messages are accepted unchanged', () => {
  const commit = { ...envelope, t: 'vote-commit', round: 2, commit: 'ff', icon: 'leaf' };
  assert.deepEqual(parseMsg(commit), commit);
  assert.deepEqual(parseMsg({ ...envelope, t: 'leave' }), { ...envelope, t: 'leave' });
});

test('presence messages keep their optional vote state', () => {
  const join = {
    ...envelope,
    t: 'join',
    name: 'Ana',
    joinedAt: 5,
    round: 0,
    commit: null,
    icon: null,
    reveal: { value: '5', salt: 'aa' },
  };
  assert.deepEqual(parseMsg(join), join);
});

test('unknown types, wrong versions and missing senders are rejected', () => {
  assert.equal(parseMsg({ ...envelope, t: 'explode' }), null);
  assert.equal(parseMsg({ v: 2, from: 'a', t: 'leave' }), null);
  assert.equal(parseMsg({ v: 1, t: 'leave' }), null);
  assert.equal(parseMsg(null), null);
  assert.equal(parseMsg('leave'), null);
});

test('malformed fields are rejected', () => {
  assert.equal(parseMsg({ ...envelope, t: 'reset', round: -1 }), null);
  assert.equal(parseMsg({ ...envelope, t: 'reset', round: 1.5 }), null);
  assert.equal(parseMsg({ ...envelope, t: 'vote-commit', round: 1, commit: 'ff', icon: 'bomb' }), null);
  assert.equal(parseMsg({ ...envelope, t: 'reveal', round: 1, value: 'x'.repeat(50), salt: 'aa' }), null);
  assert.equal(
    parseMsg({
      ...envelope,
      t: 'config',
      config: { name: 'Room', deck: 'nope' },
      hostCid: 'a',
      hostEpoch: 0,
      round: 0,
    }),
    null,
  );
});
