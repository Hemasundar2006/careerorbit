require('dotenv').config();
const dns = require('node:dns');

if (process.env.MONGODB_DNS_SERVERS) {
  dns.setServers(process.env.MONGODB_DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean));
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required. See .env.example.`);
  return value;
}

module.exports = { required };
