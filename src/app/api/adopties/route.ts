import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { adopties, dieren, users, asielen } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { stuurMatchAlert } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { dierId } = await request.json()
  const userId = parseInt(session.user.id)

  if (!dierId || isNaN(dierId)) {
    return NextResponse.json({ error: 'Ongeldig dier ID' }, { status: 400 })
  }

  // Check of dier beschikbaar is
  const [dier] = await db
    .select({ id: dieren.id, asielId: dieren.asielId, status: dieren.status })
    .from(dieren)
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (!dier) return NextResponse.json({ error: 'Dier niet gevonden' }, { status: 404 })
  if (dier.status === 'geadopteerd') {
    return NextResponse.json({ error: 'Dit dier is al geadopteerd' }, { status: 409 })
  }

  // Check of adoptie al aangevraagd
  const [bestaand] = await db
    .select({ id: adopties.id, status: adopties.status })
    .from(adopties)
    .where(and(eq(adopties.userId, userId), eq(adopties.dierId, dierId)))
    .limit(1)

  if (bestaand) {
    return NextResponse.json({ data: bestaand, bestaand: true })
  }

  // Adoptie aanmaken
  const [nieuw] = await db
    .insert(adopties)
    .values({ userId, dierId, asielId: dier.asielId, status: 'aangevraagd' })
    .returning()

  // Dier status bijwerken naar in_behandeling
  await db
    .update(dieren)
    .set({ status: 'in_behandeling', bijgewerktOp: new Date() })
    .where(eq(dieren.id, dierId))

  // Email naar asiel sturen
  const [asiel] = await db
    .select({ email: asielen.email })
    .from(asielen)
    .where(eq(asielen.id, dier.asielId))
    .limit(1)

  const [user] = await db
    .select({ naam: users.naam })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const [dierInfo] = await db
    .select({ naam: dieren.naam, soort: dieren.soort })
    .from(dieren)
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (asiel?.email) {
    stuurMatchAlert({
      asielEmail: asiel.email,
      asielNaam: 'Asiel',
      dierNaam: dierInfo?.naam ?? 'een dier',
      dierSoort: dierInfo?.soort ?? 'overig',
      dierSlug: dierId,
      adoptantNaam: user?.naam ?? 'Een adoptant',
      matchScore: 80,
      analyseTekst: 'Deze adoptant heeft een adoptieverzoek ingediend.',
    })
  }

  return NextResponse.json({ data: nieuw }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const userId = parseInt(session.user.id)
  const url = new URL(request.url)
  const dierId = url.searchParams.get('dierId')

  if (dierId) {
    const [adoptie] = await db
      .select({ id: adopties.id, status: adopties.status })
      .from(adopties)
      .where(and(eq(adopties.userId, userId), eq(adopties.dierId, parseInt(dierId))))
      .limit(1)

    return NextResponse.json({ data: adoptie ?? null })
  }

  const alleAdopties = await db
    .select()
    .from(adopties)
    .where(eq(adopties.userId, userId))

  return NextResponse.json({ data: alleAdopties })
}
