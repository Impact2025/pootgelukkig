export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { berekenSeoScore } from '@/lib/blog/seo'

async function vereisOrganisatie() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) return null
  return session.user.organisatieId ?? null
}

// PATCH — bewaar of publiceer een artikel. Alleen als het artikel van de eigen organisatie is.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const organisatieId = await vereisOrganisatie()
  if (!organisatieId) return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })

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
    status: 'concept' | 'gepubliceerd' | 'gearchiveerd'
  }>

  const [huidig] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.id, postId), eq(blogPosts.organisatieId, organisatieId)))
    .limit(1)
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
    .where(and(eq(blogPosts.id, postId), eq(blogPosts.organisatieId, organisatieId)))
    .returning()

  return NextResponse.json({ data: post, seo })
}

// DELETE — alleen artikelen van de eigen organisatie.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const organisatieId = await vereisOrganisatie()
  if (!organisatieId) return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })

  const { id } = await params
  const [verwijderd] = await db
    .delete(blogPosts)
    .where(and(eq(blogPosts.id, Number(id)), eq(blogPosts.organisatieId, organisatieId)))
    .returning({ id: blogPosts.id })

  if (!verwijderd) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
