import { z } from 'zod'

// Lengte van de gewenste demonstratie (bepaalt de voorbereiding).
export const demoDuurEnum = z.enum(['snel', 'compleet'])
export type DemoDuur = z.infer<typeof demoDuurEnum>

// Voorkeur voor het videobel-platform.
export const demoPlatformEnum = z.enum(['teams', 'meet', 'geen_voorkeur'])

export const demoAanvraagSchema = z.object({
  // Contact
  naam: z.string().min(2, 'Vul je naam in').max(120),
  functie: z.string().min(2, 'Vul je functie in').max(120),
  email: z.string().email('Ongeldig e-mailadres').max(200),
  telefoon: z.string().max(30).optional(),

  // Asiel
  asielNaam: z.string().min(2, 'Vul de naam van het asiel in').max(200),
  asielPlaats: z.string().min(2, 'Vul de plaats van het asiel in').max(120),
  aantalDieren: z
    .number({ invalid_type_error: 'Vul een getal in' })
    .int('Moet een heel getal zijn')
    .min(0, 'Mag niet negatief zijn')
    .max(100000)
    .optional(),
  huidigSysteem: z.string().max(300).optional(),

  // Demonstratie-voorkeur
  duur: demoDuurEnum,
  platform: demoPlatformEnum,

  // Voorkeursmomenten — array met 1-3 opties, elk: weekdag + dagdeel
  momenten: z
    .array(
      z.object({
        dag: z.enum(['ma', 'di', 'wo', 'do', 'vr']),
        dagdeel: z.enum(['ochtend', 'middag']),
      })
    )
    .min(1, 'Kies minstens één voorkeursmoment')
    .max(4, 'Kies maximaal vier voorkeursmomenten'),

  // Voorbereiding: waar kijken jullie het liefst naar?
  focus: z.array(z.string()).max(6).optional(),

  // Vrij veld
  opmerkingen: z.string().max(4000).optional(),

  // Honeypot: moet leeg blijven.
  website: z.string().max(0).optional(),
})

export type DemoAanvraagInput = z.infer<typeof demoAanvraagSchema>

// Labels voor de e-mail/CRM-samenvatting.
export const DAG_LABELS: Record<string, string> = {
  ma: 'Maandag',
  di: 'Dinsdag',
  wo: 'Woensdag',
  do: 'Donderdag',
  vr: 'Vrijdag',
}

export const DAGDEEL_LABELS: Record<string, string> = {
  ochtend: 'ochtend (09:00–12:00)',
  middag: 'middag (12:00–14:00)',
}

export const FOCUS_LABELS: Record<string, string> = {
  dashboard: 'Asiel-dashboard & dierenbeheer',
  intake: 'Snelle intakes met Dr. Poot',
  matching: 'Het matching-algoritme ("Dr. Poot")',
  pilot: 'Hoe een proefperiode (pilot) werkt',
  nazorg: 'Nazorg (100-dagen begeleiding)',
  kosten: 'Prijzen & voorwaarden',
}

export const DUUR_LABELS: Record<DemoDuur, string> = {
  snel: 'De Snelle Tour (15–20 min)',
  compleet: 'De Complete Demo (30–40 min)',
}

export const PLATFORM_LABELS: Record<string, string> = {
  teams: 'Microsoft Teams',
  meet: 'Google Meet',
  geen_voorkeur: 'Geen voorkeur',
}
