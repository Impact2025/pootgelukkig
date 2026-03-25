import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { wachtlijst } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const entryId = parseInt(id)
  if (isNaN(entryId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  const [updated] = await db
    .update(wachtlijst)
    .set({ actief: false })
    .where(eq(wachtlijst.id, entryId))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const entryId = parseInt(id)
  if (isNaN(entryId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  await db.delete(wachtlijst).where(eq(wachtlijst.id, entryId))

  return NextResponse.json({ success: true })
}
