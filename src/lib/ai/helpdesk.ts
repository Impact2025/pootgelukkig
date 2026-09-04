// Genereert een concept-antwoord van 'Samen' voor een binnengekomen helpdesk-ticket en
// plaatst dit — net als elke andere AI-output — als 'pending' in de content-queue voor
// menselijke controle. Niets wordt hier ooit automatisch verstuurd.

import { db } from '@/lib/db'
import { helpdeskTickets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { chatCompletion, MODEL_HAIKU } from './client'
import { haalRol } from './rollen'
import { plaatsInQueue } from './queue'

export async function genereerHelpdeskConcept(ticketId: number, organisatieId: string): Promise<void> {
  const [ticket] = await db.select().from(helpdeskTickets).where(eq(helpdeskTickets.id, ticketId)).limit(1)
  if (!ticket) return

  const rol = haalRol('chat')
  if (!rol) return

  let context = ''
  try {
    context = await rol.bouwContext(organisatieId)
  } catch (error) {
    console.error('Helpdesk-concept: kennisbank-context ophalen mislukt:', error)
  }

  const systemPrompt = `${rol.systeemInstructie}\n\n${context}\n\nJe schrijft nu een conceptantwoord op een binnengekomen bericht via het contactformulier. Schrijf een compleet, verzendklaar e-mailantwoord (zonder aanhef-placeholder — gebruik de naam van de afzender). Sluit af met een vriendelijke groet namens de organisatie.`

  let concept: string
  try {
    concept = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Naam: ${ticket.naam}\nOnderwerp: ${ticket.onderwerp}\nBericht:\n${ticket.bericht}`,
        },
      ],
      { model: MODEL_HAIKU, maxTokens: 500, meta: { organisatieId, actie: 'helpdesk-concept' } }
    )
  } catch (error) {
    console.error('Helpdesk-concept: AI-generatie mislukt:', error)
    return
  }

  const { id: queueId } = await plaatsInQueue({
    organisatieId,
    rol: 'chat',
    type: 'email',
    titel: `Concept antwoord: ${ticket.onderwerp}`,
    content: concept,
    metadata: { ticketId: ticket.id, naarEmail: ticket.email, naarNaam: ticket.naam },
  })

  await db
    .update(helpdeskTickets)
    .set({ conceptQueueId: queueId, status: 'concept_klaar' })
    .where(eq(helpdeskTickets.id, ticketId))
}
