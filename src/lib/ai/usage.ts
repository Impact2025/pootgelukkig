import { db } from '@/lib/db'
import { aiGebruik } from '@/lib/db/schema'
import { berekenKostenEuro } from './pricing'

export interface AiMeta {
  // Elke AI-generatie is verplicht gekoppeld aan een organisatie (multi-tenant kostentracking).
  organisatieId: string
  // Korte actie-naam, bv. 'rol-fundraising-appeal', 'matching', 'intake'
  actie: string
  userId?: number | null
}

export interface AiUsage {
  prompt_tokens?: number
  completion_tokens?: number
  total_tokens?: number
  cost?: number // USD, indien OpenRouter het meelevert
}

/**
 * Log één AI-call naar de ai_gebruik-tabel. Niet-blokkerend: fouten worden
 * gelogd maar nooit doorgegooid, zodat een logfout nooit een AI-respons breekt.
 */
export async function logAiGebruik(
  meta: AiMeta,
  model: string,
  usage: AiUsage | undefined
): Promise<void> {
  try {
    const tokensIn = usage?.prompt_tokens ?? 0
    const tokensOut = usage?.completion_tokens ?? 0
    const kostenEuro = berekenKostenEuro(model, tokensIn, tokensOut, usage?.cost)

    await db.insert(aiGebruik).values({
      organisatieId: meta.organisatieId,
      model,
      tokensIn,
      tokensOut,
      kostenEuro: kostenEuro.toFixed(6),
      actie: meta.actie,
      userId: meta.userId ?? null,
    })
  } catch (err) {
    console.error('[AI-gebruik] loggen mislukt:', err)
  }
}
