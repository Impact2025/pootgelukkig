export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

const APP_URL = 'https://www.pootgelukkig.nl'
const SITE_TITLE = 'PootGelukkig blog'
const SITE_DESC = 'Tips, verhalen en gidsen over het adopteren van asieldieren in Nederland.'

function escaped(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function GET() {
  let items: {
    titel: string
    slug: string
    excerpt: string | null
    gepubliceerdOp: Date | null
    leestijd: number | null
  }[] = []

  try {
    items = await db
      .select({
        titel: blogPosts.titel,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        gepubliceerdOp: blogPosts.gepubliceerdOp,
        leestijd: blogPosts.leestijd,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'gepubliceerd'))
      .orderBy(desc(blogPosts.gepubliceerdOp))
      .limit(50)
  } catch {
    return new Response('Feed tijdelijk niet beschikbaar', { status: 503 })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${escaped(SITE_TITLE)}</title>
  <link>${APP_URL}/blog</link>
  <description>${escaped(SITE_DESC)}</description>
  <language>nl</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <ttl>60</ttl>
  ${items.map((p) => {
    const datum = p.gepubliceerdOp ? new Date(p.gepubliceerdOp).toUTCString() : new Date().toUTCString()
    return `  <item>
    <title>${escaped(p.titel)}</title>
    <link>${APP_URL}/blog/${p.slug}</link>
    <guid isPermaLink="true">${APP_URL}/blog/${p.slug}</guid>
    <pubDate>${datum}</pubDate>
    <dc:creator>Vincent van Munster</dc:creator>
    <description>${escaped(p.excerpt || '')}</description>
  </item>`
  }).join('\n')}
</channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
