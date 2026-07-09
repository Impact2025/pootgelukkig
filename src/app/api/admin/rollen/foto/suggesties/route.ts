import { maakSideEffectRoute } from '@/lib/ai/rollen/sideEffect'

export const dynamic = 'force-dynamic'

// Finn (foto) — praktische fototips voor het huidige dier als concept.
export const POST = maakSideEffectRoute({
  rol: 'foto',
  type: 'fototips',
  bouwTitel: (body) => {
    const dier = typeof body.dier === 'string' && body.dier.trim() ? body.dier.trim() : 'een dier'
    return `Fototips — ${dier}`
  },
  bouwPrompt: (body) => {
    const dier = typeof body.dier === 'string' && body.dier.trim() ? body.dier.trim() : 'een beschikbaar dier uit de data'
    return `Geef praktische fototips voor ${dier}: belichting, hoofdhoogte, achtergrond en het karakter vangen. ` +
      'Genereer GEEN misleidende beelden — lever alleen tekstuele suggesties en een "ideaal foto-prompt".'
  },
  maxTokens: 700,
})
