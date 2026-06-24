import { NextRequest, NextResponse } from 'next/server'
import { valideerCoupon } from '@/lib/coupons'

export const dynamic = 'force-dynamic'

// Publiek bruikbaar (bijv. vanuit een toekomstige checkout/donatieflow).
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { code?: string; bedrag?: number; email?: string; userId?: number }

  if (!body.code?.trim()) {
    return NextResponse.json({ geldig: false, reden: 'Geen code opgegeven' }, { status: 400 })
  }

  const resultaat = await valideerCoupon(body.code, {
    bedrag: body.bedrag,
    email: body.email,
    userId: body.userId,
  })

  return NextResponse.json(resultaat)
}
