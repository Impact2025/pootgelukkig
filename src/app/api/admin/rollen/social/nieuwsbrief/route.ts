import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Conny (social) — genereert een maandelijkse impact-nieuwsbrief als concept.
export const POST = maakSideEffectRoute({
  rol: 'social',
  type: 'email',
  bouwTitel: () => `Impact-nieuwsbrief — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Stel een maandelijkse impact-nieuwsbrief samen met 2-3 geanonimiseerde trajectverhalen (gebruik de data, geen namen of herleidbare details) en een duidelijke oproep. ' +
    'Formaat: pakkende onderwerpregel, korte intro, 2-3 verhalen met kop, en een afsluitende call-to-action.',
  maxTokens: 1100,
})
