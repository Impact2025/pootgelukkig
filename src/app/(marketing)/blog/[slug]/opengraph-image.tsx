import { ImageResponse } from 'next/og'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const alt = 'Artikel op de PootGelukkig blog'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function ArtikelOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let titel = 'PootGelukkig blog'
  try {
    const [post] = await db
      .select({ titel: blogPosts.titel })
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'gepubliceerd')))
      .limit(1)
    if (post?.titel) titel = post.titel
  } catch {
    // val terug op de standaardtitel
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #33335c 0%, #26264a 100%)',
          padding: '72px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#f8aa25',
              color: '#33335c',
              fontSize: '28px',
              fontWeight: 800,
            }}
          >
            PG
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#c9c9d6' }}>PootGelukkig · Blog</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: titel.length > 70 ? '54px' : '64px',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              maxWidth: '1000px',
            }}
          >
            {titel}
          </div>
          <div style={{ display: 'flex', marginTop: '28px' }}>
            <div style={{ width: '120px', height: '8px', borderRadius: '9999px', background: '#ee5b2b' }} />
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: '26px', color: '#c9c9d6' }}>pootgelukkig.nl/blog</div>
      </div>
    ),
    { ...size }
  )
}
