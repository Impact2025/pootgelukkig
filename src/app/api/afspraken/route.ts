import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken, dieren } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  dierId: z.number().int().positive(),
  asielId: z.number().int().positive(),
  type: z.enum(['kennismaking', 'thuischeck']).default('kennismaking'),
  voorkeurDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  voorkeurTijdslot: z.enum(['ochtend', 'middag', 'avond']),
  notitie: z.string().max(500).optional(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
  }

  const { dierId, asielId, type, voorkeurDatum, voorkeurTijdslot, notitie } = parsed.data

  // Controleer dat dier beschikbaar is en bij het asiel hoort
  const [dier] = await db
    .select({ id: dieren.id, asielId: dieren.asielId, status: dieren.status })
    .from(dieren)
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (!dier || dier.status !== 'beschikbaar') {
    return NextResponse.json({ error: 'Dit dier is niet beschikbaar voor adoptie' }, { status: 400 })
  }

  // Voorkom dubbele actieve afspraken
  const [bestaand] = await db
    .select({ id: afspraken.id })
    .from(afspraken)
    .where(
      and(
        eq(afspraken.userId, userId),
        eq(afspraken.dierId, dierId),
        eq(afspraken.status, 'aangevraagd'),
      )
    )
    .limit(1)

  if (bestaand) {
    return NextResponse.json({ error: 'Je hebt al een openstaande afspraak voor dit dier' }, { status: 409 })
  }

  const [nieuw] = await db
    .insert(afspraken)
    .values({
      userId,
      dierId,
      asielId,
      type,
      voorkeurDatum: new Date(voorkeurDatum),
      voorkeurTijdslot,
      notitieAdoptant: notitie ?? null,
    })
    .returning()

  return NextResponse.json({ data: nieuw }, { status: 201 })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const resultaat = await db
    .select()
    .from(afspraken)
    .where(eq(afspraken.userId, userId))
    .orderBy(desc(afspraken.aangemaaktOp))

  return NextResponse.json({ data: resultaat })
}
