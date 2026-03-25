import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'
import { db } from '@/lib/db'
import { dieren, asielen, matches } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const dierId = parseInt(id)

    if (isNaN(dierId)) {
      return NextResponse.json({ error: 'Ongeldig dier ID' }, { status: 400 })
    }

    const [dier] = await db
      .select({
        id: dieren.id,
        naam: dieren.naam,
        soort: dieren.soort,
        ras: dieren.ras,
        leeftijdJaren: dieren.leeftijdJaren,
        leeftijdMaanden: dieren.leeftijdMaanden,
        geslacht: dieren.geslacht,
        gewichtKg: dieren.gewichtKg,
        kleur: dieren.kleur,
        verhaal: dieren.verhaal,
        status: dieren.status,
        hoofdFotoUrl: dieren.hoofdFotoUrl,
        fotoUrls: dieren.fotoUrls,
        gedragsProfiel: dieren.gedragsProfiel,
        medischPaspoort: dieren.medischPaspoort,
        binnengekomentOp: dieren.binnengekomentOp,
        asielId: dieren.asielId,
        asielNaam: asielen.naam,
        asielStad: asielen.stad,
        asielEmail: asielen.email,
      })
      .from(dieren)
      .leftJoin(asielen, eq(dieren.asielId, asielen.id))
      .where(eq(dieren.id, dierId))
      .limit(1)

    if (!dier) {
      return NextResponse.json({ error: 'Dier niet gevonden' }, { status: 404 })
    }

    // Match score ophalen als ingelogd
    const session = await auth()
    let matchScore = null
    let matchAnalyse = null

    if (session?.user?.id) {
      const userId = parseInt(session.user.id)
      const [match] = await db
        .select({ score: matches.score, analyseTekst: matches.analyseTekst })
        .from(matches)
        .where(and(eq(matches.userId, userId), eq(matches.dierId, dierId)))
        .limit(1)

      if (match) {
        matchScore = match.score
        matchAnalyse = match.analyseTekst
      }
    }

    return NextResponse.json({ data: { ...dier, matchScore, matchAnalyse } })
  } catch (error) {
    console.error('Animal API fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.rol !== 'asiel' && session.user.rol !== 'admin')) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const dierId = parseInt(id)
  if (isNaN(dierId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  const body = await req.json()

  const updates: Record<string, unknown> = { bijgewerktOp: new Date() }
  if (body.naam !== undefined) updates.naam = body.naam
  if (body.ras !== undefined) updates.ras = body.ras
  if (body.leeftijdJaren !== undefined) updates.leeftijdJaren = body.leeftijdJaren
  if (body.geslacht !== undefined) updates.geslacht = body.geslacht
  if (body.verhaal !== undefined) updates.verhaal = body.verhaal
  if (body.hoofdFotoUrl !== undefined) updates.hoofdFotoUrl = body.hoofdFotoUrl
  if (body.status !== undefined) updates.status = body.status
  if (body.gedragsProfiel !== undefined) updates.gedragsProfiel = body.gedragsProfiel
  if (body.medischPaspoort !== undefined) updates.medischPaspoort = body.medischPaspoort

  const [updated] = await db
    .update(dieren)
    .set(updates)
    .where(eq(dieren.id, dierId))
    .returning({ id: dieren.id })

  if (!updated) return NextResponse.json({ error: 'Dier niet gevonden' }, { status: 404 })

  return NextResponse.json({ data: updated })
}
