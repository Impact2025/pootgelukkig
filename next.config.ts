import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.vercel-storage.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: '*.public.blob.vercel-storage.com' },
      { hostname: 'localhost' },
    ],
  },
  serverExternalPackages: ['@neondatabase/serverless'],
}

export default nextConfig
