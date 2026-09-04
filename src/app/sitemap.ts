import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { CATEGORIEEN, ARTIKELEN } from '@/lib/kennisbank/content'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl'

// ISR i.p.v. force-dynamic: de sitemap wordt gecachet en elk uur ververst.
// Zo krijgt Googlebot altijd een snelle, volledige sitemap i.p.v. een verse
// (mogelijk falende/trage) DB-call bij elke crawl.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: { slug: string; bijgewerktOp: Date | null }[] = []
  try {
    posts = await db
      .select({ slug: blogPosts.slug, bijgewerktOp: blogPosts.bijgewerktOp })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'gepubliceerd'))
      .orderBy(desc(blogPosts.gepubliceerdOp))
  } catch {
    // DB onbereikbaar: statische routes blijven geldig
  }
  // Dossiers en organisaties zijn vertrouwelijke gegevens (geen publieke detailpagina's
  // meer zoals de vroegere /animals en /asielen), dus die staan niet in de sitemap.

  const nu = new Date()
  const dertigDagenGeleden = new Date(nu.getTime() - 30 * 24 * 60 * 60 * 1000)

  const statisch: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/kennisbank`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/voor-organisaties`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/werkwijze`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/tarieven`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/faq`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_URL}/over-ons`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    // /ai-assistent en /demo-aanvragen zijn permanente redirects (zie next.config.ts),
    // /intake vereist login (307 → /auth/login) — geen van drie is indexeerbaar content.
    // Nooit loginmuren of redirect-stubs in de sitemap zetten.
  ]

  const artikelen: MetadataRoute.Sitemap = posts.map((p) => {
    const isRecent = p.bijgewerktOp && new Date(p.bijgewerktOp) > dertigDagenGeleden
    return {
      url: `${APP_URL}/blog/${p.slug}`,
      lastModified: p.bijgewerktOp ?? undefined,
      changeFrequency: isRecent ? 'weekly' : 'monthly',
      priority: isRecent ? 0.9 : 0.8,
    }
  })

  const kennisCategorieen: MetadataRoute.Sitemap = CATEGORIEEN.map((c) => ({
    url: `${APP_URL}/kennisbank/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const kennisArtikelen: MetadataRoute.Sitemap = ARTIKELEN.map((a) => ({
    url: `${APP_URL}/kennisbank/${a.categorieSlug}/${a.slug}`,
    lastModified: new Date(a.bijgewerkt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    ...statisch,
    ...artikelen,
    ...kennisCategorieen,
    ...kennisArtikelen,
  ]
}
