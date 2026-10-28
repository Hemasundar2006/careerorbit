const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Post } = require('./models');
const { postInput } = require('./validation');

const sample = {
  title: 'Example internship 2026', category: 'Internship', organization: 'Example Org',
  location: 'Remote', eligibility: 'B.Tech students', ageLimit: 'No age limit',
  startDate: '2026-10-28', lastDate: '2026-11-15', importantDates: '',
  applicationFee: 'Free / ₹0', applyLink: 'https://example.org/apply', notificationLink: '',
};

test('valid post gets its expiry at the end of the last date in IST', () => {
  const result = postInput.parse(sample);
  assert.equal(result.expiresAt.toISOString(), '2026-11-15T18:30:00.000Z');
});

test('invalid dates and unsafe links cannot be published', () => {
  assert.equal(postInput.safeParse({ ...sample, lastDate: '2026-02-30' }).success, false);
  assert.equal(postInput.safeParse({ ...sample, lastDate: '2026-10-20' }).success, false);
  assert.equal(postInput.safeParse({ ...sample, applyLink: 'javascript:alert(1)' }).success, false);
});

test('MongoDB has a TTL index for automatic deletion', () => {
  assert.ok(Post.schema.indexes().some(([keys, options]) => keys.expiresAt === 1 && options.expireAfterSeconds === 0));
});
