import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { gesprekken } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { id } = await params
  const gesprekId = parseInt(id)
  const userId = parseInt(session.user.id)

  const { datum } = await request.json()
  if (!datum) return NextResponse.json({ error: 'Datum verplicht' }, { status: 400 })

  const [gesprek] = await db
    .select({ id: gesprekken.id })
    .from(gesprekken)
    .where(and(eq(gesprekken.id, gesprekId), eq(gesprekken.userId, userId)))
    .limit(1)

  if (!gesprek) return NextResponse.json({ error: 'Gesprek niet gevonden' }, { status: 404 })

  const [updated] = await db
    .update(gesprekken)
    .set({ afspraakDatum: new Date(datum), afspraakBevestigd: false })
    .where(eq(gesprekken.id, gesprekId))
    .returning()

  return NextResponse.json({ data: updated })
}
