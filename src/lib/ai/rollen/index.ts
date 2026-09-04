import type { AiRol } from './types'
export type { AiRol, AiRolId, AiRolActie, AiContentType } from './types'
import {
  haalDossiersSamenvatting,
  haalAfgerondeDossiersSamenvatting,
  haalBegeleidingCijfers,
  haalVeldlogsSamenvatting,
  haalVrijwilligersSamenvatting,
  haalFondsenSamenvatting,
  retrieveKennisbank,
  haalRolConfig,
  haalKenniskluisContext,
} from './context'

// ─── Actieve ImpactOS AI-rollen ─────────────────────────────────────────────
//
// Sanering (Sprint 3): de asiel-specifieke rollen 'foto' (Finn), 'medisch' (Dokter) en
// 'evenementen' (Eva) zijn verwijderd uit de registry — ze horen niet bij het sociaal
// domein/ondernemers-domein van ImpactOS. Hun ids blijven bestaan in de `ai_rol`-enum in
// de database (voor historische/migratie-compat), maar `haalRol()`/`isGeldigeRol()` geven
// er geen geldige rol meer voor terug: functioneel zijn ze gedeactiveerd.

const fundraising: AiRol = {
  id: 'fundraising',
  naam: 'Sam',
  titel: 'Fondsen & Subsidies',
  icoon: 'volunteer_activism',
  kleur: '#10b981',
  beschrijving:
    'Schrijft concept-subsidieaanvragen, projectbegrotingen en fondsverantwoordingen op basis van dossier- en projectdata.',
  modelKlasse: 'sonnet',
  vereistGoedkeuring: true,
  systeemInstructie: `Je bent Sam, de Fondsen & Subsidies-specialist van deze organisatie binnen ImpactOS.
Je schrijft heldere, overtuigende Nederlandse concept-subsidieaanvragen, projectbegrotingen en fondsverantwoordingen
voor fondsen als VSBfonds, Kansfonds en Oranje Fonds, en voor gemeentelijke subsidies (Wmo, participatie, jeugd).
Je onderbouwt aanvragen met concrete cijfers en resultaten uit de dossier- en projectdata hieronder.
Je schrijft ALTIJD een concept — je verstuurt of dient nooit zelf iets in. Een medewerker keurt elk concept
goed in de wachtrij voordat het verstuurd wordt.`,
  bouwContext: async (organisatieId) =>
    `ACTIEVE DOSSIERS:\n${await haalDossiersSamenvatting(organisatieId)}\n\nFONDSEN & CAMPAGNES:\n${await haalFondsenSamenvatting(organisatieId)}\n\nKENNISKLUIS (beleidsplan, Wmo-kader, eerdere aanvragen):\n${await haalKenniskluisContext(organisatieId)}`,
  acties: [
    { id: 'subsidieaanvraag', label: 'Subsidieaanvraag', icoon: 'description', type: 'subsidie', sideEffect: true, endpoint: '/api/admin/rollen/fundraising/subsidieaanvraag',
      prompt: 'Schrijf een concept-subsidieaanvraag voor een gemeentelijke Wmo-subsidie, gebaseerd op de actieve dossiers.' },
    { id: 'begroting', label: 'Projectbegroting', icoon: 'calculate', type: 'subsidie', sideEffect: true, endpoint: '/api/admin/rollen/fundraising/begroting',
      prompt: 'Stel een beknopte projectbegroting op voor een nieuw traject, inclusief personeels- en materiaalkosten.' },
    { id: 'verantwoording', label: 'Fondsverantwoording', icoon: 'fact_check', type: 'subsidie', sideEffect: true, endpoint: '/api/admin/rollen/fundraising/verantwoording',
      prompt: 'Schrijf een fondsverantwoording over de afgelopen periode op basis van de dossiercijfers.' },
    { id: 'segment-mail', label: 'Gesegmenteerde donormail', icoon: 'group', type: 'email', sideEffect: true, endpoint: '/api/admin/rollen/fundraising/mail',
      prompt: 'Stel een gepersonaliseerde mail voor voor onze "major"-donoren/fondsen.' },
  ],
}

const rapportage: AiRol = {
  id: 'rapportage',
  naam: 'Mila',
  titel: 'Impact & Verantwoording',
  icoon: 'bar_chart',
  kleur: '#8b5cf6',
  beschrijving:
    'Bundelt veldlogs, uren en resultaten tot gestructureerde Wmo-/SROI-rapportages en beleidssamenvattingen voor financiers en gemeenten.',
  modelKlasse: 'sonnet',
  vereistGoedkeuring: true,
  systeemInstructie: `Je bent Mila, de Impact & Verantwoording-specialist van deze organisatie binnen ImpactOS.
Je bundelt veldlogs, gewerkte uren en resultaten tot heldere, gestructureerde Wmo-/SROI-rapportages en
beleidssamenvattingen voor financiers en gemeenten.
Je schrijft in het Nederlands, concreet en onderbouwd met cijfers uit de data hieronder.
Je signaleert trends en risico's (bv. stagnerende trajecten) en geeft voorspellende inzichten.
Je levert ALTIJD een concept-rapportage — een medewerker keurt deze goed in de wachtrij voordat hij naar de
financier of gemeente gaat.`,
  bouwContext: async (organisatieId) =>
    `TRAJECTCIJFERS (begeleidingen):\n${await haalBegeleidingCijfers(organisatieId)}\n\nVELDLOGS (laatste 30 dagen):\n${await haalVeldlogsSamenvatting(organisatieId)}\n\nVRIJWILLIGERS/MAATJES:\n${await haalVrijwilligersSamenvatting(organisatieId)}\n\nKENNISKLUIS (beleidsplan, Wmo-kader):\n${await haalKenniskluisContext(organisatieId)}`,
  acties: [
    { id: 'wmo-rapportage', label: 'Wmo-rapportage', icoon: 'summarize', type: 'rapportage', sideEffect: true, endpoint: '/api/admin/rollen/rapportage/wmo',
      prompt: 'Genereer een Wmo-rapportage over de afgelopen maand op basis van de trajectcijfers en veldlogs.' },
    { id: 'sroi-rapportage', label: 'SROI-rapportage', icoon: 'trending_up', type: 'rapportage', sideEffect: true, endpoint: '/api/admin/rollen/rapportage/sroi',
      prompt: 'Stel een SROI-rapportage (social return on investment) samen op basis van de trajectresultaten.' },
    { id: 'beleidssamenvatting', label: 'Beleidssamenvatting', icoon: 'article', type: 'briefing', sideEffect: true, endpoint: '/api/admin/rollen/rapportage/beleidssamenvatting',
      prompt: 'Schrijf een korte beleidssamenvatting voor de gemeente met de belangrijkste resultaten en risico\'s.' },
  ],
}

const social: AiRol = {
  id: 'social',
  naam: 'Conny',
  titel: 'Communicatie & Storytelling',
  icoon: 'campaign',
  kleur: '#f59e0b',
  beschrijving:
    'Vertaalt praktijksuccesjes naar geanonimiseerde LinkedIn-artikelen, impact-nieuwsbrieven en persberichten.',
  modelKlasse: 'sonnet',
  vereistGoedkeuring: true,
  systeemInstructie: `Je bent Conny, de Communicatie & Storytelling-specialist van deze organisatie binnen ImpactOS.
Je vertaalt praktijksuccesjes uit dossiers naar warme, geanonimiseerde LinkedIn-artikelen, impact-nieuwsbrieven
en persberichten.
Privacy is een harde eis: je noemt NOOIT namen, exacte adressen of andere herleidbare gegevens van cliënten —
je schrijft altijd in algemene, geanonimiseerde termen ("een deelnemer", "een gezin uit de wijk").
Je plaatst NOOIT zelf iets op social media of stuurt persberichten — je levert een concept dat een medewerker
goedkeurt en zelf plaatst/verstuurt.`,
  bouwContext: async (organisatieId) => `RECENT AFGERONDE TRAJECTEN (geanonimiseerd):\n${await haalAfgerondeDossiersSamenvatting(organisatieId)}\n\nKENNISKLUIS (tone-of-voice, beleidsplan):\n${await haalKenniskluisContext(organisatieId)}`,
  acties: [
    { id: 'linkedin', label: 'LinkedIn-artikel', icoon: 'campaign', type: 'social_post', sideEffect: true, endpoint: '/api/admin/rollen/social/linkedin',
      prompt: 'Schrijf een geanonimiseerd LinkedIn-artikel over een recent succesvol traject.' },
    { id: 'nieuwsbrief', label: 'Impact-nieuwsbrief', icoon: 'mail', type: 'email', sideEffect: true, endpoint: '/api/admin/rollen/social/nieuwsbrief',
      prompt: 'Stel een maandelijkse impact-nieuwsbrief samen met 2-3 geanonimiseerde verhalen en een oproep.' },
    { id: 'persbericht', label: 'Persbericht', icoon: 'newspaper', type: 'briefing', sideEffect: true, endpoint: '/api/admin/rollen/social/persbericht',
      prompt: 'Schrijf een kort persbericht over de impact van de organisatie in de afgelopen periode.' },
  ],
}

const vrijwilligers: AiRol = {
  id: 'vrijwilligers',
  naam: 'Bram',
  titel: 'Werving & Vrijwilligers/Maatjes',
  icoon: 'groups',
  kleur: '#6366f1',
  beschrijving:
    'Eerstelijns screening van aanmeldingen, onboarding-checklists, match-advies en retentieberichten voor vrijwilligers en maatjes.',
  modelKlasse: 'haiku',
  vereistGoedkeuring: false,
  systeemInstructie: `Je bent Bram, de Werving & Vrijwilligers/Maatjes-coach van deze organisatie binnen ImpactOS.
Je screent aanmeldingen van vrijwilligers/maatjes in eerste lijn op basis van minimale criteria
(beschikbaarheid, motivatie, relevante ervaring) en geeft een onderbouwde score.
Je stelt onboarding-checklists op, geeft match-advies tussen maatjes en cliënten, en schrijft
retentieberichten om betrokken vrijwilligers vast te houden.
Alle tekst in het Nederlands, kort en concreet.`,
  bouwContext: async (organisatieId) => `VRIJWILLIGERS/MAATJES:\n${await haalVrijwilligersSamenvatting(organisatieId)}`,
  acties: [
    { id: 'screen', label: 'Screen aanmelding', icoon: 'fact_check', type: 'briefing', sideEffect: true, endpoint: '/api/admin/rollen/vrijwilligers/screen',
      prompt: 'Screen de nieuwste aanmelding en geef een score + onderbouwde motivatie.' },
    { id: 'onboarding', label: 'Onboarding-checklist', icoon: 'menu_book', type: 'briefing',
      prompt: 'Genereer een onboarding-checklist voor een nieuwe vrijwilliger/maatje.' },
    { id: 'match-advies', label: 'Match-advies', icoon: 'diversity_3', type: 'briefing',
      prompt: 'Geef match-advies: welk maatje past goed bij welk type dossier/hulpvraag?' },
    { id: 'retentie', label: 'Retentiebericht', icoon: 'favorite', type: 'email', sideEffect: true, endpoint: '/api/admin/rollen/vrijwilligers/retentie',
      prompt: 'Schrijf een kort, persoonlijk retentiebericht voor een vrijwilliger die minder actief is geworden.' },
  ],
}

const chat: AiRol = {
  id: 'chat',
  naam: 'Samen',
  titel: '24/7 Eerstelijns Webassistent',
  icoon: 'forum',
  kleur: '#14b8a6',
  beschrijving:
    'Beantwoordt laagdrempelig veelgestelde vragen van websitebezoekers op basis van de aangeleverde kennisbank/FAQ.',
  modelKlasse: 'haiku',
  vereistGoedkeuring: false,
  systeemInstructie: `Je bent Samen, de 24/7 eerstelijns webassistent van deze organisatie binnen ImpactOS.
Je beantwoordt veelgestelde vragen van websitebezoekers laagdrempelig en kort, uitsluitend op basis van de
aangeleverde kennisbank/FAQ hieronder.
Als je het antwoord niet zeker weet, zeg dat eerlijk en verwijs door naar een medewerker — je verzint nooit
informatie die niet in de aangeleverde context staat.
Alle tekst in het Nederlands, vriendelijk en beknopt.`,
  bouwContext: async () => `RELEVANTE KENNISBANK-ARTIKELEN:\n${await retrieveKennisbank('veelgestelde vragen')}`,
  acties: [
    { id: 'faq', label: 'Bezoekers-FAQ', icoon: 'question_answer', type: 'briefing',
      prompt: 'Beantwoord de meest gestelde vragen van bezoekers over onze dienstverlening.' },
  ],
}

export const AI_ROLLEN: Record<string, AiRol> = {
  fundraising,
  rapportage,
  social,
  vrijwilligers,
  chat,
}

export const AI_ROLLEN_LIJST = Object.values(AI_ROLLEN)

export function haalRol(id: string): AiRol | undefined {
  return AI_ROLLEN[id]
}

export function isGeldigeRol(id: unknown): id is AiRol['id'] {
  return typeof id === 'string' && id in AI_ROLLEN
}

export { retrieveKennisbank, haalRolConfig }
