import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow larger body sizes for image uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // Image domains for optimization (if using external images)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
    ],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/generated/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
