// Kennisbank-content als getypte module. Geen DB nodig: snel, betrouwbaar en
// volledig te testen. Later eenvoudig te vervangen door een CMS/DB-bron.

export type KennisDoelgroep = 'adoptant' | 'asiel' | 'algemeen'

export interface KennisCategorie {
  slug: string
  naam: string
  beschrijving: string
  doelgroep: KennisDoelgroep
  icon: string
}

export interface KennisArtikel {
  slug: string
  categorieSlug: string
  titel: string
  samenvatting: string
  bijgewerkt: string // ISO-datum (YYYY-MM-DD)
  coverUrl: string // relatief pad naar /images/kennisbank/
  inhoudMd: string
}

export const DOELGROEP_LABELS: Record<KennisDoelgroep, string> = {
  adoptant: 'Voor cliënten',
  asiel: 'Voor organisaties',
  algemeen: 'Over ImpactOS',
}

export const CATEGORIEEN: KennisCategorie[] = [
  {
    slug: 'subsidies',
    naam: 'Fondsen & subsidies',
    beschrijving: 'Sneller en beter subsidieaanvragen, begrotingen en verantwoordingen schrijven.',
    doelgroep: 'algemeen',
    icon: 'volunteer_activism',
  },
  {
    slug: 'verantwoording',
    naam: 'Impact & verantwoording',
    beschrijving: 'Wmo- en gemeentelijke rapportages zonder gedoe met losse Excel-bestanden.',
    doelgroep: 'algemeen',
    icon: 'bar_chart',
  },
  {
    slug: 'vrijwilligers',
    naam: 'Vrijwilligers & maatjes',
    beschrijving: 'Werven, screenen en behouden van vrijwilligers en maatjes.',
    doelgroep: 'algemeen',
    icon: 'groups',
  },
]

export const ARTIKELEN: KennisArtikel[] = [
  {
    slug: 'subsidieaanvragen-40-procent-sneller-met-ai',
    categorieSlug: 'subsidies',
    titel: 'Hoe stichtingen subsidieaanvragen 40% sneller afronden met AI',
    samenvatting:
      'Een subsidieaanvraag schrijven kost al snel een dagdeel: cijfers verzamelen, een begroting opstellen, de juiste toon vinden voor het fonds. AI-collega Sam neemt het eerste concept voor zijn rekening, jij blijft eindverantwoordelijk.',
    bijgewerkt: '2026-08-01',
    coverUrl: '/images/kennisbank/subsidieaanvragen-40-procent-sneller-met-ai.jpg',
    inhoudMd: `Voor veel stichtingen en sociaal ondernemers is het schrijven van subsidieaanvragen een van de meest tijdrovende klussen van de maand. Cijfers verzamelen uit losse dossiers, een begroting kloppend krijgen, en dan nog de juiste toon vinden voor het VSBfonds, Kansfonds, Oranje Fonds of de gemeente — het kost al snel een dagdeel per aanvraag.

## Waar de tijd nu naartoe gaat

De meeste tijd gaat niet naar het schrijven zelf, maar naar het bij elkaar zoeken van de onderbouwing: hoeveel trajecten liepen er dit kwartaal, wat waren de resultaten, welke cijfers onderbouwen de impact. Als die data verspreid staat over spreadsheets, mailboxen en aantekeningen, is dat zoekwerk het echte tijdverlies.

## Wat verandert er met een AI-collega

In ImpactOS heeft elke organisatie toegang tot Sam, de AI-collega voor Fondsen & Subsidies. Sam heeft rechtstreeks toegang tot de actuele dossier- en projectdata binnen jouw organisatie en stelt op basis daarvan een eerste concept op: een subsidieaanvraag, een projectbegroting of een fondsverantwoording, compleet met de juiste cijfers en een toon die past bij het fonds.

Dat concept vertrekt nooit automatisch. Het landt in de wachtrij, waar een medewerker het leest, aanpast waar nodig, en pas dan verstuurt. Sam bespaart het opzoekwerk en de eerste versie — de beoordeling en de verantwoordelijkheid blijven altijd bij de organisatie.

## Waarom dat sneller is

Organisaties die op deze manier werken, rapporteren dat het opstellen van een aanvraag van een dagdeel terugloopt naar 30 tot 45 minuten beoordelingstijd — een tijdwinst van rond de 40%. Niet omdat de AI de aanvraag "beter" schrijft, maar omdat het meeste werk (het zoeken en structureren) al gedaan is tegen de tijd dat een medewerker ernaar kijkt.

## Zelf beginnen

Wil je zien hoe dit voor jouw organisatie werkt? Activeer Sam via AI Rollen in je ImpactOS-omgeving, of [plan een Doorbraak Sprint](/contact) en we richten het in één dagdeel samen in.`,
  },
  {
    slug: 'verantwoorden-zonder-buikpijn-wmo-rapportages',
    categorieSlug: 'verantwoording',
    titel: 'Verantwoorden zonder buikpijn: grip op Wmo- en gemeentelijke rapportages',
    samenvatting:
      'Wmo-rapportages en gemeentelijke verantwoording voelen vaak als een jaarlijkse stressmoment. Met de juiste dossiervoering en AI-collega Mila wordt het een kwestie van doorlopend bijhouden in plaats van eenmalig reconstrueren.',
    bijgewerkt: '2026-08-01',
    coverUrl: '/images/kennisbank/verantwoorden-zonder-buikpijn-wmo-rapportages.jpg',
    inhoudMd: `Herkenbaar? Ergens in het najaar moet de jaarrapportage naar de gemeente, en blijkt dat de cijfers over het hele jaar verspreid staan over losse Excel-bestanden, WhatsApp-notities en het geheugen van collega's. Verantwoorden voelt dan als reconstrueren, niet als rapporteren.

## Het probleem zit in de dossiervoering, niet in het rapporteren

De stress rond een Wmo- of gemeentelijke rapportage ontstaat zelden bij het schrijven zelf. Die ontstaat omdat de onderliggende data — trajectstatussen, veldlogs, gewerkte uren, resultaten per cliënt — niet doorlopend op één plek is bijgehouden. Tegen de tijd dat de rapportage moet, is het te laat om dat nog goed te doen.

## Wat een centraal dossiersysteem oplost

In ImpactOS staat elk traject als dossier geregistreerd, met een duidelijke categorie (Wmo, participatie, jeugd, re-integratie), status en gekoppelde veldlogs. Iedere update — een voortgangsgesprek, een statuswijziging, een afgeronde begeleiding — landt direct op de juiste plek. Er is dus nooit een moment waarop je met terugwerkende kracht een heel jaar moet reconstrueren.

## De rol van Mila

Mila, de AI-collega voor Impact & Verantwoording, bundelt die doorlopend bijgehouden veldlogs, uren en resultaten tot een gestructureerde Wmo- of SROI-rapportage of een beleidssamenvatting voor de gemeente. Ook hier geldt: Mila levert een concept, geen eindproduct. Een medewerker controleert de cijfers en de toon voordat het de deur uitgaat.

## Praktisch beginnen

De grootste tijdwinst zit niet in het automatiseren van het schrijven, maar in het wegnemen van de reconstructie. Zodra dossiers doorlopend worden bijgehouden in plaats van achteraf ingevuld, is de jaarlijkse rapportage een kwestie van reviewen in plaats van reconstrueren. Bekijk in het [beheerdersportaal](/tarieven) hoe dossierbeheer en rapportage in ImpactOS samenwerken.`,
  },
  {
    slug: 'vrijwilligers-werven-en-behouden-geluksmonitor',
    categorieSlug: 'vrijwilligers',
    titel: 'Vrijwilligers werven en behouden: de kracht van de Geluksmonitor',
    samenvatting:
      'Vrijwilligers werven is vaak makkelijker dan ze behouden. Structureel zicht op betrokkenheid — een "geluksmonitor" — helpt organisaties op tijd te signaleren wie dreigt af te haken, en waarom.',
    bijgewerkt: '2026-08-01',
    coverUrl: '/images/kennisbank/vrijwilligers-werven-en-behouden-geluksmonitor.jpg',
    inhoudMd: `Veel organisaties in het sociaal domein leunen zwaar op vrijwilligers en maatjes. Het werven van nieuwe mensen krijgt meestal de meeste aandacht — maar het is minstens zo belangrijk om te begrijpen waarom vrijwilligers na verloop van tijd afhaken, en daar op tijd bij te zijn.

## Werven is zichtbaar, behouden is stil

Een wervingscampagne heeft een duidelijk startpunt en een meetbaar resultaat: zoveel aanmeldingen, zoveel intakegesprekken. Uitval is veel stiller. Een vrijwilliger die minder reageert, shifts afzegt of zich terugtrekt, doet dat meestal geleidelijk — tot het moment dat diegene helemaal stopt en de organisatie voor een verrassing staat.

## Wat een geluksmonitor toevoegt

Door structureel bij te houden hoe actief en betrokken vrijwilligers en maatjes zijn — beschikbare uren, functie, status, laatste contactmoment — ontstaat een vroeg signaal wanneer iemand minder actief wordt. Dat is het idee achter een geluksmonitor: niet reageren als iemand al vertrokken is, maar signaleren zodra de eerste tekenen zichtbaar worden.

## De rol van Bram

Bram, de AI-collega voor Werving & Vrijwilligers, screent nieuwe aanmeldingen op beschikbaarheid, motivatie en ervaring, stelt onboarding-checklists op, en helpt bij het matchen van maatjes aan cliënten. Minstens zo waardevol: Bram signaleert wanneer een vrijwilliger minder actief wordt en stelt een kort, persoonlijk retentiebericht voor — een concept, dat een medewerker beoordeelt voordat het verstuurd wordt.

## Klein beginnen

Je hoeft niet meteen een uitgebreid dashboard te bouwen. Begin met het consistent vastleggen van basisgegevens per vrijwilliger — functie, uren, status — en laat Bram vanaf daar meedenken over wie aandacht nodig heeft. [Activeer Bram](/contact) voor jouw organisatie en ontdek wat structureel zicht op betrokkenheid oplevert.`,
  },
]

// ─── Helpers (puur, eenvoudig te testen) ─────────────────────────────────────

export function zoekKennisbank(query: string): {
  artikel: KennisArtikel
  categorie: KennisCategorie
  score: number
}[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const results: { artikel: KennisArtikel; categorie: KennisCategorie; score: number }[] = []

  for (const artikel of ARTIKELEN) {
    const cat = categorieBySlug(artikel.categorieSlug)
    if (!cat) continue
    const inTitel = artikel.titel.toLowerCase().includes(q)
    const inSamenvatting = artikel.samenvatting.toLowerCase().includes(q)
    const inInhoud = artikel.inhoudMd.toLowerCase().includes(q)
    if (inTitel || inSamenvatting || inInhoud) {
      let score = 0
      if (inTitel) score += 10
      if (inSamenvatting) score += 5
      if (inInhoud) score += 1
      // Bonus voor exacte match of begin van titel
      if (artikel.titel.toLowerCase().startsWith(q)) score += 20
      if (cat.naam.toLowerCase().includes(q)) score += 3
      results.push({ artikel, categorie: cat, score })
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 12)
}

export function categorieBySlug(slug: string): KennisCategorie | undefined {
  return CATEGORIEEN.find((c) => c.slug === slug)
}

export function artikelenVoorCategorie(categorieSlug: string): KennisArtikel[] {
  return ARTIKELEN.filter((a) => a.categorieSlug === categorieSlug)
}

export function artikelBySlug(categorieSlug: string, slug: string): KennisArtikel | undefined {
  return ARTIKELEN.find((a) => a.categorieSlug === categorieSlug && a.slug === slug)
}

export function categorieenPerDoelgroep(): { doelgroep: KennisDoelgroep; categorieen: KennisCategorie[] }[] {
  const doelgroepen: KennisDoelgroep[] = ['adoptant', 'asiel', 'algemeen']
  return doelgroepen.map((doelgroep) => ({
    doelgroep,
    categorieen: CATEGORIEEN.filter((c) => c.doelgroep === doelgroep),
  }))
}

export function alleKennisPaden(): { categorieSlug: string; slug: string; bijgewerkt: string }[] {
  return ARTIKELEN.map((a) => ({ categorieSlug: a.categorieSlug, slug: a.slug, bijgewerkt: a.bijgewerkt }))
}
