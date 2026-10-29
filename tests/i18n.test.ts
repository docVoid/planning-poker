import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatNumber, isLang } from '../lib/i18n';

test('numbers use the decimal separator of the language and at most one decimal', () => {
  assert.equal(formatNumber(5.25, 'en'), '5.3');
  assert.equal(formatNumber(5.25, 'de'), '5,3');
  assert.equal(formatNumber(8, 'en'), '8');
});

test('only supported languages are accepted', () => {
  assert.equal(isLang('de'), true);
  assert.equal(isLang('fr'), false);
});
