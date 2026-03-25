import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { wachtlijst } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }
  const entries = await db
    .select()
    .from(wachtlijst)
    .where(eq(wachtlijst.actief, true))
    .orderBy(desc(wachtlijst.aangemeldOp))
  return NextResponse.json({ data: entries })
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    naam?: string
    email?: string
    soort?: string
    ras?: string
    leeftijdVoorkeur?: string
    notities?: string
    userId?: number
  }
  const { naam, email, soort, ras, leeftijdVoorkeur, notities, userId } = body

  if (!naam || !email || !soort) {
    return NextResponse.json({ error: 'Naam, email en soort zijn verplicht' }, { status: 400 })
  }

  const toegestaneSoorten = ['hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig']
  if (!toegestaneSoorten.includes(soort)) {
    return NextResponse.json({ error: 'Ongeldige diersoort' }, { status: 400 })
  }

  const [entry] = await db.insert(wachtlijst).values({
    naam,
    email,
    soort: soort as 'hond' | 'kat' | 'vogel' | 'konijn' | 'cavia' | 'hamster' | 'overig',
    ras: ras ?? null,
    leeftijdVoorkeur: leeftijdVoorkeur ?? null,
    notities: notities ?? null,
    userId: userId ?? null,
  }).returning()

  return NextResponse.json({ data: entry }, { status: 201 })
}
