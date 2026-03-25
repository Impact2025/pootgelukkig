import { createHash } from 'crypto'
import { chatCompletion } from './client'

export type AdopterProfiel = {
  woningType: string | null
  heeftTuin: boolean
  tuinOppervlakte: string | null       // 'klein' | 'normaal' | 'groot' | null
  activiteitNiveau: string | null
  aantalVolwassenen: number
  aantalKinderen: number
  jongsteKindLeeftijd: number | null   // in jaren
  andereDieren: string[]
  werkUrenPerDag: number
  ervaringNiveau: string | null
  budgetDierenarts: string | null      // 'beperkt' | 'normaal' | 'ruim'
  allergieën: string[]
  diersoortVoorkeur: string[]
  leeftijdVoorkeur: string | null
}

export type DierProfiel = {
  id: number
  naam: string
  soort: string
  ras: string | null
  leeftijdJaren: number | null
  gewichtKg: number | null
  gedragsProfiel: {
    energieNiveau: string
    kindvriendelijk: boolean
    katVriendelijk: boolean
    hondenVriendelijk: boolean
    alleenThuis: string
    trainbaarheid: string
    speelsheid: string
    blaffen: string
    tags: string[]
  } | null
  medischPaspoort: {
    gevaccineerd: boolean
    gecastreerd: boolean
    allergieën: string[]
  } | null
}

export type MatchResultaat = {
  dierId: number
  score: number
  analyseTekst: string
  woningScore: number
  energieScore: number
  gezinScore: number
  ervaringScore: number
  alleenThuisScore: number
  budgetScore: number
}

// =================== PROFIEL HASH (voor caching) ===================

export function hashProfiel(profiel: AdopterProfiel): string {
  const parts = [
    profiel.woningType ?? '',
    String(profiel.heeftTuin),
    profiel.tuinOppervlakte ?? '',
    profiel.activiteitNiveau ?? '',
    String(profiel.aantalVolwassenen),
    String(profiel.aantalKinderen),
    String(profiel.jongsteKindLeeftijd ?? ''),
    [...(profiel.andereDieren ?? [])].sort().join(','),
    String(profiel.werkUrenPerDag),
    profiel.ervaringNiveau ?? '',
    profiel.budgetDierenarts ?? '',
    [...(profiel.allergieën ?? [])].sort().join(','),
    [...(profiel.diersoortVoorkeur ?? [])].sort().join(','),
    profiel.leeftijdVoorkeur ?? '',
  ]
  return createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24)
}

// =================== HARDE FILTERS ===================

function hardFilter(adopter: AdopterProfiel, dier: DierProfiel): string | null {
  // Allergie
  if (adopter.allergieën.some((a) => a.toLowerCase() === dier.soort.toLowerCase())) {
    return `Je hebt een allergie voor ${dier.soort}s — een veilige match is helaas niet mogelijk.`
  }

  // Diersoort voorkeur
  if (
    adopter.diersoortVoorkeur.length > 0 &&
    !adopter.diersoortVoorkeur.includes(dier.soort) &&
    !adopter.diersoortVoorkeur.includes('alles')
  ) {
    return `${dier.naam} is een ${dier.soort}, maar jij zoekt specifiek een ander type dier.`
  }

  // Bestaande kat + dier niet katvriendelijk
  if (
    adopter.andereDieren.includes('kat') &&
    dier.gedragsProfiel?.katVriendelijk === false
  ) {
    return `${dier.naam} kan helaas niet goed overweg met katten — niet veilig met jouw huiskat.`
  }

  // Bestaande hond + dier niet hondvriendelijk
  if (
    adopter.andereDieren.includes('hond') &&
    dier.gedragsProfiel?.hondenVriendelijk === false
  ) {
    return `${dier.naam} kan helaas niet goed overweg met honden — niet veilig met jouw hond thuis.`
  }

  return null
}

// =================== AI MATCHING ===================

const MATCHING_SYSTEEM_PROMPT = `Je bent Dr. Poot — de meest nauwkeurige dierenwelzijn-matchmaker van Nederland. Je combineert kennis van diergedrag, gezinspsychologie en adoptiepraktijk om eerlijke, genuanceerde scores te geven die leiden tot duurzame, gelukkige adopties.

Je werkt met bewijsgebaseerde criteria. Elke score moet kloppen met de realiteit: een hond met hoge energie in een appartement zonder tuin zonder actieve eigenaar is geen goede match, ook al is de eigenaar lief. Wees eerlijk maar warm.`

function bouwMatchingPrompt(adopter: AdopterProfiel, dier: DierProfiel): string {
  const thuisUren = 24 - adopter.werkUrenPerDag
  const kinderContext =
    adopter.aantalKinderen > 0
      ? `${adopter.aantalKinderen} kind(eren), jongste: ${adopter.jongsteKindLeeftijd ?? 'onbekend'} jaar`
      : 'geen kinderen'

  const woningContext = [
    adopter.woningType ?? 'onbekend',
    adopter.heeftTuin ? `tuin (${adopter.tuinOppervlakte ?? 'normaal'})` : 'geen tuin',
  ].join(', ')

  const dierGedrag = dier.gedragsProfiel
  const medisch = dier.medischPaspoort

  return `Analyseer de compatibiliteit en geef scores op basis van onderstaand SCORINGSRUBRIC.

ADOPTANT:
- Woning: ${woningContext}
- Bewoners: ${adopter.aantalVolwassenen} volwassene(n), ${kinderContext}
- Activiteit: ${adopter.activiteitNiveau ?? 'onbekend'}
- Thuis: ~${thuisUren} uur/dag (werkt ${adopter.werkUrenPerDag} uur/dag)
- Andere dieren: ${adopter.andereDieren.join(', ') || 'geen'}
- Ervaring: ${adopter.ervaringNiveau ?? 'onbekend'}
- Budget dierenarts: ${adopter.budgetDierenarts ?? 'normaal'}
- Allergieën: ${adopter.allergieën.join(', ') || 'geen'}
- Leeftijdvoorkeur dier: ${adopter.leeftijdVoorkeur ?? 'maakt niet uit'}

DIER: ${dier.naam} (${dier.soort}${dier.ras ? `, ${dier.ras}` : ''}, ${dier.leeftijdJaren ?? '?'} jaar${dier.gewichtKg ? `, ${dier.gewichtKg}kg` : ''})
- Energie: ${dierGedrag?.energieNiveau ?? 'onbekend'}
- Alleen thuis: ${dierGedrag?.alleenThuis ?? 'onbekend'}
- Kindvriendelijk: ${dierGedrag?.kindvriendelijk ?? 'onbekend'}
- Met katten: ${dierGedrag?.katVriendelijk ?? 'onbekend'}
- Met honden: ${dierGedrag?.hondenVriendelijk ?? 'onbekend'}
- Trainbaarheid: ${dierGedrag?.trainbaarheid ?? 'onbekend'}
- Speelsheid: ${dierGedrag?.speelsheid ?? 'onbekend'}
- Blaffen: ${dierGedrag?.blaffen ?? 'n.v.t.'}
- Kenmerken: ${dierGedrag?.tags.join(', ') || 'geen'}
- Medisch: gevaccineerd=${medisch?.gevaccineerd ?? '?'}, gecastreerd=${medisch?.gecastreerd ?? '?'}, bekende aandoeningen=${medisch?.allergieën.join(', ') || 'geen'}

SCORINGSRUBRIC (gebruik dit strikt):

woning_score:
- Appartement + hond >20kg + geen tuin → 15-35
- Appartement + hond + energie hoog/zeer_hoog + geen tuin → 25-45
- Appartement + hond + energie laag/normaal + geen tuin → 50-70
- Appartement + kat/konijn → 70-90
- Huis met tuin + hond → 75-95
- Boerderij + actief dier → 90-100

energie_score:
- Activiteitniveaus (adoptant ↔ dier): exact gelijk → 90-100
- 1 niveau verschil → 65-82
- 2 niveaus verschil → 35-60
- 3 niveaus verschil → 10-35
(niveaus: laag=1, normaal=2, hoog=3, zeer_hoog=4)

gezin_score:
- Kinderen <6 jaar + niet kindvriendelijk → 0-15 (veiligheidsrisico!)
- Kinderen <6 jaar + kindvriendelijk → 82-100
- Kinderen 6-12 jaar + niet kindvriendelijk → 20-45
- Geen kinderen → 75-90 (neutraal)

alleen_thuis_score:
- Werkuren ≥8 + alleenThuis=slecht → 10-30
- Werkuren ≥8 + alleenThuis=matig → 40-60
- Werkuren ≥8 + alleenThuis=goed → 65-80
- Werkuren 4-7 + alleenThuis=matig/goed → 70-85
- Werkuren 0-3 (thuiswerker) + elk → 85-100

ervaring_score:
- Geen/beetje ervaring + trainbaarheid=laag + energie=hoog/zeer_hoog → 20-45
- Geen/beetje ervaring + trainbaarheid=normaal/hoog + energie=laag/normaal → 70-88
- Gemiddelde/veel ervaring + elk dier → 75-100

budget_score:
- Beperkt budget + dier >10 jaar (hogere medische kosten verwacht) → 45-65
- Beperkt budget + dier met bekende aandoeningen → 35-60
- Beperkt budget + jong gezond dier → 75-90
- Normaal/ruim budget → 82-100

OVERALL SCORE = gewogen gemiddelde:
energie_score×0.25 + gezin_score×0.22 + alleen_thuis_score×0.20 + woning_score×0.15 + ervaring_score×0.13 + budget_score×0.05
(Afronden op geheel getal)

ANALYSE: 2-3 zinnen in warm, persoonlijk Nederlands. Noem ${dier.naam} bij naam. Benoem de sterkste reden voor de score — zowel positief als eventuele uitdagingen.

Returneer UITSLUITEND dit JSON object, geen markdown, geen uitleg:
{"score":<0-100>,"analyse":"<tekst>","woning_score":<0-100>,"energie_score":<0-100>,"gezin_score":<0-100>,"ervaring_score":<0-100>,"alleen_thuis_score":<0-100>,"budget_score":<0-100>}`
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)))
}

function parseerJsonAntwoord(tekst: string): ReturnType<typeof JSON.parse> {
  const start = tekst.indexOf('{')
  const end = tekst.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Geen JSON object gevonden in AI antwoord')
  return JSON.parse(tekst.slice(start, end + 1))
}

export async function berekenMatch(
  adopter: AdopterProfiel,
  dier: DierProfiel,
  historischeContext?: string
): Promise<MatchResultaat> {
  // Harde filters
  const filterReden = hardFilter(adopter, dier)
  if (filterReden) {
    return nulScore(dier.id, filterReden)
  }

  let prompt = bouwMatchingPrompt(adopter, dier)

  // Voeg historische succesdata toe als beschikbaar
  if (historischeContext) {
    prompt += `\n\nHISTORISCHE DATA (gebruik als zachte indicator, niet als harde regel):\n${historischeContext}`
  }

  try {
    const tekst = await chatCompletion(
      [
        { role: 'system', content: MATCHING_SYSTEEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 400 }
    )

    const r = parseerJsonAntwoord(tekst) as {
      score: number
      analyse: string
      woning_score: number
      energie_score: number
      gezin_score: number
      ervaring_score: number
      alleen_thuis_score: number
      budget_score: number
    }

    return {
      dierId: dier.id,
      score: clamp(r.score),
      analyseTekst: r.analyse ?? `${dier.naam} heeft een compatibiliteitsscore van ${clamp(r.score)}%.`,
      woningScore: clamp(r.woning_score),
      energieScore: clamp(r.energie_score),
      gezinScore: clamp(r.gezin_score),
      ervaringScore: clamp(r.ervaring_score),
      alleenThuisScore: clamp(r.alleen_thuis_score),
      budgetScore: clamp(r.budget_score),
    }
  } catch (error) {
    console.error('AI matching fout:', error)
    return berekenFallbackScore(adopter, dier)
  }
}

// =================== FALLBACK ===================

const ENERGIE_MAP: Record<string, number> = { laag: 1, normaal: 2, hoog: 3, zeer_hoog: 4 }

export function berekenFallbackScore(adopter: AdopterProfiel, dier: DierProfiel): MatchResultaat {
  const gedrag = dier.gedragsProfiel

  // --- Woning score ---
  let woningScore = 70
  if (adopter.woningType === 'appartement' && !adopter.heeftTuin) {
    if (dier.soort === 'hond') {
      if (gedrag?.energieNiveau === 'zeer_hoog') woningScore = 25
      else if (gedrag?.energieNiveau === 'hoog') woningScore = 42
      else if (gedrag?.energieNiveau === 'normaal') woningScore = 62
      else woningScore = 72 // laag energie hond
      if ((dier.gewichtKg ?? 0) > 20) woningScore = Math.min(woningScore, 35)
    } else {
      woningScore = 82 // kat/konijn in appartement is prima
    }
  } else if (adopter.heeftTuin) {
    woningScore = adopter.tuinOppervlakte === 'groot' ? 92 : adopter.tuinOppervlakte === 'klein' ? 78 : 85
  } else if (adopter.woningType === 'boerderij') {
    woningScore = 95
  }

  // --- Energie score ---
  const adopterEnergie = ENERGIE_MAP[adopter.activiteitNiveau ?? 'normaal'] ?? 2
  const dierEnergie = ENERGIE_MAP[gedrag?.energieNiveau ?? 'normaal'] ?? 2
  const energieVerschil = Math.abs(adopterEnergie - dierEnergie)
  const energieScore = clamp([100, 75, 50, 25][energieVerschil] ?? 15)

  // --- Gezin score ---
  let gezinScore = 80
  if (adopter.aantalKinderen > 0) {
    const jongeKinderen = (adopter.jongsteKindLeeftijd ?? 10) < 6
    if (!gedrag?.kindvriendelijk) {
      gezinScore = jongeKinderen ? 10 : 35
    } else {
      gezinScore = jongeKinderen ? 90 : 85
    }
  }

  // --- Alleen thuis score ---
  let alleenThuisScore = 80
  const alleenThuis = gedrag?.alleenThuis ?? 'matig'
  const werkUren = adopter.werkUrenPerDag
  if (werkUren >= 8) {
    alleenThuisScore = alleenThuis === 'slecht' ? 20 : alleenThuis === 'matig' ? 50 : 70
  } else if (werkUren >= 4) {
    alleenThuisScore = alleenThuis === 'slecht' ? 45 : alleenThuis === 'matig' ? 72 : 85
  } else {
    alleenThuisScore = alleenThuis === 'slecht' ? 70 : 90
  }

  // --- Ervaring score ---
  let ervaringScore = 80
  const ervaring = adopter.ervaringNiveau ?? 'geen'
  const onervaren = ervaring === 'geen' || ervaring === 'beetje'
  if (onervaren) {
    const moeilijk =
      (gedrag?.trainbaarheid === 'laag') ||
      (ENERGIE_MAP[gedrag?.energieNiveau ?? 'normaal'] ?? 2) >= 3
    ervaringScore = moeilijk ? 35 : 78
  } else if (ervaring === 'gemiddeld') {
    ervaringScore = 82
  } else {
    ervaringScore = 92
  }

  // --- Budget score ---
  let budgetScore = 85
  if (adopter.budgetDierenarts === 'beperkt') {
    const oudDier = (dier.leeftijdJaren ?? 0) >= 10
    const aandoeningen = (dier.medischPaspoort?.allergieën.length ?? 0) > 0
    if (oudDier || aandoeningen) budgetScore = 52
    else budgetScore = 78
  }

  // Gewogen overall
  const score = clamp(
    energieScore * 0.25 +
    gezinScore * 0.22 +
    alleenThuisScore * 0.20 +
    woningScore * 0.15 +
    ervaringScore * 0.13 +
    budgetScore * 0.05
  )

  return {
    dierId: dier.id,
    score,
    analyseTekst: `${dier.naam} heeft een compatibiliteitsscore van ${score}% op basis van jouw leefstijl en woonruimte.`,
    woningScore,
    energieScore,
    gezinScore,
    ervaringScore,
    alleenThuisScore,
    budgetScore,
  }
}

// =================== HELPERS ===================

function nulScore(dierId: number, reden: string): MatchResultaat {
  return { dierId, score: 0, analyseTekst: reden, woningScore: 0, energieScore: 0, gezinScore: 0, ervaringScore: 0, alleenThuisScore: 0, budgetScore: 0 }
}

/**
 * Genereer gedetailleerde match-analyse voor één dier (dierprofielpagina)
 */
export async function genereerMatchAnalyse(
  adopter: AdopterProfiel,
  dier: DierProfiel,
  score: number
): Promise<string> {
  const prompt = `Je bent Dr. Poot, een warme dierenwelzijn-expert voor PootGelukkig.

Schrijf een persoonlijke match-analyse van max 3 zinnen in het Nederlands voor deze combinatie (score: ${score}%).

Adoptant: woont in ${adopter.woningType ?? 'onbekend'}${adopter.heeftTuin ? ' met tuin' : ''}, activiteitsniveau ${adopter.activiteitNiveau ?? 'onbekend'}, werkt ${adopter.werkUrenPerDag} uur/dag buitenshuis.
Dier: ${dier.naam}, ${dier.soort}${dier.ras ? ` (${dier.ras})` : ''}, energie ${dier.gedragsProfiel?.energieNiveau ?? 'onbekend'}, alleen thuis ${dier.gedragsProfiel?.alleenThuis ?? 'onbekend'}.

Begin met "Op basis van..." en benoem zowel de sterkste match-reden als één concreet aandachtspunt (als dat er is).`

  try {
    return await chatCompletion(
      [
        { role: 'system', content: 'Je bent Dr. Poot, een warme maar eerlijke dierenwelzijn-expert. Schrijf in het Nederlands.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 250 }
    )
  } catch {
    return `Op basis van jouw leefstijl is ${dier.naam} een ${score >= 80 ? 'uitstekende' : score >= 60 ? 'goede' : 'mogelijke'} keuze met een score van ${score}%.`
  }
}
