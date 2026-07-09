import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Medisch/Welzijn — eenvoudig medisch weekrapport als concept.
export const POST = maakSideEffectRoute({
  rol: 'medisch',
  type: 'rapport',
  bouwTitel: () => `Medisch weekrapport — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Genereer een eenvoudig, overzichtelijk medisch rapport voor deze week op basis van de data: ' +
    'achterstallige en aankomende vaccinaties/ontwormingen en dieren zonder recente welzijn-log. ' +
    'Verwijs bij twijfel door naar de dierenarts. Geef geen medisch advies dat een dierenartsbezoek vervangt.',
  maxTokens: 900,
})
