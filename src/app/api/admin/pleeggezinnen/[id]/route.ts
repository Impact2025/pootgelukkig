import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pleeggezinnen, pleegplaatsingen, dieren } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const gezinId = parseInt(id)
  if (isNaN(gezinId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  const [gezin] = await db
    .select()
    .from(pleeggezinnen)
    .where(eq(pleeggezinnen.id, gezinId))
    .limit(1)

  if (!gezin) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  const plaatsingen = await db
    .select({
      id: pleegplaatsingen.id,
      startdatum: pleegplaatsingen.startdatum,
      einddatum: pleegplaatsingen.einddatum,
      actief: pleegplaatsingen.actief,
      notities: pleegplaatsingen.notities,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierFotoUrl: dieren.hoofdFotoUrl,
      dierId: dieren.id,
    })
    .from(pleegplaatsingen)
    .innerJoin(dieren, eq(pleegplaatsingen.dierId, dieren.id))
    .where(eq(pleegplaatsingen.pleeggezinId, gezinId))
    .orderBy(desc(pleegplaatsingen.startdatum))

  return NextResponse.json({ data: { ...gezin, plaatsingen } })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const gezinId = parseInt(id)
  if (isNaN(gezinId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  const body = await req.json() as Partial<{
    naam: string
    email: string
    telefoon: string
    adres: string
    stad: string
    soortVoorkeur: string[]
    maxDieren: number
    ervaringNiveau: string
    notities: string
    actief: boolean
  }>

  const [updated] = await db
    .update(pleeggezinnen)
    .set(body)
    .where(eq(pleeggezinnen.id, gezinId))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const gezinId = parseInt(id)
  if (isNaN(gezinId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  // Soft delete
  const [updated] = await db
    .update(pleeggezinnen)
    .set({ actief: false })
    .where(and(eq(pleeggezinnen.id, gezinId), eq(pleeggezinnen.actief, true)))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  return NextResponse.json({ success: true })
}
