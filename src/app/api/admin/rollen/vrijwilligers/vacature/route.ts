import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Bram (vrijwilligers) — vacaturetekst als concept.
export const POST = maakSideEffectRoute({
  rol: 'vrijwilligers',
  type: 'briefing',
  bouwTitel: (body) => {
    const functie = typeof body.functie === 'string' && body.functie.trim() ? body.functie.trim() : 'vrijwilliger'
    return `Vacature — ${functie}`
  },
  bouwPrompt: (body) => {
    const functie = typeof body.functie === 'string' && body.functie.trim() ? body.functie.trim() : 'dierenverzorger'
    return `Schrijf een heldere, warme vacaturetekst voor een nieuwe vrijwilliger (functie: ${functie}). ` +
      'Formaat: functietitel, over ons, wat ga je doen, wat vragen we, wat bieden we, en hoe solliciteren.'
  },
  maxTokens: 900,
})
