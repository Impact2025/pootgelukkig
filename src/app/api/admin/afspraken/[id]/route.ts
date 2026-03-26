import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.discriminatedUnion('actie', [
  z.object({
    actie: z.literal('bevestig'),
    bevestigdeDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    bevestigdTijdstip: z.string().regex(/^\d{2}:\d{2}$/),
    notitieAsiel: z.string().max(500).optional(),
  }),
  z.object({
    actie: z.literal('afgerond'),
    notitieAsiel: z.string().max(500).optional(),
  }),
  z.object({
    actie: z.literal('annuleer'),
    notitieAsiel: z.string().max(500).optional(),
  }),
])

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Niet bevoegd' }, { status: 403 })
  }

  const { id } = await params
  const afspraakId = parseInt(id)
  const asielId = session.user.asielId

  const [afspraak] = await db
    .select({ id: afspraken.id, asielId: afspraken.asielId, status: afspraken.status })
    .from(afspraken)
    .where(
      and(
        eq(afspraken.id, afspraakId),
        asielId ? eq(afspraken.asielId, asielId) : undefined
      )
    )
    .limit(1)

  if (!afspraak) {
    return NextResponse.json({ error: 'Afspraak niet gevonden' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
  }

  const { actie } = parsed.data
  const nu = new Date()

  let update: Record<string, unknown> = { bijgewerktOp: nu }

  if (actie === 'bevestig') {
    if (afspraak.status !== 'aangevraagd') {
      return NextResponse.json({ error: 'Kan alleen aangevraagde afspraken bevestigen' }, { status: 400 })
    }
    update = {
      ...update,
      status: 'bevestigd',
      bevestigdeDatum: new Date(parsed.data.bevestigdeDatum),
      bevestigdTijdstip: parsed.data.bevestigdTijdstip,
      notitieAsiel: parsed.data.notitieAsiel ?? null,
    }
  } else if (actie === 'afgerond') {
    if (afspraak.status !== 'bevestigd') {
      return NextResponse.json({ error: 'Kan alleen bevestigde afspraken afronden' }, { status: 400 })
    }
    update = { ...update, status: 'afgerond', notitieAsiel: parsed.data.notitieAsiel ?? null }
  } else if (actie === 'annuleer') {
    update = { ...update, status: 'geannuleerd', notitieAsiel: parsed.data.notitieAsiel ?? null }
  }

  const [bijgewerkt] = await db
    .update(afspraken)
    .set(update)
    .where(eq(afspraken.id, afspraakId))
    .returning()

  return NextResponse.json({ data: bijgewerkt })
}
