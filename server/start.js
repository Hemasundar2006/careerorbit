// One-process production entry point for a Node.js host.
process.env.NODE_ENV = 'production';
require('dotenv').config();

const http = require('node:http');
const next = require('next');
const mongoose = require('mongoose');
const api = require('./app');
const { Post } = require('./models');
const { required } = require('./config');

async function start() {
  if (required('SESSION_SECRET').length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  const port = Number(process.env.PORT || 3000);
  const web = next({ dev: false, port, hostname: '0.0.0.0' });
  await mongoose.connect(required('MONGODB_URI'), { dbName: 'opportunity_hub' });
  await Post.createIndexes();
  await web.prepare();
  const handle = web.getRequestHandler();
  http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) return api(request, response);
    return handle(request, response);
  }).listen(port, '0.0.0.0', () => console.log(`CareerOrbit ready on port ${port}`));
}

start().catch((error) => {
  console.error('Could not start CareerOrbit:', error.message);
  process.exitCode = 1;
});
