// Centrale helper voor de human-in-the-loop wachtrij (ai_content_queue).
//
// Veiligheidsregel: uitgaande communicatie en rapportages van de AI-rollen (Sam, Mila, Conny, ...)
// worden ALTIJD met status 'pending' in de wachtrij geplaatst. Niets vertrekt autonoom — een
// medewerker keurt elk item in de content-queue goed (of wijst het af) voordat het de deur uit gaat.

import { db } from '@/lib/db'
import { aiContentQueue } from '@/lib/db/schema'
import type { AiRolId } from './rollen/types'
import type { AiContentType } from './rollen/types'

export interface PlaatsInQueueInput {
  organisatieId: string
  rol: AiRolId
  type: AiContentType
  titel: string
  content: string
  metadata?: Record<string, unknown>
}

export interface QueueItemResultaat {
  id: number
}

/**
 * Schrijft een AI-generatie weg naar ai_content_queue met status 'pending'.
 * De status is bewust niet instelbaar via de aanroeper — goedkeuring gebeurt
 * altijd via een aparte review-stap (bv. PATCH /api/admin/content-queue/[id]).
 */
export async function plaatsInQueue(input: PlaatsInQueueInput): Promise<QueueItemResultaat> {
  const [rij] = await db
    .insert(aiContentQueue)
    .values({
      organisatieId: input.organisatieId,
      rol: input.rol,
      type: input.type,
      titel: input.titel.slice(0, 255),
      content: input.content,
      status: 'pending',
      metadata: input.metadata ?? {},
    })
    .returning({ id: aiContentQueue.id })

  if (!rij) {
    throw new Error('Wegschrijven naar ai_content_queue is mislukt')
  }
  return { id: rij.id }
}
