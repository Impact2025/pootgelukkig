import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'
import { berekenSeoScore, slugify } from '@/lib/blog/seo'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.bijgewerktOp))
  return NextResponse.json({ data: posts })
}

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as { titel?: string }
  const titel = body.titel?.trim() || 'Nieuw artikel'

  let slug = slugify(titel) || `artikel-${Date.now().toString(36)}`
  const [bestaat] = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  if (bestaat) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  const inhoudMd = `# ${titel}\n\nSchrijf hier je artikel…`
  const seo = berekenSeoScore({ titel, inhoudMd })

  const [post] = await db
    .insert(blogPosts)
    .values({ titel, slug, inhoudMd, status: 'concept', seoScore: seo.score, auteurId: admin.userId })
    .returning()

  return NextResponse.json({ data: post }, { status: 201 })
}
