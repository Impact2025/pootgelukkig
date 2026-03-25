import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pleegplaatsingen, dieren } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json() as {
    dierId?: number
    pleeggezinId?: number
    startdatum?: string
    notities?: string
  }

  const { dierId, pleeggezinId, startdatum, notities } = body

  if (!dierId || !pleeggezinId || !startdatum) {
    return NextResponse.json({ error: 'dierId, pleeggezinId en startdatum zijn verplicht' }, { status: 400 })
  }

  // Deactiveer eventuele vorige actieve pleegplaatsing voor dit dier
  await db
    .update(pleegplaatsingen)
    .set({ actief: false, einddatum: new Date() })
    .where(and(eq(pleegplaatsingen.dierId, dierId), eq(pleegplaatsingen.actief, true)))

  const [plaatsing] = await db.insert(pleegplaatsingen).values({
    dierId,
    pleeggezinId,
    startdatum: new Date(startdatum),
    notities: notities ?? null,
  }).returning()

  // Dier status zetten op niet_beschikbaar
  await db
    .update(dieren)
    .set({ status: 'niet_beschikbaar', bijgewerktOp: new Date() })
    .where(eq(dieren.id, dierId))

  return NextResponse.json({ data: plaatsing }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json() as {
    id?: number
    einddatum?: string
    notities?: string
  }

  const { id, einddatum, notities } = body

  if (!id) {
    return NextResponse.json({ error: 'id is verplicht' }, { status: 400 })
  }

  const updates: { actief: boolean; einddatum?: Date; notities?: string | null } = {
    actief: false,
  }
  if (einddatum) updates.einddatum = new Date(einddatum)
  if (notities !== undefined) updates.notities = notities

  const [updated] = await db
    .update(pleegplaatsingen)
    .set(updates)
    .where(eq(pleegplaatsingen.id, id))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  // Dier terugzetten op beschikbaar
  await db
    .update(dieren)
    .set({ status: 'beschikbaar', bijgewerktOp: new Date() })
    .where(eq(dieren.id, updated.dierId))

  return NextResponse.json({ data: updated })
}
