// Prijstabel voor AI-modellen (USD per 1M tokens) → omgerekend naar euro-kosten per call.
// OpenRouter geeft bij `usage: { include: true }` soms een echte `cost` (in USD) terug;
// die gebruiken we als hij er is. Anders schatten we via deze tabel.

const USD_NAAR_EUR = 0.92

interface ModelPrijs {
  invoer: number // USD per 1M prompt tokens
  uitvoer: number // USD per 1M completion tokens
}

// Bekende modellen — vul aan naar behoefte. Sleutel = OpenRouter model-id.
const PRIJZEN: Record<string, ModelPrijs> = {
  'anthropic/claude-sonnet-4.5': { invoer: 3, uitvoer: 15 },
  'anthropic/claude-sonnet-5': { invoer: 3, uitvoer: 15 },
  'anthropic/claude-haiku-4.5': { invoer: 0.8, uitvoer: 4 },
  'openai/gpt-4o': { invoer: 2.5, uitvoer: 10 },
  'openai/gpt-4o-mini': { invoer: 0.15, uitvoer: 0.6 },
  'google/gemini-flash-1.5': { invoer: 0.075, uitvoer: 0.3 },
}

// Fallback voor onbekende modellen (gemiddelde van een sonnet-klasse model)
const FALLBACK: ModelPrijs = { invoer: 3, uitvoer: 15 }

/**
 * Bereken de kosten van een AI-call in euro.
 * @param model         OpenRouter model-id
 * @param promptTokens  aantal invoer-tokens
 * @param completionTokens aantal uitvoer-tokens
 * @param echteKostenUsd optionele echte kosten (USD) die OpenRouter teruggeeft
 */
export function berekenKostenEuro(
  model: string,
  promptTokens: number,
  completionTokens: number,
  echteKostenUsd?: number | null
): number {
  if (typeof echteKostenUsd === 'number' && echteKostenUsd > 0) {
    return round6(echteKostenUsd * USD_NAAR_EUR)
  }
  const prijs = PRIJZEN[model] ?? FALLBACK
  const usd = (promptTokens / 1_000_000) * prijs.invoer + (completionTokens / 1_000_000) * prijs.uitvoer
  return round6(usd * USD_NAAR_EUR)
}

function round6(n: number): number {
  return Math.round(n * 1_000_000) / 1_000_000
}
