import type { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/auth', '/management', '/intake'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
