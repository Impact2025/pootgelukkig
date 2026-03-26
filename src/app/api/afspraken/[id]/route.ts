import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)
  const { id } = await params
  const afspraakId = parseInt(id)

  const [afspraak] = await db
    .select({ id: afspraken.id, userId: afspraken.userId, status: afspraken.status })
    .from(afspraken)
    .where(and(eq(afspraken.id, afspraakId), eq(afspraken.userId, userId)))
    .limit(1)

  if (!afspraak) {
    return NextResponse.json({ error: 'Afspraak niet gevonden' }, { status: 404 })
  }

  // Adoptant mag alleen annuleren als status aangevraagd of bevestigd is
  if (!['aangevraagd', 'bevestigd'].includes(afspraak.status)) {
    return NextResponse.json({ error: 'Afspraak kan niet meer worden geannuleerd' }, { status: 400 })
  }

  const [bijgewerkt] = await db
    .update(afspraken)
    .set({ status: 'geannuleerd', bijgewerktOp: new Date() })
    .where(eq(afspraken.id, afspraakId))
    .returning()

  return NextResponse.json({ data: bijgewerkt })
}
