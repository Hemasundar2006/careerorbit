const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Admin, Post, CATEGORIES } = require('./models');
const { postInput } = require('./validation');
const { required } = require('./config');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());

const COOKIE_NAME = 'opportunity_admin';
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function postView(post) {
  return {
    id: String(post._id),
    title: post.title,
    category: post.category,
    organization: post.organization,
    location: post.location,
    eligibility: post.eligibility,
    ageLimit: post.ageLimit,
    startDate: post.startDate,
    lastDate: post.lastDate,
    importantDates: post.importantDates,
    applicationFee: post.applicationFee,
    applyLink: post.applyLink,
    notificationLink: post.notificationLink,
    createdAt: post.createdAt,
  };
}

async function requireAdmin(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Please sign in.' });
    const payload = jwt.verify(token, required('SESSION_SECRET'), { algorithms: ['HS256'] });
    if (payload.sub !== 'primary') return res.status(401).json({ error: 'Please sign in.' });
    const admin = await Admin.findById('primary').lean();
    if (!admin || payload.ver !== admin.sessionVersion) return res.status(401).json({ error: 'Please sign in.' });
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in.' });
  }
}

function requireJson(req, res, next) {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Send JSON.' });
  next();
}

function validId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Post not found.' });
  next();
}

const active = () => ({ expiresAt: { $gt: new Date() } });

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/categories', (_req, res) => res.json({ categories: CATEGORIES }));

app.get('/api/posts', asyncRoute(async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : '';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const page = Math.min(1000, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
  const limit = 12;
  const filter = active();
  if (category && CATEGORIES.includes(category)) filter.category = category;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [{ title: new RegExp(escaped, 'i') }, { organization: new RegExp(escaped, 'i') }, { location: new RegExp(escaped, 'i') }];
  }
  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Post.countDocuments(filter),
  ]);
  res.json({ posts: posts.map(postView), total, page, pages: Math.ceil(total / limit) });
}));

app.get('/api/stats', asyncRoute(async (_req, res) => {
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [total, closingSoon, grouped] = await Promise.all([
    Post.countDocuments({ expiresAt: { $gt: now } }),
    Post.countDocuments({ expiresAt: { $gt: now, $lte: soon } }),
    Post.aggregate([
      { $match: { expiresAt: { $gt: now } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);
  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, 0]));
  for (const item of grouped) byCategory[item._id] = item.count;
  res.json({ total, closingSoon, byCategory });
}));

app.get('/api/posts/:id', validId, asyncRoute(async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, ...active() }).lean();
  if (!post) return res.status(404).json({ error: 'Post not found or deadline passed.' });
  res.json({ post: postView(post) });
}));

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false });
app.post('/api/auth/login', loginLimiter, requireJson, asyncRoute(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const admin = await Admin.findById('primary');
  if (!admin || email !== admin.email || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  const token = jwt.sign({ sub: 'primary', ver: admin.sessionVersion }, required('SESSION_SECRET'), { expiresIn: '12h', algorithm: 'HS256' });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 12 * 60 * 60 * 1000 });
  res.json({ admin: { email: admin.email } });
}));

app.get('/api/auth/me', requireAdmin, (req, res) => res.json({ admin: { email: req.admin.email } }));
app.post('/api/auth/logout', requireAdmin, (_req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.json({ ok: true });
});

app.get('/api/admin/posts', requireAdmin, asyncRoute(async (_req, res) => {
  const posts = await Post.find(active()).sort({ createdAt: -1 }).lean();
  res.json({ posts: posts.map(postView), total: posts.length });
}));

app.post('/api/admin/posts', requireAdmin, requireJson, asyncRoute(async (req, res) => {
  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please check the form.', fields: parsed.error.flatten().fieldErrors });
  if (parsed.data.expiresAt <= new Date()) return res.status(400).json({ error: 'The last date must be today or later.' });
  const post = await Post.create(parsed.data);
  res.status(201).json({ post: postView(post) });
}));

app.put('/api/admin/posts/:id', requireAdmin, requireJson, validId, asyncRoute(async (req, res) => {
  const parsed = postInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please check the form.', fields: parsed.error.flatten().fieldErrors });
  if (parsed.data.expiresAt <= new Date()) return res.status(400).json({ error: 'The last date must be today or later.' });
  const post = await Post.findByIdAndUpdate(req.params.id, parsed.data, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ error: 'Post not found.' });
  res.json({ post: postView(post) });
}));

app.delete('/api/admin/posts/:id', requireAdmin, validId, asyncRoute(async (req, res) => {
  const deleted = await Post.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Post not found.' });
  res.json({ ok: true });
}));

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'Invalid JSON.' });
  console.error(error);
  return res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

module.exports = app;
