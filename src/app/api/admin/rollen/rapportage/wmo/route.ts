import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Mila (rapportage) — Wmo-rapportage als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'rapportage',
  type: 'rapportage',
  bouwTitel: () => `Wmo-rapportage — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Genereer een Wmo-rapportage over de afgelopen maand op basis van de trajectcijfers en veldlogs.',
  maxTokens: 1100,
})
