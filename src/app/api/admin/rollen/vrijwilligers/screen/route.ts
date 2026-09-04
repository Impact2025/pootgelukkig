import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Bram (vrijwilligers) — screent de nieuwste sollicitatie, levert score + motivatie als concept.
export const POST = maakSideEffectRoute({
  rol: 'vrijwilligers',
  type: 'briefing',
  bouwTitel: () => `Screening sollicitatie — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Screen de nieuwste sollicitatie op basis van beschikbaarheid, motivatie en relevante ervaring. ' +
    'Geef een score (1-10) met korte onderbouwing per criterium en een concreet advies (uitnodigen / meer info / afwijzen).',
  maxTokens: 700,
})
