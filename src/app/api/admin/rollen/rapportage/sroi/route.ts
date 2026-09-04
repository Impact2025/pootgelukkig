import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Mila (rapportage) — SROI-rapportage als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'rapportage',
  type: 'rapportage',
  bouwTitel: () => `SROI-rapportage — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Stel een SROI-rapportage (social return on investment) samen op basis van de trajectresultaten.',
  maxTokens: 1100,
})
