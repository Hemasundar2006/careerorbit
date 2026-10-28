require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required. See .env.example.`);
  return value;
}

module.exports = { required };
