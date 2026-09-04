import type { aiRolEnum, aiContentTypeEnum } from '@/lib/db/schema'

export type AiRolId = (typeof aiRolEnum.enumValues)[number]
export type AiContentType = (typeof aiContentTypeEnum.enumValues)[number]

export interface AiRolActie {
  id: string
  label: string
  icoon: string
  // Voorbeeld-prompt die de UI als user-bericht stuurt
  prompt: string
  // Content-type waaronder deze actie in ai_content_queue belandt
  type: AiContentType
  // als true → roept side-effect endpoint aan i.p.v. losse chat (schrijft ALTIJD naar de queue)
  sideEffect?: boolean
  endpoint?: string
}

export interface AiRol {
  id: AiRolId
  naam: string
  titel: string
  icoon: string
  kleur: string
  beschrijving: string
  // RAG-lite: bouw relevante context-tekst uit de DB voor deze organisatie
  bouwContext: (organisatieId: string) => Promise<string>
  // Extra system-prompt-instructies specifiek voor deze rol
  systeemInstructie: string
  acties: AiRolActie[]
  // Model-routering: 'haiku' voor triage/screening/chat, 'sonnet' voor complexe schrijf-/analysetaken
  modelKlasse: 'haiku' | 'sonnet'
  // Uitgaande communicatie/rapportages moeten ALTIJD via de content-queue (status 'pending')
  vereistGoedkeuring: boolean
}
