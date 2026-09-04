import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Bram (vrijwilligers) — retentiebericht als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'vrijwilligers',
  type: 'email',
  bouwTitel: () => `Retentiebericht — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Schrijf een kort, persoonlijk retentiebericht voor een vrijwilliger/maatje die minder actief is geworden.',
  maxTokens: 500,
})
