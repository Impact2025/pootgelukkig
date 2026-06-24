import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { coupons } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

function genereerCode(prefix = ''): string {
  const tekens = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += tekens[Math.floor(Math.random() * tekens.length)]
  return (prefix ? `${prefix.toUpperCase()}-` : '') + s
}

export async function GET() {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const lijst = await db.select().from(coupons).orderBy(desc(coupons.aangemaaktOp))
  return NextResponse.json({ data: lijst })
}

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as {
    code?: string
    omschrijving?: string
    type?: 'procent' | 'vast'
    waarde?: number
    maxGebruik?: number | null
    perKlantLimiet?: number | null
    minBesteding?: number | null
    campagne?: string
    startOp?: string | null
    vervalOp?: string | null
    aantal?: number // bulk genereren
    prefix?: string
  }

  if (body.waarde == null || Number.isNaN(Number(body.waarde))) {
    return NextResponse.json({ error: 'Waarde is verplicht' }, { status: 400 })
  }

  const gemeen = {
    omschrijving: body.omschrijving?.trim() || null,
    type: body.type ?? 'procent',
    waarde: Number(body.waarde),
    maxGebruik: body.maxGebruik ?? null,
    perKlantLimiet: body.perKlantLimiet ?? null,
    minBesteding: body.minBesteding ?? null,
    campagne: body.campagne?.trim() || null,
    startOp: body.startOp ? new Date(body.startOp) : null,
    vervalOp: body.vervalOp ? new Date(body.vervalOp) : null,
  }

  // Bulk genereren
  const aantal = Math.min(Math.max(body.aantal ?? 1, 1), 200)
  if (aantal > 1) {
    const waarden = Array.from({ length: aantal }, () => ({ ...gemeen, code: genereerCode(body.prefix) }))
    const ingevoegd = await db.insert(coupons).values(waarden).returning()
    return NextResponse.json({ data: ingevoegd }, { status: 201 })
  }

  const code = (body.code?.trim() || genereerCode(body.prefix)).toUpperCase()
  const [bestaat] = await db.select({ id: coupons.id }).from(coupons).where(sql`upper(${coupons.code}) = ${code}`).limit(1)
  if (bestaat) return NextResponse.json({ error: 'Code bestaat al' }, { status: 409 })

  const [coupon] = await db.insert(coupons).values({ ...gemeen, code }).returning()
  return NextResponse.json({ data: coupon }, { status: 201 })
}
