import type { aiRolEnum } from '@/lib/db/schema'

export type AiRolId = (typeof aiRolEnum.enumValues)[number]

export interface AiRolActie {
  id: string
  label: string
  icoon: string
  // Voorbeeld-prompt die de UI als user-bericht stuurt
  prompt: string
  // als true → roept side-effect endpoint aan i.p.v. chat
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
  // RAG-lite: bouw relevante context-tekst uit de DB voor dit asiel
  bouwContext: (asielId: number) => Promise<string>
  // Extra system-prompt-instructies specifiek voor deze rol
  systeemInstructie: string
  acties: AiRolActie[]
}
