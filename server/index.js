const mongoose = require('mongoose');
const app = require('./app');
const { Post } = require('./models');
const { required } = require('./config');

async function start() {
  if (required('SESSION_SECRET').length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.');
  await mongoose.connect(required('MONGODB_URI'), { dbName: 'opportunity_hub' });
  await Post.createIndexes();
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Could not start API:', error.message);
  process.exitCode = 1;
});
