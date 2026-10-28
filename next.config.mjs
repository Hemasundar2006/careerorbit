import 'dotenv/config';

const apiOrigin = (process.env.API_ORIGIN || 'https://careerorbit-yef6.onrender.com').replace(/\/+$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
