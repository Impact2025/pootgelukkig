export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { crmContacten } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'

const TOEGESTANE_TYPES = ['gemeente', 'fondsenverstrekker', 'zorgpartner', 'partner', 'overig'] as const

// GET — CRM-contacten van de eigen organisatie (nooit van een andere organisatie).
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ data: [] })

  const data = await db
    .select()
    .from(crmContacten)
    .where(eq(crmContacten.organisatieId, organisatieId))
    .orderBy(desc(crmContacten.bijgewerktOp))

  return NextResponse.json({ data })
}

// POST — nieuw CRM-contact voor de eigen organisatie.
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: {
    naam?: string
    email?: string
    telefoon?: string
    bedrijf?: string
    stad?: string
    type?: string
    notitie?: string
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!body.naam?.trim()) {
    return NextResponse.json({ fout: 'Naam is verplicht' }, { status: 400 })
  }
  const type = TOEGESTANE_TYPES.includes(body.type as (typeof TOEGESTANE_TYPES)[number])
    ? (body.type as (typeof TOEGESTANE_TYPES)[number])
    : 'overig'

  const [contact] = await db
    .insert(crmContacten)
    .values({
      naam: body.naam.trim(),
      email: body.email?.trim() || null,
      telefoon: body.telefoon?.trim() || null,
      bedrijf: body.bedrijf?.trim() || null,
      stad: body.stad?.trim() || null,
      notitie: body.notitie?.trim() || null,
      type,
      bron: 'handmatig',
      organisatieId,
      eigenaar: session.user.name ?? session.user.email ?? undefined,
    })
    .returning()

  return NextResponse.json({ data: contact }, { status: 201 })
}
