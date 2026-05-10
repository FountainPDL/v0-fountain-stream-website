/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Capacitor/mobile builds
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Configure for mobile
  reactStrictMode: true,
  swcMinify: true,

  // Allow external images from TMDB
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },

  // Webpack configuration for mobile compatibility
  webpack: (config, { dev, isServer }) => {
    return config;
  },

  // Headers for mobile apps
  async headers() {
    return [
      {
        source: '/:path*',
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

module.exports = nextConfig;
