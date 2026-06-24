import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  const body = (await req.json()) as Partial<{
    omschrijving: string
    type: 'procent' | 'vast'
    waarde: number
    maxGebruik: number | null
    perKlantLimiet: number | null
    minBesteding: number | null
    campagne: string
    actief: boolean
    startOp: string | null
    vervalOp: string | null
  }>

  const set: Record<string, unknown> = { ...body }
  if ('startOp' in body) set.startOp = body.startOp ? new Date(body.startOp) : null
  if ('vervalOp' in body) set.vervalOp = body.vervalOp ? new Date(body.vervalOp) : null

  const [coupon] = await db.update(coupons).set(set).where(eq(coupons.id, Number(id))).returning()
  if (!coupon) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 })
  return NextResponse.json({ data: coupon })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const { id } = await params
  await db.delete(coupons).where(eq(coupons.id, Number(id)))
  return NextResponse.json({ ok: true })
}
