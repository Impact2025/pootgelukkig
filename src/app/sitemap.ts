import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CATEGORIEEN, ARTIKELEN } from '@/lib/kennisbank/content'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; bijgewerktOp: Date | null }[] = []
  try {
    posts = await db
      .select({ slug: blogPosts.slug, bijgewerktOp: blogPosts.bijgewerktOp })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'gepubliceerd'))
      .orderBy(desc(blogPosts.gepubliceerdOp))
  } catch {
    // DB onbereikbaar: sitemap met statische + kennisbank-routes blijft geldig
  }

  const statisch: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/werkwijze`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/voor-asielen`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/prijzen`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${APP_URL}/ai-assistent`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/over-ons`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/kennisbank`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${APP_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${APP_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${APP_URL}/zoeken`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${APP_URL}/intake`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const artikelen: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${APP_URL}/blog/${p.slug}`,
    lastModified: p.bijgewerktOp ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const kennisCategorieen: MetadataRoute.Sitemap = CATEGORIEEN.map((c) => ({
    url: `${APP_URL}/kennisbank/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const kennisArtikelen: MetadataRoute.Sitemap = ARTIKELEN.map((a) => ({
    url: `${APP_URL}/kennisbank/${a.categorieSlug}/${a.slug}`,
    lastModified: new Date(a.bijgewerkt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...statisch, ...artikelen, ...kennisCategorieen, ...kennisArtikelen]
}
