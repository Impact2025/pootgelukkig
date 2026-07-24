import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pootgelukkig.nl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/auth', '/dashboard', '/profiel', '/dossier', '/nazorg', '/chat', '/favorieten'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
