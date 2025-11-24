import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',
  async rewrites() {
    // Use localhost for client-side requests in Docker
    // The backend service is mapped to host's localhost:8000
    const apiUrl = 'http://localhost:8000';

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${apiUrl}/health`,
      },
      {
        source: '/status',
        destination: `${apiUrl}/status`,
      },
      {
        source: '/upload',
        destination: `${apiUrl}/upload`,
      },
      {
        source: '/train',
        destination: `${apiUrl}/train`,
      },
      {
        source: '/predict',
        destination: `${apiUrl}/predict`,
      },
    ];
  },
};

export default nextConfig;
