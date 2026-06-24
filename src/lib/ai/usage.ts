import { db } from '@/lib/db'
import { aiGebruik } from '@/lib/db/schema'
import { berekenKostenEuro } from './pricing'

export interface AiMeta {
  module: string
  userId?: number | null
  asielId?: number | null
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
  meta: AiMeta | undefined,
  model: string,
  usage: AiUsage | undefined
): Promise<void> {
  if (!meta) return
  try {
    const promptTokens = usage?.prompt_tokens ?? 0
    const completionTokens = usage?.completion_tokens ?? 0
    const totaalTokens = usage?.total_tokens ?? promptTokens + completionTokens
    const kostenEuro = berekenKostenEuro(model, promptTokens, completionTokens, usage?.cost)

    await db.insert(aiGebruik).values({
      module: meta.module,
      userId: meta.userId ?? null,
      asielId: meta.asielId ?? null,
      model,
      promptTokens,
      completionTokens,
      totaalTokens,
      kostenEuro,
    })
  } catch (err) {
    console.error('[AI-gebruik] loggen mislukt:', err)
  }
}
