export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiContentQueue } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'

// GET — lijst met content-concepten voor de eigen organisatie (nieuwste eerst).
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ items: [] })

  const items = await db
    .select()
    .from(aiContentQueue)
    .where(eq(aiContentQueue.organisatieId, organisatieId))
    .orderBy(desc(aiContentQueue.bijgewerktOp))
    .limit(100)

  return NextResponse.json({ items })
}

const TOEGESTANE_STATUS = ['pending', 'approved', 'rejected'] as const
type QueueStatus = (typeof TOEGESTANE_STATUS)[number]

// PATCH — keur goed / wijs af, of pas inhoud aan.
export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: { id?: number; status?: string; content?: string; titel?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!body.id || typeof body.id !== 'number') {
    return NextResponse.json({ fout: 'Geen geldig id' }, { status: 400 })
  }

  const wijziging: Partial<{ status: QueueStatus; content: string; titel: string; beoordeeldOp: Date; beoordeeldDoor: string }> = {}
  if (body.status !== undefined) {
    if (!TOEGESTANE_STATUS.includes(body.status as QueueStatus)) {
      return NextResponse.json({ fout: 'Ongeldige status' }, { status: 400 })
    }
    wijziging.status = body.status as QueueStatus
    if (body.status === 'approved' || body.status === 'rejected') {
      wijziging.beoordeeldOp = new Date()
      wijziging.beoordeeldDoor = session.user.name ?? session.user.email ?? String(session.user.id)
    }
  }
  if (typeof body.content === 'string') wijziging.content = body.content
  if (typeof body.titel === 'string') wijziging.titel = body.titel.slice(0, 255)

  if (Object.keys(wijziging).length === 0) {
    return NextResponse.json({ fout: 'Niets te wijzigen' }, { status: 400 })
  }

  const [bijgewerkt] = await db
    .update(aiContentQueue)
    .set({ ...wijziging, bijgewerktOp: new Date() })
    .where(and(eq(aiContentQueue.id, body.id), eq(aiContentQueue.organisatieId, organisatieId)))
    .returning()

  if (!bijgewerkt) {
    return NextResponse.json({ fout: 'Item niet gevonden' }, { status: 404 })
  }

  return NextResponse.json({ item: bijgewerkt })
}

// DELETE — verwijder een concept (alleen eigen organisatie).
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { searchParams } = new URL(request.url)
  const id = Number(searchParams.get('id'))
  if (!id) return NextResponse.json({ fout: 'Geen geldig id' }, { status: 400 })

  const [verwijderd] = await db
    .delete(aiContentQueue)
    .where(and(eq(aiContentQueue.id, id), eq(aiContentQueue.organisatieId, organisatieId)))
    .returning({ id: aiContentQueue.id })

  if (!verwijderd) return NextResponse.json({ fout: 'Item niet gevonden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
