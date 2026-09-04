// Generieke fabriek voor rol-side-effect endpoints.
// Een side-effect genereert content via de AI en schrijft die ALTIJD als 'pending'
// naar de ai_content_queue — er wordt NOOIT automatisch gepubliceerd of verstuurd.
// Een medewerker keurt het concept goed (of wijst het af) in de content-queue.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { chatCompletion, MODEL_HAIKU, MODEL_SONNET } from '@/lib/ai/client'
import { plaatsInQueue } from '@/lib/ai/queue'
import { haalRol, haalRolConfig, type AiRolId, type AiContentType } from '@/lib/ai/rollen'

interface SideEffectConfig {
  // Rol waartoe dit endpoint hoort (voor context + systeemprompt + queue-rij)
  rol: AiRolId
  // Content-type waaronder dit item in ai_content_queue belandt
  type: AiContentType
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

    const organisatieId = session.user.organisatieId
    if (!organisatieId) {
      return NextResponse.json({ fout: 'Geen organisatie gekoppeld aan dit account' }, { status: 400 })
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
      return NextResponse.json({ fout: `Onbekende of gedeactiveerde rol: ${config.rol}` }, { status: 400 })
    }

    // RAG-lite rol-context ophalen
    let rolContext = ''
    try {
      rolContext = await rol.bouwContext(organisatieId)
    } catch (error) {
      console.error(`Rol-context fout (${rol.id}/${config.type}):`, error)
    }

    // Dynamische organisatie-configuratie: custom system-prompt/instellingen uit ai_rollen_config
    const rolConfig = await haalRolConfig(organisatieId, rol.id).catch(() => null)
    if (rolConfig && rolConfig.actief === false) {
      return NextResponse.json({ fout: `Rol ${rol.naam} staat uit voor deze organisatie` }, { status: 403 })
    }

    const systemPrompt = `${rol.systeemInstructie}

ORGANISATIE-DATA:
${rolContext}
${rolConfig?.systemPrompt ? `\nORGANISATIE-SPECIFIEKE INSTRUCTIES (overschrijft/vult bovenstaande aan):\n${rolConfig.systemPrompt}\n` : ''}
STIJL:
- Persoonlijk en zorgvuldig, maar professioneel
- Concreet met echte gegevens uit de data hierboven, nooit verzonnen cijfers
- Alle tekst in het Nederlands
- Lever een compleet, direct bruikbaar concept (geen meta-uitleg, geen vraag terug)`

    const model = rol.modelKlasse === 'haiku' ? MODEL_HAIKU : MODEL_SONNET

    let content: string
    try {
      content = await chatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: config.bouwPrompt(body) },
        ],
        {
          model,
          maxTokens: config.maxTokens ?? 900,
          meta: { actie: `rol-${rol.id}-${config.type}`, organisatieId, userId: Number(session.user.id) },
        }
      )
    } catch (error) {
      console.error(`Side-effect generatie fout (${rol.id}/${config.type}):`, error)
      return NextResponse.json({ fout: 'Genereren mislukt. Probeer opnieuw.' }, { status: 500 })
    }

    // Concept ALTIJD wegschrijven naar de content-queue (status = pending, wacht op goedkeuring)
    let queueId: number | null = null
    try {
      const rij = await plaatsInQueue({
        organisatieId,
        rol: config.rol,
        type: config.type,
        titel: config.bouwTitel(body),
        content,
        metadata: { gemaaktDoor: 'ai', model },
      })
      queueId = rij.id
    } catch (error) {
      console.error(`Content-queue schrijffout (${rol.id}/${config.type}):`, error)
      // De generatie is gelukt — geef content terug, meld dat opslaan faalde
      return NextResponse.json(
        { content, opgeslagen: false, waarschuwing: 'Concept gegenereerd maar niet opgeslagen in de queue.' },
        { status: 200 }
      )
    }

    return NextResponse.json({ content, opgeslagen: true, queueId, type: config.type, rol: config.rol }, { status: 200 })
  }
}
