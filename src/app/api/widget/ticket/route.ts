import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { organisaties, helpdeskTickets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { genereerHelpdeskConcept } from '@/lib/ai/helpdesk'

export const dynamic = 'force-dynamic'

const ticketSchema = z.object({
  org: z.string().min(1),
  naam: z.string().min(2, 'Vul je naam in').max(120),
  email: z.string().email('Ongeldig e-mailadres').max(200),
  onderwerp: z.string().min(2).max(255).default('Bericht via de website'),
  bericht: z.string().min(5, 'Schrijf een bericht').max(4000),
  website: z.string().max(0).optional(), // honeypot
})

// POST /api/widget/ticket — publiek intake-endpoint voor contactformulieren/web-intakes van
// een organisatie. Landt als 'open' ticket in de helpdesk-inbox van díe organisatie
// (nooit zichtbaar voor andere organisaties) en krijgt direct een AI-conceptantwoord van 'Samen'.
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  const parsed = ticketSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }
  if (parsed.data.website) {
    return NextResponse.json({ data: { ok: true } }, { status: 200 }) // honeypot: doe alsof het lukte
  }

  const [organisatie] = await db
    .select({ id: organisaties.id })
    .from(organisaties)
    .where(eq(organisaties.slug, parsed.data.org))
    .limit(1)
  if (!organisatie) {
    return NextResponse.json({ error: 'Organisatie niet gevonden' }, { status: 404 })
  }

  const [ticket] = await db
    .insert(helpdeskTickets)
    .values({
      organisatieId: organisatie.id,
      naam: parsed.data.naam,
      email: parsed.data.email,
      onderwerp: parsed.data.onderwerp,
      bericht: parsed.data.bericht,
      bron: 'widget',
    })
    .returning({ id: helpdeskTickets.id })

  // Vercel-functies stoppen na de response, dus het concept moet vóór het antwoord klaar zijn.
  try {
    await genereerHelpdeskConcept(ticket.id, organisatie.id)
  } catch (err) {
    console.error('Kon geen helpdesk-concept genereren:', err)
  }

  return NextResponse.json({ data: { ok: true } }, { status: 200 })
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
