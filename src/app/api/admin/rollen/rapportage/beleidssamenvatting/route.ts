import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Mila (rapportage) — beleidssamenvatting voor de gemeente als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'rapportage',
  type: 'briefing',
  bouwTitel: () => `Beleidssamenvatting — ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`,
  bouwPrompt: () =>
    "Schrijf een korte beleidssamenvatting voor de gemeente met de belangrijkste resultaten en risico's.",
  maxTokens: 800,
})
