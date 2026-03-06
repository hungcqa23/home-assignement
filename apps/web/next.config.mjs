/** @type {import('next').NextConfig} */
const nextConfig = {
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
