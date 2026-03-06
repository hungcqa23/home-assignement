import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@photo-app/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
