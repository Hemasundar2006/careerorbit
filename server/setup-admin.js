const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');
const { Admin } = require('./models');
const { required } = require('./config');

async function setup() {
  const email = required('ADMIN_EMAIL').trim().toLowerCase();
  const password = required('ADMIN_PASSWORD');
  if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
  if (required('SESSION_SECRET').length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  await mongoose.connect(required('MONGODB_URI'), { dbName: 'opportunity_hub' });
  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.findByIdAndUpdate('primary', { email, passwordHash, sessionVersion: randomUUID() }, { upsert: true, runValidators: true });
  console.log(`Admin account ready for ${email}. Remove ADMIN_PASSWORD from .env after setup.`);
  await mongoose.disconnect();
}

setup().catch((error) => {
  console.error('Admin setup failed:', error.message);
  process.exitCode = 1;
});
