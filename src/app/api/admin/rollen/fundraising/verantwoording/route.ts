import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Sam (fundraising) — fondsverantwoording als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'fundraising',
  type: 'subsidie',
  bouwTitel: () => `Fondsverantwoording — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Schrijf een fondsverantwoording over de afgelopen periode op basis van de dossiercijfers.',
  maxTokens: 1000,
})
