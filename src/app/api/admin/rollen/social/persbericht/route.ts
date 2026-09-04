import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Conny (social) — persbericht als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'social',
  type: 'briefing',
  bouwTitel: () => `Persbericht — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Schrijf een kort persbericht over de impact van de organisatie in de afgelopen periode.',
  maxTokens: 700,
})
