import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmContacten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const body = (await req.json()) as Partial<{
    naam: string
    email: string
    telefoon: string
    bedrijf: string
    type: 'lead' | 'asiel' | 'adoptant' | 'partner' | 'overig'
    stad: string
    tags: string[]
    notitie: string
  }>

  const [contact] = await db
    .update(crmContacten)
    .set({ ...body, bijgewerktOp: new Date() })
    .where(eq(crmContacten.id, Number(id)))
    .returning()

  if (!contact) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  return NextResponse.json({ data: contact })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  await db.delete(crmContacten).where(eq(crmContacten.id, Number(id)))
  return NextResponse.json({ ok: true })
}
