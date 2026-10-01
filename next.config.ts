import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Add your IPFS gateway when you go on-chain, e.g.:
      // { protocol: 'https', hostname: 'ipfs.io' },
    ],
  },
};

export default nextConfig;
