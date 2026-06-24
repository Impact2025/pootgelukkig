import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmActiviteiten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { vereisAdmin } from '@/lib/beheer/guard'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as {
    contactId?: number
    dealId?: number
    type?: 'notitie' | 'mail' | 'bel' | 'taak' | 'afspraak'
    inhoud?: string
    deadline?: string
  }

  if (!body.contactId || !body.inhoud?.trim()) {
    return NextResponse.json({ error: 'Contact en inhoud zijn verplicht' }, { status: 400 })
  }

  const [activiteit] = await db
    .insert(crmActiviteiten)
    .values({
      contactId: body.contactId,
      dealId: body.dealId ?? null,
      type: body.type ?? 'notitie',
      inhoud: body.inhoud.trim(),
      deadline: body.deadline ? new Date(body.deadline) : null,
      auteur: admin.naam,
    })
    .returning()

  return NextResponse.json({ data: activiteit }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const admin = await vereisAdmin()
  if (!admin) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const body = (await req.json()) as { id?: number; voltooid?: boolean }
  if (!body.id) return NextResponse.json({ error: 'id verplicht' }, { status: 400 })

  const [activiteit] = await db
    .update(crmActiviteiten)
    .set({ voltooid: body.voltooid ?? true })
    .where(eq(crmActiviteiten.id, body.id))
    .returning()

  return NextResponse.json({ data: activiteit })
}
