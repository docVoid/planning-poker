import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { showShareSheet } from '../lib/share';

const payload = { title: 'Room', text: 'Join', url: 'https://example.com/room/3f9a1c07' };

function stubNavigatorShare(share: (data: typeof payload) => Promise<void>) {
  Object.defineProperty(globalThis, 'navigator', { value: { share }, configurable: true });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'navigator');
});

test('a completed share counts as shown', async () => {
  stubNavigatorShare(async () => {});
  assert.equal(await showShareSheet(payload), true);
});

test('dismissing the share sheet counts as shown, so no fallback opens', async () => {
  stubNavigatorShare(async () => {
    throw new DOMException('dismissed', 'AbortError');
  });
  assert.equal(await showShareSheet(payload), true);
});

test('a failing share sheet reports that it was not shown', async () => {
  stubNavigatorShare(async () => {
    throw new DOMException('blocked', 'NotAllowedError');
  });
  assert.equal(await showShareSheet(payload), false);
});
