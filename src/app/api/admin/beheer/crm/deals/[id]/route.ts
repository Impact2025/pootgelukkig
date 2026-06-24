import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmDeals, crmActiviteiten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

const FASES = ['nieuw', 'contact', 'onderhandeling', 'gewonnen', 'verloren'] as const
type Fase = (typeof FASES)[number]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const body = (await req.json()) as Partial<{
    titel: string
    waarde: number
    fase: Fase
    volgorde: number
  }>

  if (body.fase && !FASES.includes(body.fase)) {
    return NextResponse.json({ error: 'Ongeldige fase' }, { status: 400 })
  }

  const [deal] = await db
    .update(crmDeals)
    .set({ ...body, bijgewerktOp: new Date() })
    .where(eq(crmDeals.id, Number(id)))
    .returning()

  if (!deal) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })

  // Faseverandering loggen als activiteit
  if (body.fase) {
    await db.insert(crmActiviteiten).values({
      contactId: deal.contactId,
      dealId: deal.id,
      type: 'notitie',
      inhoud: `Deal "${deal.titel}" verplaatst naar fase: ${body.fase}`,
      auteur: admin.naam,
    })
  }

  return NextResponse.json({ data: deal })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  await db.delete(crmDeals).where(eq(crmDeals.id, Number(id)))
  return NextResponse.json({ ok: true })
}
