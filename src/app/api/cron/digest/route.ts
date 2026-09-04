import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { organisaties, users, dossiers, matches, begeleidingen, berichten, gesprekken } from '@/lib/db/schema'
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

  // Haal alle organisaties op met hun contact-e-mail
  const alleOrganisaties = await db
    .select({
      id: organisaties.id,
      naam: organisaties.naam,
      email: organisaties.contactEmail,
    })
    .from(organisaties)
    .where(sql`${organisaties.contactEmail} IS NOT NULL`)

  let verzonden = 0

  for (const organisatie of alleOrganisaties) {
    if (!organisatie.email) continue

    // Contactpersoon ophalen
    const [contactpersoon] = await db
      .select({ naam: users.naam })
      .from(users)
      .where(and(eq(users.organisatieId, organisatie.id), eq(users.rol, 'asiel')))
      .limit(1)

    // Stats van de afgelopen week
    const [matchCount] = await db
      .select({ aantal: count() })
      .from(matches)
      .innerJoin(dossiers, eq(matches.dossierId, dossiers.id))
      .where(and(eq(dossiers.organisatieId, organisatie.id), gte(matches.berekendOp, eenWeekGeleden)))

    const [berichtCount] = await db
      .select({ aantal: count() })
      .from(berichten)
      .innerJoin(gesprekken, eq(berichten.gesprekId, gesprekken.id))
      .where(and(eq(gesprekken.organisatieId, organisatie.id), gte(berichten.verstuurdOp, eenWeekGeleden), eq(berichten.gelezen, false)))

    const [dossierCount] = await db
      .select({ aantal: count() })
      .from(dossiers)
      .where(and(eq(dossiers.organisatieId, organisatie.id), eq(dossiers.status, 'actief')))

    const [begeleidingCount] = await db
      .select({ aantal: count() })
      .from(begeleidingen)
      .where(and(eq(begeleidingen.organisatieId, organisatie.id), gte(begeleidingen.createdAt, eenWeekGeleden)))

    // Top 3 matches van deze week
    const topMatches = await db
      .select({
        dierNaam: dossiers.titel,
        adoptantNaam: users.naam,
        score: matches.score,
      })
      .from(matches)
      .innerJoin(dossiers, eq(matches.dossierId, dossiers.id))
      .innerJoin(users, eq(matches.userId, users.id))
      .where(and(eq(dossiers.organisatieId, organisatie.id), gte(matches.berekendOp, eenWeekGeleden)))
      .orderBy(desc(matches.score))
      .limit(3)

    await stuurWeekelijkseDigest({
      asielEmail: organisatie.email,
      asielNaam: organisatie.naam,
      contactpersoonNaam: contactpersoon?.naam ?? 'team',
      stats: {
        nieuweMatches: matchCount?.aantal ?? 0,
        nieuweBeichten: berichtCount?.aantal ?? 0,
        actieveDieren: dossierCount?.aantal ?? 0,
        adopties: begeleidingCount?.aantal ?? 0,
      },
      topMatches,
    })

    verzonden++
  }

  return NextResponse.json({ ok: true, verzonden })
}
