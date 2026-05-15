/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    qualities: [75, 85],
  },
 
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
