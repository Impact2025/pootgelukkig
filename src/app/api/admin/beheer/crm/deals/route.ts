import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmDeals } from '@/lib/db/schema'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as {
    contactId?: number
    titel?: string
    waarde?: number
    fase?: 'nieuw' | 'contact' | 'onderhandeling' | 'gewonnen' | 'verloren'
  }

  if (!body.contactId || !body.titel?.trim()) {
    return NextResponse.json({ error: 'Contact en titel zijn verplicht' }, { status: 400 })
  }

  const [deal] = await db
    .insert(crmDeals)
    .values({
      contactId: body.contactId,
      titel: body.titel.trim(),
      waarde: body.waarde ?? 0,
      fase: body.fase ?? 'nieuw',
      eigenaar: admin.naam,
    })
    .returning()

  return NextResponse.json({ data: deal }, { status: 201 })
}
