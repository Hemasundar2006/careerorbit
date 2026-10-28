import 'dotenv/config';

const apiOrigin = process.env.API_ORIGIN || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  },
};

export default nextConfig;
