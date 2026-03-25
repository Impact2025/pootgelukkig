import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pleeggezinnen, pleegplaatsingen } from '@/lib/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const asielId = session.user.asielId

  const gezinnen = await db
    .select({
      id: pleeggezinnen.id,
      naam: pleeggezinnen.naam,
      email: pleeggezinnen.email,
      telefoon: pleeggezinnen.telefoon,
      stad: pleeggezinnen.stad,
      soortVoorkeur: pleeggezinnen.soortVoorkeur,
      maxDieren: pleeggezinnen.maxDieren,
      ervaringNiveau: pleeggezinnen.ervaringNiveau,
      actief: pleeggezinnen.actief,
      aangemaaktOp: pleeggezinnen.aangemaaktOp,
      actievePlaatsingen: count(pleegplaatsingen.id),
    })
    .from(pleeggezinnen)
    .leftJoin(
      pleegplaatsingen,
      and(
        eq(pleegplaatsingen.pleeggezinId, pleeggezinnen.id),
        eq(pleegplaatsingen.actief, true)
      )
    )
    .where(
      and(
        eq(pleeggezinnen.actief, true),
        ...(asielId ? [eq(pleeggezinnen.asielId, asielId)] : [])
      )
    )
    .groupBy(pleeggezinnen.id)
    .orderBy(desc(pleeggezinnen.aangemaaktOp))

  return NextResponse.json({ data: gezinnen })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json() as {
    naam?: string
    email?: string
    telefoon?: string
    adres?: string
    stad?: string
    soortVoorkeur?: string[]
    maxDieren?: number
    ervaringNiveau?: string
    notities?: string
  }

  const { naam, email, telefoon, adres, stad, soortVoorkeur, maxDieren, ervaringNiveau, notities } = body

  if (!naam) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
  }

  const asielId = session.user.asielId

  const [gezin] = await db.insert(pleeggezinnen).values({
    naam,
    email: email ?? null,
    telefoon: telefoon ?? null,
    adres: adres ?? null,
    stad: stad ?? null,
    soortVoorkeur: soortVoorkeur ?? [],
    maxDieren: maxDieren ?? 1,
    ervaringNiveau: ervaringNiveau ?? 'geen',
    notities: notities ?? null,
    asielId: asielId ?? null,
  }).returning()

  return NextResponse.json({ data: gezin }, { status: 201 })
}
