import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { hostname: '*.vercel-storage.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: '*.public.blob.vercel-storage.com' },
      { hostname: 'localhost' },
      { hostname: 'www.impactos.nl' },
      { hostname: 'impactos.nl' },
    ],
  },
  async rewrites() {
    return [{ source: '/blog/feed.xml', destination: '/blog/rss' }]
  },
  async redirects() {
    return [
      { source: '/ai-assistent', destination: '/#ai-collegas', permanent: true },
      { source: '/demo-aanvragen', destination: '/contact?onderwerp=demo', permanent: true },
      { source: '/voor-asielen', destination: '/voor-organisaties', permanent: true },
      { source: '/voor-asielen/start', destination: '/voor-organisaties/start', permanent: true },
    ]
  },
  serverExternalPackages: ['@neondatabase/serverless', 'pdf-parse'],
}

export default nextConfig
