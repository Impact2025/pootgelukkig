import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { matches } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const GELDIGE_UITKOMSTEN = ['geinteresseerd', 'afspraak', 'geadopteerd', 'niet_geschikt'] as const
type Uitkomst = (typeof GELDIGE_UITKOMSTEN)[number]

/**
 * POST /api/matches/feedback
 *
 * Registreert het resultaat van een match — de kern van de feedback loop.
 * Hoe meer uitkomsten opgeslagen worden, hoe beter de toekomstige matches.
 *
 * Body: { dierId: number, uitkomst: 'geinteresseerd' | 'afspraak' | 'geadopteerd' | 'niet_geschikt' }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const { dierId, uitkomst } = body as { dierId: number; uitkomst: string }

    if (!dierId || !uitkomst) {
      return NextResponse.json({ error: 'dierId en uitkomst zijn verplicht' }, { status: 400 })
    }

    if (!GELDIGE_UITKOMSTEN.includes(uitkomst as Uitkomst)) {
      return NextResponse.json(
        { error: `Ongeldige uitkomst. Kies uit: ${GELDIGE_UITKOMSTEN.join(', ')}` },
        { status: 400 }
      )
    }

    const userId = parseInt(session.user.id)

    // Controleer of de match bestaat voor deze gebruiker
    const [match] = await db
      .select({ id: matches.id })
      .from(matches)
      .where(and(eq(matches.userId, userId), eq(matches.dierId, dierId)))
      .limit(1)

    if (!match) {
      return NextResponse.json({ error: 'Match niet gevonden' }, { status: 404 })
    }

    // Sla uitkomst op
    await db
      .update(matches)
      .set({ uitkomst, uitkomstOp: new Date() })
      .where(and(eq(matches.userId, userId), eq(matches.dierId, dierId)))

    return NextResponse.json({ data: { succes: true, uitkomst } })
  } catch (error) {
    console.error('Feedback API fout:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het opslaan van de feedback' },
      { status: 500 }
    )
  }
}
