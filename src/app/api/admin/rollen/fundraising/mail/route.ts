import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Sam (fundraising) — gepersonaliseerde donateurs-mail als concept.
export const POST = maakSideEffectRoute({
  rol: 'fundraising',
  type: 'email',
  bouwTitel: () => `Donateurs-mail — ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    'Stel een gepersonaliseerde mail op voor onze "major"-donoren (structurele/grote gevers). ' +
    'Warm, respectvol, met concrete impact uit de data en een heldere vervolgstap. Lever onderwerpregel + body.',
  maxTokens: 900,
})
