import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { clienten } from '@/lib/db/schema'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const nieuweClientSchema = z.object({
  voornaam: z.string().min(1),
  achternaam: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  telefoon: z.string().optional(),
  hulpvraagOmschrijving: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }
  const parsed = nieuweClientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ fout: parsed.error.errors[0]?.message ?? 'Ongeldige invoer' }, { status: 400 })
  }

  const [client] = await db
    .insert(clienten)
    .values({
      organisatieId,
      voornaam: parsed.data.voornaam,
      achternaam: parsed.data.achternaam,
      email: parsed.data.email || null,
      telefoon: parsed.data.telefoon || null,
      hulpvraagOmschrijving: parsed.data.hulpvraagOmschrijving || null,
      status: 'aangemeld',
    })
    .returning()

  return NextResponse.json({ data: client }, { status: 201 })
}
