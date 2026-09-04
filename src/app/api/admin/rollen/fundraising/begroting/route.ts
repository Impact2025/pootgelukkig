import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Sam (fundraising) — beknopte projectbegroting als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'fundraising',
  type: 'subsidie',
  bouwTitel: () => `Projectbegroting — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Stel een beknopte projectbegroting op voor een nieuw of lopend traject, inclusief personeels- en materiaalkosten.',
  maxTokens: 900,
})
