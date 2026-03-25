import { chatCompletion } from './client'
import type { AdopterProfiel } from './matching'

export const INTAKE_STAPPEN = [
  {
    stap: 1,
    vraag: 'In wat voor soort woning ga jij en je nieuwe vriend wonen?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'appartement', label: 'Appartement', emoji: '🏢', beschrijving: 'Knusse ruimtes, met of zonder balkon' },
      { waarde: 'huis_zonder_tuin', label: 'Huis zonder tuin', emoji: '🏠', beschrijving: 'Ruime woning, maar geen buitenruimte' },
      { waarde: 'huis_met_tuin', label: 'Huis met tuin', emoji: '🌿', beschrijving: 'Genoeg ruimte om veilig buiten te spelen' },
      { waarde: 'boerderij', label: 'Boerderij of landelijk', emoji: '🌾', beschrijving: 'Veel land en vrijheid voor actieve dieren' },
    ],
    veld: 'woningType',
  },
  {
    stap: 2,
    vraag: 'Wie woont er nog meer in jouw huishouden?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'alleen', label: 'Ik alleen', emoji: '👤', beschrijving: 'Rustig en gestructureerd' },
      { waarde: 'stel', label: 'Ik en mijn partner', emoji: '👫', beschrijving: 'Twee aanspreekpunten voor het dier' },
      { waarde: 'gezin_ouder_kinderen', label: 'Gezin met oudere kinderen', emoji: '👨‍👩‍👧', beschrijving: 'Kinderen van 8 jaar of ouder' },
      { waarde: 'gezin_jonge_kinderen', label: 'Gezin met jonge kinderen', emoji: '👶', beschrijving: 'Kinderen onder de 8 jaar' },
    ],
    veld: 'gezin',
  },
  {
    stap: 3,
    vraag: 'Hoe actief ben jij op een gemiddelde dag?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'laag', label: 'Rustig aan', emoji: '🛋️', beschrijving: 'Wandelingetje hier en daar' },
      { waarde: 'normaal', label: 'Normaal actief', emoji: '🚶', beschrijving: 'Dagelijkse wandelingen, af en toe fietsen' },
      { waarde: 'hoog', label: 'Actief', emoji: '🏃', beschrijving: 'Sporten, lange wandelingen, fietsen' },
      { waarde: 'zeer_hoog', label: 'Heel actief', emoji: '⚡', beschrijving: 'Hardlopen, hiking, intensief sporten' },
    ],
    veld: 'activiteitNiveau',
  },
  {
    stap: 4,
    vraag: 'Hoeveel tijd ben je gemiddeld thuis op een werkdag?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'altijd', label: 'Ik werk thuis', emoji: '💻', beschrijving: 'Bijna altijd thuis' },
      { waarde: 'deels', label: 'Deels thuis', emoji: '🔄', beschrijving: 'Hybride, 2-3 dagen kantoor' },
      { waarde: 'deeltijd', label: 'Deeltijd buitenshuis', emoji: '⏰', beschrijving: 'Een paar uur per dag weg' },
      { waarde: 'fulltime', label: 'Fulltime buitenshuis', emoji: '🏢', beschrijving: '8+ uur per dag weg van huis' },
    ],
    veld: 'werkTijd',
  },
  {
    stap: 5,
    vraag: 'Heb je al andere dieren thuis?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'geen', label: 'Geen andere dieren', emoji: '🏠', beschrijving: 'Eerste dier in huis' },
      { waarde: 'hond', label: 'Ja, een hond', emoji: '🐶', beschrijving: 'Een bestaande hond thuis' },
      { waarde: 'kat', label: 'Ja, een kat', emoji: '🐱', beschrijving: 'Een bestaande kat thuis' },
      { waarde: 'meerdere', label: 'Meerdere dieren', emoji: '🐾', beschrijving: 'Een dierentuin bijna!' },
    ],
    veld: 'andereDieren',
  },
  {
    stap: 6,
    vraag: 'Hoeveel ervaring heb je met het houden van dieren?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'geen', label: 'Geen ervaring', emoji: '🌱', beschrijving: 'Dit wordt mijn eerste huisdier' },
      { waarde: 'beetje', label: 'Beetje ervaring', emoji: '📚', beschrijving: 'Had vroeger wel eens een dier' },
      { waarde: 'gemiddeld', label: 'Gemiddeld', emoji: '⭐', beschrijving: 'Heb jaren een dier gehad' },
      { waarde: 'veel', label: 'Veel ervaring', emoji: '🏆', beschrijving: 'Meerdere dieren, ook uitdagende' },
    ],
    veld: 'ervaring',
  },
  {
    stap: 7,
    vraag: 'Wat is jouw budget voor dierenartszorg?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'beperkt', label: 'Beperkt', emoji: '💙', beschrijving: 'Basisvaccinaties en jaarlijkse check-up' },
      { waarde: 'normaal', label: 'Normaal', emoji: '💚', beschrijving: 'Incidentele behandelingen zijn geen probleem' },
      { waarde: 'ruim', label: 'Ruim', emoji: '💛', beschrijving: 'Ook chronische zorg of operaties zijn haalbaar' },
    ],
    veld: 'budget',
  },
  {
    stap: 8,
    vraag: 'Heb jij of iemand in jouw huishouden een dierenallergie?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'geen', label: 'Nee, geen allergie', emoji: '✅', beschrijving: 'Iedereen kan met alle dieren om' },
      { waarde: 'hond', label: 'Ja, voor honden', emoji: '🐶', beschrijving: 'Allergisch voor hondenhaar of speeksel' },
      { waarde: 'kat', label: 'Ja, voor katten', emoji: '🐱', beschrijving: 'Allergisch voor kattenhaar of speeksel' },
      { waarde: 'beide', label: 'Ja, voor honden én katten', emoji: '⚠️', beschrijving: 'Alleen kleine dieren zijn een optie' },
    ],
    veld: 'allergie',
  },
  {
    stap: 9,
    vraag: 'Welk type dier zoek je?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'hond', label: 'Hond', emoji: '🐶', beschrijving: 'Trouwe begeleider' },
      { waarde: 'kat', label: 'Kat', emoji: '🐱', beschrijving: 'Zelfstandig en lief' },
      { waarde: 'konijn', label: 'Konijn of knaagdier', emoji: '🐰', beschrijving: 'Kleiner en rustig' },
      { waarde: 'alles', label: 'Maakt mij niet uit', emoji: '🐾', beschrijving: 'Verras me!' },
    ],
    veld: 'diersoort',
  },
  {
    stap: 10,
    vraag: 'Heb je een voorkeur voor de leeftijd van het dier?',
    type: 'keuze' as const,
    opties: [
      { waarde: 'jong', label: 'Pup of kitten', emoji: '🐣', beschrijving: 'Opgroeien samen — maar meer werk' },
      { waarde: 'jongvolwassen', label: 'Jong volwassen', emoji: '🌟', beschrijving: '1-3 jaar, al wat rustiger' },
      { waarde: 'volwassen', label: 'Volwassen', emoji: '🐾', beschrijving: 'Rustig en voorspelbaar karakter' },
      { waarde: 'senior', label: 'Senior', emoji: '🐕', beschrijving: 'Waardig ouder dier verdient een thuis' },
      { waarde: 'maakt_niet_uit', label: 'Maakt mij niet uit', emoji: '💛', beschrijving: 'De klik bepaalt alles' },
    ],
    veld: 'leeftijd',
  },
]

// =================== DETERMINISTISCHE PARSER ===================
// Geen AI nodig voor gestructureerde antwoorden — sneller, goedkoper, betrouwbaarder.

const WERKTIJD_MAP: Record<string, number> = {
  altijd: 0,
  deeltijd: 4,
  deels: 5,
  fulltime: 9,
}

const ANDERE_DIEREN_MAP: Record<string, string[]> = {
  geen: [],
  hond: ['hond'],
  kat: ['kat'],
  meerdere: ['hond', 'kat'],
}

const ALLERGIE_MAP: Record<string, string[]> = {
  geen: [],
  hond: ['hond'],
  kat: ['kat'],
  beide: ['hond', 'kat'],
}

function mapAntwoordenNaarProfiel(antwoorden: Record<string, string>): AdopterProfiel {
  const woningType = antwoorden.woningType ?? 'huis_zonder_tuin'
  const heeftTuin = woningType === 'huis_met_tuin' || woningType === 'boerderij'
  const tuinOppervlakte = woningType === 'boerderij' ? 'groot' : woningType === 'huis_met_tuin' ? 'normaal' : null

  const gezin = antwoorden.gezin ?? 'alleen'
  const aantalKinderen =
    gezin === 'gezin_jonge_kinderen' || gezin === 'gezin_ouder_kinderen' ? 2 : 0
  const jongsteKindLeeftijd =
    gezin === 'gezin_jonge_kinderen' ? 4 : gezin === 'gezin_ouder_kinderen' ? 10 : null
  const aantalVolwassenen = gezin === 'stel' ? 2 : 1

  const werkUrenPerDag = WERKTIJD_MAP[antwoorden.werkTijd ?? 'deels'] ?? 8
  const andereDieren = ANDERE_DIEREN_MAP[antwoorden.andereDieren ?? 'geen'] ?? []
  const allergieën = ALLERGIE_MAP[antwoorden.allergie ?? 'geen'] ?? []
  const diersoortVoorkeur =
    antwoorden.diersoort === 'alles' || !antwoorden.diersoort ? [] : [antwoorden.diersoort]

  return {
    woningType,
    heeftTuin,
    tuinOppervlakte,
    activiteitNiveau: antwoorden.activiteitNiveau ?? 'normaal',
    aantalVolwassenen,
    aantalKinderen,
    jongsteKindLeeftijd,
    andereDieren,
    werkUrenPerDag,
    ervaringNiveau: antwoorden.ervaring ?? 'geen',
    budgetDierenarts: antwoorden.budget ?? 'normaal',
    allergieën,
    diersoortVoorkeur,
    leeftijdVoorkeur: antwoorden.leeftijd ?? 'maakt_niet_uit',
  }
}

// =================== AANBEVELING VIA AI ===================

async function genereerAanbeveling(profiel: AdopterProfiel): Promise<string> {
  const prompt = `Je bent Dr. Poot, een vriendelijke dierenwelzijn-expert voor PootGelukkig.

Schrijf een warme, persoonlijke aanbeveling van 1-2 zinnen in het Nederlands over het ideale type dier voor deze persoon.
Wees specifiek: benoem het diertype en de reden.

Profiel:
- Woning: ${profiel.woningType}${profiel.heeftTuin ? ' met tuin' : ''}
- Huishouden: ${profiel.aantalKinderen > 0 ? `kinderen aanwezig (jongste ~${profiel.jongsteKindLeeftijd} jaar)` : 'geen kinderen'}
- Activiteit: ${profiel.activiteitNiveau}
- Thuis: ${24 - profiel.werkUrenPerDag} uur/dag
- Ervaring: ${profiel.ervaringNiveau}
- Budget: ${profiel.budgetDierenarts}
- Voorkeur: ${profiel.diersoortVoorkeur.join(', ') || 'alles'}

Geef alleen de aanbevelingstekst, geen JSON.`

  try {
    return await chatCompletion([{ role: 'user', content: prompt }], { maxTokens: 150 })
  } catch {
    const soort = profiel.diersoortVoorkeur[0] ?? 'dier'
    return `Op basis van jouw profiel zoeken we de beste ${soort === 'alles' ? 'match' : soort} voor je.`
  }
}

// =================== EXPORT ===================

export async function verwerkIntakeAntwoorden(
  antwoorden: Record<string, string>
): Promise<{ profiel: AdopterProfiel; aanbeveling: string }> {
  const profiel = mapAntwoordenNaarProfiel(antwoorden)
  const aanbeveling = await genereerAanbeveling(profiel)
  return { profiel, aanbeveling }
}
