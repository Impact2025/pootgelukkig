import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmContacten } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const contacten = await db.select().from(crmContacten).orderBy(desc(crmContacten.bijgewerktOp))
  return NextResponse.json({ data: contacten })
}

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as {
    naam?: string
    email?: string
    telefoon?: string
    bedrijf?: string
    type?: 'lead' | 'asiel' | 'adoptant' | 'partner' | 'overig'
    bron?: string
    stad?: string
    tags?: string[]
    notitie?: string
  }

  if (!body.naam?.trim()) {
    return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
  }

  const [contact] = await db
    .insert(crmContacten)
    .values({
      naam: body.naam.trim(),
      email: body.email?.trim() || null,
      telefoon: body.telefoon?.trim() || null,
      bedrijf: body.bedrijf?.trim() || null,
      type: body.type ?? 'lead',
      bron: body.bron?.trim() || 'handmatig',
      stad: body.stad?.trim() || null,
      tags: body.tags ?? [],
      notitie: body.notitie?.trim() || null,
      eigenaar: admin.naam,
    })
    .returning()

  return NextResponse.json({ data: contact }, { status: 201 })
}
