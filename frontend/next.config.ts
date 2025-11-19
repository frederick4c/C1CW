import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
      {
        source: '/health',
        destination: 'http://backend:8000/health',
      },
      {
        source: '/upload',
        destination: 'http://backend:8000/upload',
      },
    ];
  },
};

export default nextConfig;
