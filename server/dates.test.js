const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isValidDateOnly, expiresAtFor } = require('./dates');

test('validates calendar dates', () => {
  assert.equal(isValidDateOnly('2026-02-28'), true);
  assert.equal(isValidDateOnly('2026-02-30'), false);
  assert.equal(isValidDateOnly('2026-02-29'), false);
});

test('expires after the final day in India', () => {
  assert.equal(expiresAtFor('2026-10-28').toISOString(), '2026-10-28T18:30:00.000Z');
});
