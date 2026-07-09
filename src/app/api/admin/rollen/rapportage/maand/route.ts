import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Mila (rapportage) — maandrapport met adopties, vrijwilligersuren en kosten als concept.
export const POST = maakSideEffectRoute({
  rol: 'rapportage',
  type: 'maandrapport',
  bouwTitel: () => `Maandrapport — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Genereer het maandrapport op basis van de data: adopties, vrijwilligersuren, kosten en match-successrates. ' +
    'Signaleer capaciteitsrisico (dieren die lang blijven) en geef 2-3 concrete aanbevelingen. Concreet en met cijfers.',
  maxTokens: 1100,
})
