import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken, dieren, users, asielen } from '@/lib/db/schema'
import { and, eq, desc, or } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Niet bevoegd' }, { status: 403 })
  }

  const asielId = session.user.asielId
  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  const resultaat = await db
    .select({
      id: afspraken.id,
      status: afspraken.status,
      type: afspraken.type,
      voorkeurDatum: afspraken.voorkeurDatum,
      voorkeurTijdslot: afspraken.voorkeurTijdslot,
      bevestigdeDatum: afspraken.bevestigdeDatum,
      bevestigdTijdstip: afspraken.bevestigdTijdstip,
      notitieAdoptant: afspraken.notitieAdoptant,
      notitieAsiel: afspraken.notitieAsiel,
      aangemaaktOp: afspraken.aangemaaktOp,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierFotoUrl: dieren.hoofdFotoUrl,
      dierId: dieren.id,
      adoptantNaam: users.naam,
      adoptantEmail: users.email,
      asielNaam: asielen.naam,
    })
    .from(afspraken)
    .innerJoin(dieren, eq(afspraken.dierId, dieren.id))
    .innerJoin(users, eq(afspraken.userId, users.id))
    .innerJoin(asielen, eq(afspraken.asielId, asielen.id))
    .where(
      and(
        asielId ? eq(afspraken.asielId, asielId) : undefined,
        statusFilter && statusFilter !== 'alle'
          ? eq(afspraken.status, statusFilter as 'aangevraagd' | 'bevestigd' | 'afgerond' | 'geannuleerd')
          : or(
              eq(afspraken.status, 'aangevraagd'),
              eq(afspraken.status, 'bevestigd'),
              eq(afspraken.status, 'afgerond'),
              eq(afspraken.status, 'geannuleerd'),
            )
      )
    )
    .orderBy(desc(afspraken.aangemaaktOp))

  return NextResponse.json({ data: resultaat })
}
