import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Sam (fundraising) — concept-subsidieaanvraag als wachtrij-item.
export const POST = maakSideEffectRoute({
  rol: 'fundraising',
  type: 'subsidie',
  bouwTitel: (body) => {
    const dossierTitel = typeof body.dossierTitel === 'string' && body.dossierTitel.trim() ? body.dossierTitel.trim() : 'traject'
    return `Subsidieaanvraag — ${dossierTitel}`
  },
  bouwPrompt: (body) => {
    const dossierTitel = typeof body.dossierTitel === 'string' && body.dossierTitel.trim() ? body.dossierTitel.trim() : ''
    return `Schrijf een concept-subsidieaanvraag voor een gemeentelijke of fonds-subsidie${dossierTitel ? ` gericht op het traject "${dossierTitel}"` : ''}, gebaseerd op de actieve dossiers.`
  },
  maxTokens: 1100,
})
