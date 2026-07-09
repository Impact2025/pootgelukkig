// Generieke fabriek voor rol-side-effect endpoints.
// Een side-effect genereert content via de AI en schrijft die als CONCEPT
// naar de ai_content_queue — er wordt NOOIT automatisch gepubliceerd of gemaild.
// Een medewerker keurt het concept goed in de content-queue.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiContentQueue } from '@/lib/db/schema'
import { chatCompletion } from '@/lib/ai/client'
import { haalRol, type AiRolId } from '@/lib/ai/rollen'

interface SideEffectConfig {
  // Rol waartoe dit endpoint hoort (voor context + systeemprompt + queue-rij)
  rol: AiRolId
  // Type content dat weggeschreven wordt (bv. 'nieuwsbrief', 'vacature', 'rapport')
  type: string
  // Optioneel platform (bv. 'instagram', 'facebook', 'email')
  platform?: string
  // Bouw de user-prompt voor de AI. Krijgt de request-body mee (optioneel).
  bouwPrompt: (body: Record<string, unknown>) => string
  // Bouw een korte titel voor het queue-item.
  bouwTitel: (body: Record<string, unknown>) => string
  // Max tokens voor de generatie (default 900).
  maxTokens?: number
}

export function maakSideEffectRoute(config: SideEffectConfig) {
  return async function POST(request: NextRequest) {
    const session = await auth()
    if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
      return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
    }

    const asielId = session.user.asielId
    if (!asielId) {
      return NextResponse.json({ fout: 'Geen asiel gekoppeld aan dit account' }, { status: 400 })
    }

    let body: Record<string, unknown> = {}
    try {
      const raw = await request.text()
      if (raw.trim()) body = JSON.parse(raw) as Record<string, unknown>
    } catch {
      // lege of ongeldige body → gebruik defaults
    }

    const rol = haalRol(config.rol)
    if (!rol) {
      return NextResponse.json({ fout: `Onbekende rol: ${config.rol}` }, { status: 400 })
    }

    // RAG-lite rol-context ophalen
    let rolContext = ''
    try {
      rolContext = await rol.bouwContext(Number(asielId))
    } catch (error) {
      console.error(`Rol-context fout (${rol.id}/${config.type}):`, error)
    }

    const systemPrompt = `${rol.systeemInstructie}

ASIEL DATA:
${rolContext}

STIJL:
- Persoonlijk en warm, maar professioneel
- Concreet met echte namen en cijfers uit de data hierboven
- Alle tekst in het Nederlands
- Lever een compleet, direct bruikbaar concept (geen meta-uitleg, geen vraag terug)`

    let inhoud: string
    try {
      inhoud = await chatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: config.bouwPrompt(body) },
        ],
        {
          maxTokens: config.maxTokens ?? 900,
          meta: { module: `rol-${rol.id}-${config.type}`, userId: Number(session.user.id), asielId: Number(asielId) },
        }
      )
    } catch (error) {
      console.error(`Side-effect generatie fout (${rol.id}/${config.type}):`, error)
      return NextResponse.json({ fout: 'Genereren mislukt. Probeer opnieuw.' }, { status: 500 })
    }

    // Concept wegschrijven naar de content-queue (status = concept, wacht op goedkeuring)
    let queueId: number | null = null
    try {
      const [rij] = await db
        .insert(aiContentQueue)
        .values({
          asielId: Number(asielId),
          rol: config.rol,
          type: config.type,
          platform: config.platform ?? null,
          titel: config.bouwTitel(body).slice(0, 255),
          inhoud,
          status: 'concept',
          gemaaktDoor: 'ai',
        })
        .returning({ id: aiContentQueue.id })
      queueId = rij?.id ?? null
    } catch (error) {
      console.error(`Content-queue schrijffout (${rol.id}/${config.type}):`, error)
      // De generatie is gelukt — geef inhoud terug, meld dat opslaan faalde
      return NextResponse.json(
        { inhoud, opgeslagen: false, waarschuwing: 'Concept gegenereerd maar niet opgeslagen in de queue.' },
        { status: 200 }
      )
    }

    return NextResponse.json({ inhoud, opgeslagen: true, queueId, type: config.type, rol: config.rol }, { status: 200 })
  }
}
