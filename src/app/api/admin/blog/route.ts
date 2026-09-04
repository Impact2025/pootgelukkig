export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { berekenSeoScore, slugify } from '@/lib/blog/seo'

// POST — nieuw conceptartikel voor de eigen organisatie.
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const body = (await request.json().catch(() => ({}))) as { titel?: string }
  const titel = body.titel?.trim() || 'Nieuw artikel'

  let slug = slugify(titel) || `artikel-${Date.now().toString(36)}`
  const [bestaat] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  if (bestaat) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  const inhoudMd = `# ${titel}\n\nSchrijf hier je artikel…`
  const seo = berekenSeoScore({ titel, inhoudMd })

  const [post] = await db
    .insert(blogPosts)
    .values({
      titel,
      slug,
      inhoudMd,
      status: 'concept',
      seoScore: seo.score,
      organisatieId,
      auteurId: session.user.id ? Number(session.user.id) : undefined,
    })
    .returning()

  return NextResponse.json({ data: post }, { status: 201 })
}
