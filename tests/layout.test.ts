import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chunk, handCardWidth, layoutSeats } from '../lib/layout';

test('twelve players fit a desktop table in two rows without overflowing', () => {
  const layout = layoutSeats(1376, 500, 12, false);
  assert.equal(layout.cols, 6);
  assert.ok(layout.cardW >= 70);
  const rowWidth = layout.cols * layout.seatW + (layout.cols - 1) * layout.gapX;
  assert.ok(rowWidth <= 1376);
});

test('a few players share one row with large cards', () => {
  const layout = layoutSeats(1376, 500, 3, false);
  assert.equal(layout.cols, 3);
  assert.equal(layout.cardW, 104);
});

test('cards shrink on a phone but never below the minimum', () => {
  const layout = layoutSeats(366, 380, 12, true);
  assert.ok(layout.cardW >= 28 && layout.cardW <= 78);
});

test('an unmeasured table falls back to a single row', () => {
  assert.equal(layoutSeats(0, 0, 5, false).cols, 5);
});

test('chunk splits into rows of the given size', () => {
  assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
});

test('the hand fits all cards in one row', () => {
  const width = handCardWidth(1200, 160, 12, 12);
  assert.ok(width * 12 + 11 * 12 <= 1200);
  assert.ok(width <= 88);
});
