import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Mila (rapportage) — Wmo-rapportage met trajectcijfers, veldlogs en vrijwilligersuren als concept.
export const POST = maakSideEffectRoute({
  rol: 'rapportage',
  type: 'rapportage',
  bouwTitel: () => `Wmo-rapportage — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Genereer de maandrapportage op basis van de data: trajectcijfers (begeleidingen), veldlogs en vrijwilligersuren. ' +
    'Signaleer risico\'s (bv. stagnerende trajecten) en geef 2-3 concrete aanbevelingen. Concreet en met cijfers.',
  maxTokens: 1100,
})
