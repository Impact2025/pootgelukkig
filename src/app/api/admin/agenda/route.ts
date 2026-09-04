export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const TOEGESTANE_STATUS = ['bevestigd', 'geannuleerd', 'afgerond'] as const
type Status = (typeof TOEGESTANE_STATUS)[number]

// PATCH — bevestig, wijs af of rond een afspraak af. Strikt gescoped op de eigen organisatie.
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: { id?: number; status?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!body.id || !body.status || !TOEGESTANE_STATUS.includes(body.status as Status)) {
    return NextResponse.json({ fout: 'Ongeldige invoer' }, { status: 400 })
  }
  const status = body.status as Status

  const [bestaand] = await db
    .select({ voorkeurDatum: afspraken.voorkeurDatum })
    .from(afspraken)
    .where(and(eq(afspraken.id, body.id), eq(afspraken.organisatieId, organisatieId)))
    .limit(1)
  if (!bestaand) return NextResponse.json({ fout: 'Afspraak niet gevonden' }, { status: 404 })

  const wijziging: { status: Status; bijgewerktOp: Date; bevestigdeDatum?: Date } = {
    status,
    bijgewerktOp: new Date(),
  }
  // Bij bevestigen: standaard de voorkeursdatum overnemen als bevestigde datum (kan later herpland worden).
  if (status === 'bevestigd') wijziging.bevestigdeDatum = bestaand.voorkeurDatum

  const [bijgewerkt] = await db
    .update(afspraken)
    .set(wijziging)
    .where(and(eq(afspraken.id, body.id), eq(afspraken.organisatieId, organisatieId)))
    .returning({ id: afspraken.id })

  if (!bijgewerkt) return NextResponse.json({ fout: 'Afspraak niet gevonden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
