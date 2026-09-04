import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { organisaties, aiRollenConfig } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { chatStream, MODEL_HAIKU } from '@/lib/ai/client'
import { haalRol } from '@/lib/ai/rollen'

export const dynamic = 'force-dynamic'

type Bericht = { rol: 'user' | 'assistant'; inhoud: string }

// POST /api/widget/chat — publieke chat-endpoint voor de embeddable "Samen" webassistent-widget.
// Verwacht { org: string (organisatie-slug), berichten: Bericht[] }.
export async function POST(request: NextRequest) {
  let body: { org?: string; berichten?: Bericht[] }
  try {
    body = (await request.json()) as { org?: string; berichten?: Bericht[] }
  } catch {
    return new Response('Ongeldig verzoek', { status: 400 })
  }

  const { org, berichten } = body
  if (!org || !berichten?.length) {
    return new Response('org en berichten zijn verplicht', { status: 400 })
  }

  const [organisatie] = await db
    .select({ id: organisaties.id, naam: organisaties.naam })
    .from(organisaties)
    .where(eq(organisaties.slug, org))
    .limit(1)

  if (!organisatie) {
    return new Response('Organisatie niet gevonden', { status: 404 })
  }

  const rol = haalRol('chat')
  if (!rol) {
    return new Response('Chat-assistent niet beschikbaar', { status: 503 })
  }

  // Alleen antwoorden als de organisatie de 'chat'-rol (Samen) heeft geactiveerd.
  const [config] = await db
    .select({ actief: aiRollenConfig.actief, systemPrompt: aiRollenConfig.systemPrompt })
    .from(aiRollenConfig)
    .where(and(eq(aiRollenConfig.organisatieId, organisatie.id), eq(aiRollenConfig.rol, 'chat')))
    .limit(1)

  if (config && config.actief === false) {
    return new Response('Chat-assistent staat uit voor deze organisatie', { status: 403 })
  }

  let kennisbankContext = ''
  try {
    kennisbankContext = await rol.bouwContext(organisatie.id)
  } catch (error) {
    console.error('Widget kennisbank-context fout:', error)
  }

  const systemPrompt = `${rol.systeemInstructie}

ORGANISATIE: ${organisatie.naam}
${kennisbankContext}
${config?.systemPrompt ? `\nORGANISATIE-SPECIFIEKE INSTRUCTIES:\n${config.systemPrompt}\n` : ''}
Antwoord kort en vriendelijk in het Nederlands.`

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...berichten.map((b) => ({ role: b.rol, content: b.inhoud })),
  ]

  try {
    const stream = await chatStream(messages, {
      model: MODEL_HAIKU,
      maxTokens: 400,
      meta: { actie: 'rol-chat-widget', organisatieId: organisatie.id },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Widget streaming fout:', error)
    return new Response('Er ging iets mis. Probeer opnieuw.', { status: 500 })
  }
}

// Sta CORS preflight toe zodat de widget vanaf elke externe site (WordPress/Wix) kan posten.
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
