import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { medischeRecords, adopties, dieren } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ dierId: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { dierId: dierIdStr } = await params
  const dierId = parseInt(dierIdStr)
  if (isNaN(dierId)) return NextResponse.json({ error: 'Ongeldig dier ID' }, { status: 400 })

  const userId = parseInt(session.user.id)

  // Controleer of gebruiker dit dier heeft geadopteerd
  const [adoptie] = await db
    .select({ id: adopties.id })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .where(and(eq(adopties.userId, userId), eq(adopties.dierId, dierId)))
    .limit(1)

  if (!adoptie) {
    return NextResponse.json({ error: 'Geen toegang tot dit dier' }, { status: 403 })
  }

  const body = await req.json()
  const { type, titel, datum, beschrijving, uitvoerder } = body

  if (!type || !titel || !datum) {
    return NextResponse.json({ error: 'type, titel en datum zijn verplicht' }, { status: 400 })
  }

  const [record] = await db
    .insert(medischeRecords)
    .values({
      dierId,
      type,
      titel,
      datum: new Date(datum),
      beschrijving: beschrijving ?? null,
      uitvoerder: uitvoerder ?? null,
      status: 'aankomend',
    })
    .returning()

  return NextResponse.json({ data: record }, { status: 201 })
}
