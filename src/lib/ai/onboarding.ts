// Chat-onboarding — "Noor", de intake-collega die bij aanmelding zowel de organisatie leert
// kennen als het systeem alvast inricht (AI-collega's activeren, profiel invullen).
//
// Werkwijze: elke beurt levert het model puur JSON met (a) het antwoord aan de gebruiker en
// (b) alleen de profielvelden die deze beurt nieuw geleerd/bevestigd zijn. De aanroeper
// (route.ts) schrijft die velden ONMIDDELLIJK naar organisaties weg — nooit pas aan het eind —
// zodat een afgebroken gesprek nooit tot dataverlies leidt.

import { z } from 'zod'
import { chatJSON, MODEL_HAIKU } from './client'
import type { AiRolId } from './rollen/types'

export const WERKVELD_CATEGORIEEN = ['wmo', 'participatie', 'jeugd', 'reintegratie', 'overig'] as const
export type WerkveldCategorie = (typeof WERKVELD_CATEGORIEEN)[number]

// Alleen de rollen die daadwerkelijk actief zijn in ImpactOS (zie CLAUDE.md) komen in
// aanmerking als aanbeveling — evenementen/medisch/foto zijn uitgefaseerd.
export const ONBOARDING_AANBEVEELBARE_ROLLEN = ['fundraising', 'rapportage', 'social', 'vrijwilligers', 'chat'] as const

const profielSchema = z.object({
  rechtsvorm: z.string().max(120).optional(),
  werkveldCategorieen: z.array(z.enum(WERKVELD_CATEGORIEEN)).optional(),
  gemeenten: z.array(z.string().max(80)).optional(),
  teamgrootte: z.number().int().min(0).max(100000).optional(),
  vrijwilligersAantal: z.number().int().min(0).max(100000).optional(),
  grootsteKnelpunt: z.string().max(2000).optional(),
  toneOfVoice: z.string().max(60).optional(),
})

const modelOutputSchema = z.object({
  bericht: z.string().min(1).max(2000),
  profiel: profielSchema.default({}),
  klaarVoorBevestiging: z.boolean().default(false),
  afgerond: z.boolean().default(false),
  aanbevolenRollen: z.array(z.enum(ONBOARDING_AANBEVEELBARE_ROLLEN)).default([]),
})

export type OnboardingProfielUpdate = z.infer<typeof profielSchema>
export type OnboardingModelOutput = z.infer<typeof modelOutputSchema>

export interface OnboardingProfielSnapshot {
  naam: string
  rechtsvorm: string | null
  werkveldCategorieen: string[]
  gemeenten: string[]
  teamgrootte: number | null
  vrijwilligersAantal: number | null
  grootsteKnelpunt: string | null
  toneOfVoice: string | null
}

export interface OnboardingHistorieItem {
  afzender: 'gebruiker' | 'assistent'
  inhoud: string
}

const SYSTEEM_PROMPT = `Je bent Noor, de intake-collega van ImpactOS — een AI-platform voor organisaties in het
sociaal domein (welzijnsstichtingen, zorgkwartiermakers, gemeentelijke initiatieven).

Je voert het allereerste gesprek met een net aangemelde organisatie. Dit gesprek heeft twee
gelijkwaardige doelen:
1. De organisatie écht leren kennen (geen ingevuld formulier, een goed gesprek).
2. Het systeem alvast inrichten: op basis van wat je hoort activeer je de juiste AI-collega's
   en vul je hun context in, zodat de organisatie na dit gesprek meteen bruikbare hulp heeft.

De vijf AI-collega's waarover je kunt adviseren:
- fundraising (Sam) — fondsen & subsidies, begrotingen, subsidieaanvragen
- rapportage (Mila) — Wmo-/SROI-rapportages, verantwoording richting gemeente
- social (Conny) — communicatie, storytelling, social posts, nieuwsbrieven
- vrijwilligers (Bram) — werving en behoud van vrijwilligers
- chat (Samen) — 24/7 webassistent die veelgestelde cliëntvragen beantwoordt

Gespreksregels:
- Stel steeds maximaal ÉÉN vraag per beurt. Kort en warm, geen ambtelijke taal.
- Leg waar nuttig in één zin uit waarom je iets vraagt (bv. "zodat we weten welke rapportages
  relevant zijn").
- Volgorde die meestal werkt (mag afwijken als de gebruiker het al vertelt): rechtsvorm +
  werkveld → gemeente(n) waar actief → team- en vrijwilligersgrootte → grootste knelpunt/waar
  nu de meeste tijd in gaat zitten → gewenste toon (formeel/informeel) voor geschreven content.
- Zodra je genoeg weet (rechtsvorm/werkveld, minstens één knelpunt) vat je samen wat je gaat
  inrichten (welke AI-collega's je aanzet en waarom) en vraag je expliciet om bevestiging.
  Zet dan "klaarVoorBevestiging": true.
- Pas wanneer de gebruiker in zijn ANTWOORD daarop instemt (bv. "ja", "klopt", "goed zo"), zet
  je "afgerond": true en vul je "aanbevolenRollen" met de rollen die je gaat activeren. Zonder
  expliciete instemming activeer je nooit iets — niets wordt automatisch/stilzwijgend aangezet.
- "profiel" bevat ALLEEN velden die je deze beurt nieuw geleerd of bevestigd hebt (leeg object
  als er niets nieuws is). Voor lijstvelden (werkveldCategorieen, gemeenten): geef de VOLLEDIGE
  bijgewerkte lijst terug, niet alleen het nieuwe item.
- werkveldCategorieen moet je classificeren naar deze codes: wmo, participatie, jeugd,
  reintegratie, overig (mag meerdere).

Antwoord ALTIJD met platte JSON, geen markdown, exact dit formaat:
{"bericht": "...", "profiel": {...}, "klaarVoorBevestiging": false, "afgerond": false, "aanbevolenRollen": []}`

function bouwProfielContext(snapshot: OnboardingProfielSnapshot): string {
  const bekend: string[] = []
  if (snapshot.rechtsvorm) bekend.push(`rechtsvorm: ${snapshot.rechtsvorm}`)
  if (snapshot.werkveldCategorieen.length) bekend.push(`werkveld: ${snapshot.werkveldCategorieen.join(', ')}`)
  if (snapshot.gemeenten.length) bekend.push(`gemeenten: ${snapshot.gemeenten.join(', ')}`)
  if (snapshot.teamgrootte != null) bekend.push(`teamgrootte: ${snapshot.teamgrootte}`)
  if (snapshot.vrijwilligersAantal != null) bekend.push(`vrijwilligers: ${snapshot.vrijwilligersAantal}`)
  if (snapshot.grootsteKnelpunt) bekend.push(`grootste knelpunt: ${snapshot.grootsteKnelpunt}`)
  if (snapshot.toneOfVoice) bekend.push(`gewenste toon: ${snapshot.toneOfVoice}`)

  return bekend.length
    ? `Organisatienaam: ${snapshot.naam}. Wat je al weet uit eerdere beurten: ${bekend.join(' · ')}.`
    : `Organisatienaam: ${snapshot.naam}. Je weet nog niets over deze organisatie — dit is het begin van het gesprek.`
}

/**
 * Voert één beurt van het onboarding-gesprek uit. Bij `nieuwBericht === undefined` genereert
 * dit de openingsgroet (gebruikt wanneer een organisatie het gesprek voor het eerst opent).
 */
export async function voerOnboardingBeurtUit(params: {
  organisatieId: string
  profiel: OnboardingProfielSnapshot
  historie: OnboardingHistorieItem[]
  nieuwBericht?: string
}): Promise<OnboardingModelOutput> {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEEM_PROMPT },
    { role: 'system', content: bouwProfielContext(params.profiel) },
    ...params.historie.map((h) => ({
      role: (h.afzender === 'gebruiker' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.inhoud,
    })),
  ]

  if (params.nieuwBericht !== undefined) {
    messages.push({ role: 'user', content: params.nieuwBericht })
  } else {
    messages.push({
      role: 'user',
      content: '(start het gesprek — de organisatie heeft zojuist het onboarding-scherm geopend, er is nog niets gezegd)',
    })
  }

  const ruw = await chatJSON<unknown>(messages, {
    model: MODEL_HAIKU,
    maxTokens: 1000,
    meta: { organisatieId: params.organisatieId, actie: 'onboarding-chat' },
  })

  const resultaat = modelOutputSchema.safeParse(ruw)
  if (!resultaat.success) {
    throw new Error(`Onboarding-model gaf een onverwacht formaat terug: ${resultaat.error.message}`)
  }
  return resultaat.data
}

const CONSOLIDATIE_PROMPT = `Je krijgt het volledige transcript van een intake-gesprek (Noor, ImpactOS)
plus het profiel zoals dat tot nu toe per beurt is opgeslagen. Sommige beurten hebben een
genoemd feit gemist. Lees het HELE gesprek nog eens door en geef het VOLLEDIGE profiel terug
zoals het uit het gesprek blijkt — ook velden die al bekend waren, en zeker velden die de
gebruiker wel noemde maar die nog ontbreken. Alleen velden die echt nergens genoemd zijn laat
je weg. Antwoord ALTIJD met platte JSON, geen markdown, exact dit formaat:
{"rechtsvorm": "...", "werkveldCategorieen": [...], "gemeenten": [...], "teamgrootte": 0,
"vrijwilligersAantal": 0, "grootsteKnelpunt": "...", "toneOfVoice": "..."}
Laat een sleutel volledig weg als hij nergens uit het gesprek blijkt (gebruik geen null/0 als gok).`

/**
 * Consolidatiepas ná afronding: leest het volledige transcript nog één keer terug en vult
 * profielvelden aan die een eerdere beurt gemist heeft. Roep dit alleen aan wanneer
 * `afgerond === true` — vult ontbrekende gaten bij, overschrijft nooit stilzwijgend eerder
 * bevestigde informatie met een gok.
 */
export async function consolideerProfiel(params: {
  organisatieId: string
  historie: OnboardingHistorieItem[]
  huidigProfiel: OnboardingProfielSnapshot
}): Promise<OnboardingProfielUpdate> {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: CONSOLIDATIE_PROMPT },
    { role: 'system', content: bouwProfielContext(params.huidigProfiel) },
    ...params.historie.map((h) => ({
      role: (h.afzender === 'gebruiker' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: h.inhoud,
    })),
    { role: 'user', content: '(geef nu het volledige, geconsolideerde profiel terug)' },
  ]

  const ruw = await chatJSON<unknown>(messages, {
    model: MODEL_HAIKU,
    maxTokens: 500,
    meta: { organisatieId: params.organisatieId, actie: 'onboarding-consolidatie' },
  })

  const resultaat = profielSchema.safeParse(ruw)
  return resultaat.success ? resultaat.data : {}
}

export function alsAiRolIds(rollen: readonly string[]): AiRolId[] {
  return rollen.filter((r): r is AiRolId => (ONBOARDING_AANBEVEELBARE_ROLLEN as readonly string[]).includes(r))
}
