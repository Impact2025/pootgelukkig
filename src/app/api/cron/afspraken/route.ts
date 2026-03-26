import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { gesprekken, users, dieren, asielen } from '@/lib/db/schema'
import { and, eq, gte, lte, eq as isEq } from 'drizzle-orm'
import { stuurAfspraakHerinnering } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Vercel Cron: elke dag 09:00
// vercel.json: { "crons": [{ "path": "/api/cron/afspraken", "schedule": "0 9 * * *" }] }

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Afspraken die morgen zijn (tussen nu+20u en nu+28u)
  const morgenVroeg = new Date(Date.now() + 20 * 60 * 60 * 1000)
  const morgenLaat = new Date(Date.now() + 28 * 60 * 60 * 1000)

  const afspraken = await db
    .select({
      adoptantNaam: users.naam,
      adoptantEmail: users.email,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      asielNaam: asielen.naam,
      asielAdres: asielen.adres,
      asielEmail: asielen.email,
      afspraakDatum: gesprekken.afspraakDatum,
    })
    .from(gesprekken)
    .innerJoin(users, eq(gesprekken.userId, users.id))
    .innerJoin(dieren, eq(gesprekken.dierId, dieren.id))
    .innerJoin(asielen, eq(gesprekken.asielId, asielen.id))
    .where(
      and(
        gte(gesprekken.afspraakDatum, morgenVroeg),
        lte(gesprekken.afspraakDatum, morgenLaat),
        eq(gesprekken.afspraakBevestigd, true)
      )
    )

  let verzonden = 0

  for (const afspraak of afspraken) {
    if (!afspraak.afspraakDatum) continue

    // Stuur naar adoptant
    await stuurAfspraakHerinnering({
      email: afspraak.adoptantEmail,
      naam: afspraak.adoptantNaam,
      dierNaam: afspraak.dierNaam,
      dierSoort: afspraak.dierSoort,
      asielNaam: afspraak.asielNaam,
      asielAdres: afspraak.asielAdres ?? afspraak.asielNaam,
      afspraakDatum: afspraak.afspraakDatum,
      rol: 'adoptant',
    })

    // Stuur naar asiel (als ze een email hebben)
    if (afspraak.asielEmail) {
      await stuurAfspraakHerinnering({
        email: afspraak.asielEmail,
        naam: afspraak.asielNaam,
        dierNaam: afspraak.dierNaam,
        dierSoort: afspraak.dierSoort,
        asielNaam: afspraak.asielNaam,
        asielAdres: afspraak.asielAdres ?? '',
        afspraakDatum: afspraak.afspraakDatum,
        rol: 'asiel',
      })
    }

    verzonden++
  }

  return NextResponse.json({ ok: true, afspraken: afspraken.length, verzonden: verzonden * 2 })
}
