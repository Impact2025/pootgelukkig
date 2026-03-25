import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { welzijnLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ dierId: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }
  const { dierId } = await params
  const logs = await db.select().from(welzijnLogs)
    .where(eq(welzijnLogs.dierId, parseInt(dierId)))
    .orderBy(desc(welzijnLogs.gelogdOp))
    .limit(14)
  return NextResponse.json({ data: logs })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ dierId: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }
  const { dierId } = await params
  const body = await req.json() as { voeding?: string; gedrag?: string; gezondheid?: string; notitie?: string }
  const { voeding, gedrag, gezondheid, notitie } = body
  if (!voeding || !gedrag || !gezondheid) {
    return NextResponse.json({ error: 'Alle velden verplicht' }, { status: 400 })
  }
  const [log] = await db.insert(welzijnLogs).values({
    dierId: parseInt(dierId),
    medewerkerId: parseInt(session.user.id),
    voeding,
    gedrag,
    gezondheid,
    notitie: notitie ?? null,
  }).returning()
  return NextResponse.json({ data: log }, { status: 201 })
}
