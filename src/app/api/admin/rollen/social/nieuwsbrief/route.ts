import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Conny (social) — genereert een maandelijkse nieuwsbrief als concept.
export const POST = maakSideEffectRoute({
  rol: 'social',
  type: 'nieuwsbrief',
  platform: 'email',
  bouwTitel: () => `Nieuwsbrief — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Stel een maandelijkse nieuwsbrief samen met 3 adoptieverhalen (gebruik echte dieren uit de data) en een duidelijke oproep. ' +
    'Formaat: pakkende onderwerpregel, korte intro, 3 verhalen met kop, en een afsluitende call-to-action.',
  maxTokens: 1100,
})
