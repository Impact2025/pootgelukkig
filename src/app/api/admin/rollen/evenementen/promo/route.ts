import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Eva (evenementen) — promotiepost voor het volgende event als concept.
export const POST = maakSideEffectRoute({
  rol: 'evenementen',
  type: 'promo',
  platform: 'instagram',
  bouwTitel: () => `Event-promo — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Schrijf een wervende promotiepost voor het volgende event (gebruik het eerstvolgende event uit de data). ' +
    'Kort, enthousiast, met datum/tijd/locatie, een duidelijke call-to-action en passende hashtags.',
  maxTokens: 600,
})
