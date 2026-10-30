const { z } = require('zod');
const { CATEGORIES } = require('./models');
const { isValidDateOnly, expiresAtFor } = require('./dates');

const safeUrl = z.string().trim().url().max(2000).refine((value) => /^https:\/\//i.test(value), 'Use an HTTPS URL');
const dateOnly = z.string().refine(isValidDateOnly, 'Use a valid date');
const detailText = z.string().trim().max(300).default('');
const detailsInput = z.object({
  stipend: detailText, duration: detailText, workType: detailText, skills: detailText, joiningDate: detailText,
  theme: detailText, teamSize: detailText, prize: detailText, eventDate: detailText,
  awardAmount: detailText, incomeLimit: detailText, academicYear: detailText, studyLevel: detailText,
}).partial().default({});

const DETAIL_KEYS = {
  Internship: ['stipend', 'duration', 'workType', 'skills', 'joiningDate'],
  Hackathon: ['theme', 'teamSize', 'prize', 'eventDate'],
  Scholarship: ['awardAmount', 'incomeLimit', 'academicYear', 'studyLevel'],
};

const postInput = z.object({
  title: z.string().trim().min(3).max(180),
  category: z.enum(CATEGORIES),
  organization: z.string().trim().min(2).max(120),
  location: z.string().trim().min(2).max(120),
  eligibility: z.string().trim().min(2).max(500),
  eligibilityTags: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  ageLimit: z.string().trim().max(300).default(''),
  startDate: dateOnly,
  lastDate: dateOnly,
  importantDates: z.string().trim().max(1000).default(''),
  applicationFee: z.string().trim().min(1).max(300),
  applyLink: safeUrl,
  notificationLink: z.union([safeUrl, z.literal('')]).default(''),
  details: detailsInput,
}).refine((post) => post.lastDate >= post.startDate, {
  message: 'Last date must be on or after the start date',
  path: ['lastDate'],
}).refine((post) => !post.category.includes('Job') || post.ageLimit.length >= 2, {
  message: 'Age limit is required for jobs',
  path: ['ageLimit'],
}).transform((post) => {
  const allowed = DETAIL_KEYS[post.category] || [];
  const details = Object.fromEntries(Object.entries(post.details).filter(([key, value]) => allowed.includes(key) && value));
  return { ...post, ageLimit: post.ageLimit || 'Not specified', details, expiresAt: expiresAtFor(post.lastDate) };
});

module.exports = { postInput };
