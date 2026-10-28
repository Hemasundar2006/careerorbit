const { z } = require('zod');
const { CATEGORIES } = require('./models');
const { isValidDateOnly, expiresAtFor } = require('./dates');

const safeUrl = z.string().trim().url().max(2000).refine((value) => /^https:\/\//i.test(value), 'Use an HTTPS URL');
const dateOnly = z.string().refine(isValidDateOnly, 'Use a valid date');

const postInput = z.object({
  title: z.string().trim().min(3).max(180),
  category: z.enum(CATEGORIES),
  organization: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  eligibility: z.string().trim().min(2).max(500),
  ageLimit: z.string().trim().min(2).max(300),
  startDate: dateOnly,
  lastDate: dateOnly,
  importantDates: z.string().trim().max(1000).default(''),
  applicationFee: z.string().trim().min(1).max(300),
  applyLink: safeUrl,
  notificationLink: z.union([safeUrl, z.literal('')]).default(''),
}).refine((post) => post.lastDate >= post.startDate, {
  message: 'Last date must be on or after the start date',
  path: ['lastDate'],
}).transform((post) => ({ ...post, expiresAt: expiresAtFor(post.lastDate) }));

module.exports = { postInput };
