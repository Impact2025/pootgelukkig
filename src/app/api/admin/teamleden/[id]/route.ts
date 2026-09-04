import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { and, eq, count } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// DELETE — verwijder een teamlid van de eigen organisatie.
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { id } = await params
  const teamlidId = Number(id)
  if (!Number.isInteger(teamlidId)) return NextResponse.json({ fout: 'Ongeldig id' }, { status: 400 })

  const [teamlid] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, teamlidId), eq(users.organisatieId, organisatieId)))
    .limit(1)
  if (!teamlid) return NextResponse.json({ fout: 'Teamlid niet gevonden' }, { status: 404 })

  const [aantalResult] = await db.select({ aantal: count() }).from(users).where(eq(users.organisatieId, organisatieId))
  if ((aantalResult?.aantal ?? 0) <= 1) {
    return NextResponse.json({ fout: 'Je kunt het laatste teamlid van een organisatie niet verwijderen' }, { status: 400 })
  }

  await db.delete(users).where(eq(users.id, teamlidId))
  return NextResponse.json({ ok: true })
}
