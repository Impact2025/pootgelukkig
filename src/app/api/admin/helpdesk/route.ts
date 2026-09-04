export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { helpdeskTickets, aiContentQueue } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const TOEGESTANE_STATUS = ['beantwoord', 'gesloten'] as const
type Status = (typeof TOEGESTANE_STATUS)[number]

// PATCH — markeer een ticket als beantwoord (keurt tegelijk het concept-antwoord goed in de
// content-queue) of sluit het zonder antwoord. Strikt gescoped op de eigen organisatie.
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: { id?: number; status?: string; conceptContent?: string; queueId?: number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!body.id || !body.status || !TOEGESTANE_STATUS.includes(body.status as Status)) {
    return NextResponse.json({ fout: 'Ongeldige invoer' }, { status: 400 })
  }
  const status = body.status as Status

  const [bijgewerkt] = await db
    .update(helpdeskTickets)
    .set({ status, beantwoordOp: status === 'beantwoord' ? new Date() : undefined })
    .where(and(eq(helpdeskTickets.id, body.id), eq(helpdeskTickets.organisatieId, organisatieId)))
    .returning({ id: helpdeskTickets.id })

  if (!bijgewerkt) return NextResponse.json({ fout: 'Ticket niet gevonden' }, { status: 404 })

  // Bij beantwoorden: het (eventueel bewerkte) concept goedkeuren in de content-queue —
  // het daadwerkelijk versturen blijft een aparte, bewuste handeling van de medewerker.
  if (status === 'beantwoord' && body.queueId) {
    const wijziging: Record<string, unknown> = {
      status: 'approved',
      beoordeeldOp: new Date(),
      beoordeeldDoor: session.user.name ?? session.user.email ?? String(session.user.id),
      bijgewerktOp: new Date(),
    }
    if (typeof body.conceptContent === 'string') wijziging.content = body.conceptContent
    await db
      .update(aiContentQueue)
      .set(wijziging)
      .where(and(eq(aiContentQueue.id, body.queueId), eq(aiContentQueue.organisatieId, organisatieId)))
  }

  return NextResponse.json({ ok: true })
}
