import { z } from 'zod'

export const contactSchema = z.object({
  naam: z.string().min(2, 'Vul je naam in').max(120),
  email: z.string().email('Ongeldig e-mailadres').max(200),
  asiel: z.string().max(160).optional(),
  onderwerp: z.enum(['algemeen', 'demo', 'doorbraak-sprint']).optional(),
  bericht: z.string().min(10, 'Schrijf een wat uitgebreider bericht').max(4000),
  // Honeypot: moet leeg blijven. Bots vullen dit veld vaak in.
  website: z.string().max(0).optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
