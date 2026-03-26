import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { asielen, users, dieren, matches, adopties, berichten, gesprekken } from '@/lib/db/schema'
import { eq, and, gte, count, desc, sql } from 'drizzle-orm'
import { stuurWeekelijkseDigest } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Wordt aangeroepen door Vercel Cron: elke maandag 08:00
// vercel.json: { "crons": [{ "path": "/api/cron/digest", "schedule": "0 8 * * 1" }] }

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const eenWeekGeleden = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Haal alle asielen op met hun contactpersoon
  const alleAsielen = await db
    .select({
      id: asielen.id,
      naam: asielen.naam,
      email: asielen.email,
    })
    .from(asielen)
    .where(sql`${asielen.email} IS NOT NULL`)

  let verzonden = 0

  for (const asiel of alleAsielen) {
    if (!asiel.email) continue

    // Contactpersoon ophalen
    const [contactpersoon] = await db
      .select({ naam: users.naam })
      .from(users)
      .where(and(eq(users.asielId, asiel.id), eq(users.rol, 'asiel')))
      .limit(1)

    // Stats van de afgelopen week
    const [matchCount] = await db
      .select({ aantal: count() })
      .from(matches)
      .innerJoin(dieren, eq(matches.dierId, dieren.id))
      .where(and(eq(dieren.asielId, asiel.id), gte(matches.berekendOp, eenWeekGeleden)))

    const [berichtCount] = await db
      .select({ aantal: count() })
      .from(berichten)
      .innerJoin(gesprekken, eq(berichten.gesprekId, gesprekken.id))
      .where(and(eq(gesprekken.asielId, asiel.id), gte(berichten.verstuurdOp, eenWeekGeleden), eq(berichten.gelezen, false)))

    const [dierCount] = await db
      .select({ aantal: count() })
      .from(dieren)
      .where(and(eq(dieren.asielId, asiel.id), eq(dieren.status, 'beschikbaar')))

    const [adoptieCount] = await db
      .select({ aantal: count() })
      .from(adopties)
      .where(and(eq(adopties.asielId, asiel.id), gte(adopties.aangevraagdOp, eenWeekGeleden)))

    // Top 3 matches van deze week
    const topMatches = await db
      .select({
        dierNaam: dieren.naam,
        adoptantNaam: users.naam,
        score: matches.score,
      })
      .from(matches)
      .innerJoin(dieren, eq(matches.dierId, dieren.id))
      .innerJoin(users, eq(matches.userId, users.id))
      .where(and(eq(dieren.asielId, asiel.id), gte(matches.berekendOp, eenWeekGeleden)))
      .orderBy(desc(matches.score))
      .limit(3)

    await stuurWeekelijkseDigest({
      asielEmail: asiel.email,
      asielNaam: asiel.naam,
      contactpersoonNaam: contactpersoon?.naam ?? 'team',
      stats: {
        nieuweMatches: matchCount?.aantal ?? 0,
        nieuweBeichten: berichtCount?.aantal ?? 0,
        actieveDieren: dierCount?.aantal ?? 0,
        adopties: adoptieCount?.aantal ?? 0,
      },
      topMatches,
    })

    verzonden++
  }

  return NextResponse.json({ ok: true, verzonden })
}
