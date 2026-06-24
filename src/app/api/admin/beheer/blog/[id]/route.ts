import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'
import { berekenSeoScore } from '@/lib/blog/seo'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const postId = Number(id)
  const body = (await req.json()) as Partial<{
    titel: string
    inhoudMd: string
    excerpt: string
    coverUrl: string
    metaTitle: string
    metaDescription: string
    focusKeyword: string
    interneLinks: { tekst: string; url: string }[]
    externeLinks: { tekst: string; url: string }[]
    status: 'concept' | 'gepubliceerd' | 'gearchiveerd'
  }>

  const [huidig] = await db.select().from(blogPosts).where(eq(blogPosts.id, postId)).limit(1)
  if (!huidig) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const samengevoegd = { ...huidig, ...body }
  const seo = berekenSeoScore({
    titel: samengevoegd.titel,
    inhoudMd: samengevoegd.inhoudMd,
    metaTitle: samengevoegd.metaTitle,
    metaDescription: samengevoegd.metaDescription,
    focusKeyword: samengevoegd.focusKeyword,
    interneLinks: samengevoegd.interneLinks,
    externeLinks: samengevoegd.externeLinks,
  })

  const wordtGepubliceerd = body.status === 'gepubliceerd' && huidig.status !== 'gepubliceerd'

  const [post] = await db
    .update(blogPosts)
    .set({
      ...body,
      seoScore: seo.score,
      bijgewerktOp: new Date(),
      ...(wordtGepubliceerd ? { gepubliceerdOp: new Date() } : {}),
    })
    .where(eq(blogPosts.id, postId))
    .returning()

  return NextResponse.json({ data: post, seo })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  await db.delete(blogPosts).where(eq(blogPosts.id, Number(id)))
  return NextResponse.json({ ok: true })
}
