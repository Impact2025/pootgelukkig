import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Conny (social) — geanonimiseerd LinkedIn-artikel als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'social',
  type: 'social_post',
  bouwTitel: () => `LinkedIn-artikel — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Schrijf een geanonimiseerd LinkedIn-artikel over een recent succesvol traject. Geen namen of herleidbare gegevens.',
  maxTokens: 900,
})
