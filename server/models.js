const mongoose = require('mongoose');

const CATEGORIES = [
  'Central Govt Job', 'State Govt Job', 'Private/IT Job',
  'Internship', 'Hackathon', 'Scholarship',
];

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: CATEGORIES },
  organization: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  eligibility: { type: String, required: true, trim: true },
  ageLimit: { type: String, required: true, trim: true },
  startDate: { type: String, required: true },
  lastDate: { type: String, required: true },
  importantDates: { type: String, default: '' },
  applicationFee: { type: String, required: true, trim: true },
  applyLink: { type: String, required: true },
  notificationLink: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

postSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
postSchema.index({ category: 1, expiresAt: 1, createdAt: -1 });
postSchema.index({ title: 'text', organization: 'text', location: 'text' });

const adminSchema = new mongoose.Schema({
  _id: { type: String, default: 'primary' },
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  sessionVersion: { type: String, required: true },
}, { timestamps: true });

module.exports = {
  CATEGORIES,
  Post: mongoose.models.Post || mongoose.model('Post', postSchema),
  Admin: mongoose.models.Admin || mongoose.model('Admin', adminSchema),
};
