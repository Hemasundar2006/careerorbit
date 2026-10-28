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

test('category fields are kept only for the selected form', () => {
  const internship = postInput.parse({ ...sample, ageLimit: '', details: { stipend: '₹15,000/month', theme: 'Unrelated theme' } });
  assert.equal(internship.ageLimit, 'Not specified');
  assert.deepEqual(internship.details, { stipend: '₹15,000/month' });

  const hackathon = postInput.parse({ ...sample, category: 'Hackathon', details: { teamSize: '2–4', prize: '₹1 lakh' } });
  assert.deepEqual(hackathon.details, { teamSize: '2–4', prize: '₹1 lakh' });

  const scholarship = postInput.parse({ ...sample, category: 'Scholarship', details: { awardAmount: '₹50,000', academicYear: '2026–27' } });
  assert.deepEqual(scholarship.details, { awardAmount: '₹50,000', academicYear: '2026–27' });
});

test('job posts still require an age limit', () => {
  assert.equal(postInput.safeParse({ ...sample, category: 'Central Govt Job', ageLimit: '' }).success, false);
});
