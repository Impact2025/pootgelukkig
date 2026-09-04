import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { teamUitnodigingen } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// DELETE — trek een openstaande teamuitnodiging in.
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { id } = await params
  const uitnodigingId = Number(id)
  if (!Number.isInteger(uitnodigingId)) return NextResponse.json({ fout: 'Ongeldig id' }, { status: 400 })

  const [bijgewerkt] = await db
    .update(teamUitnodigingen)
    .set({ status: 'ingetrokken' })
    .where(and(eq(teamUitnodigingen.id, uitnodigingId), eq(teamUitnodigingen.organisatieId, organisatieId)))
    .returning({ id: teamUitnodigingen.id })

  if (!bijgewerkt) return NextResponse.json({ fout: 'Uitnodiging niet gevonden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
