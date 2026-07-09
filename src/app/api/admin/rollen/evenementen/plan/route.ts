import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Eva (evenementen) — draaiboek + vrijwilligersrooster voor een adoptiedag als concept.
export const POST = maakSideEffectRoute({
  rol: 'evenementen',
  type: 'draaiboek',
  bouwTitel: (body) => {
    const naam = typeof body.naam === 'string' && body.naam.trim() ? body.naam.trim() : 'Adoptiedag'
    return `Draaiboek — ${naam}`
  },
  bouwPrompt: (body) => {
    const naam = typeof body.naam === 'string' && body.naam.trim() ? body.naam.trim() : 'een adoptiedag'
    return `Plan ${naam}: lever een compleet draaiboek (tijdlijn voor/tijdens/na) plus een vrijwilligersrooster ` +
      'op basis van de beschikbare vrijwilligers in de data. Geef ook een korte materialen-checklist.'
  },
  maxTokens: 1100,
})
