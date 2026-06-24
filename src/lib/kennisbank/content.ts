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
  inhoudMd: string
}

export const DOELGROEP_LABELS: Record<KennisDoelgroep, string> = {
  adoptant: 'Voor adoptanten',
  asiel: 'Voor asiels',
  algemeen: 'Over PootGelukkig',
}

export const CATEGORIEEN: KennisCategorie[] = [
  {
    slug: 'voorbereiding',
    naam: 'Voordat je adopteert',
    beschrijving: 'Verwachtingen, kosten, tijd en woonsituatie.',
    doelgroep: 'adoptant',
    icon: 'home',
  },
  {
    slug: 'intake',
    naam: 'Hoe de intake werkt',
    beschrijving: 'De stappen uitgelegd en wat er met je gegevens gebeurt.',
    doelgroep: 'adoptant',
    icon: 'quiz',
  },
  {
    slug: 'thuiskomst',
    naam: 'Een dier in huis halen',
    beschrijving: 'Eerste dagen, wennen, kinderen en andere huisdieren.',
    doelgroep: 'adoptant',
    icon: 'pets',
  },
  {
    slug: 'nazorg',
    naam: 'Nazorg en gezondheid',
    beschrijving: 'Dierenarts, voeding en gedrag.',
    doelgroep: 'adoptant',
    icon: 'volunteer_activism',
  },
  {
    slug: 'dashboard',
    naam: 'Aan de slag met het dashboard',
    beschrijving: 'Registratie, dieren invoeren en foto’s.',
    doelgroep: 'asiel',
    icon: 'grid_view',
  },
  {
    slug: 'matching',
    naam: 'Aanvragen en matching begrijpen',
    beschrijving: 'Hoe lees je de AI-score en hoe beslis je.',
    doelgroep: 'asiel',
    icon: 'insights',
  },
  {
    slug: 'privacy-avg',
    naam: 'Privacy en AVG',
    beschrijving: 'Wat mag, en de verwerkersovereenkomst.',
    doelgroep: 'asiel',
    icon: 'shield',
  },
  {
    slug: 'hoe-het-werkt',
    naam: 'Hoe matching werkt',
    beschrijving: 'Wat de AI wel en niet doet.',
    doelgroep: 'algemeen',
    icon: 'smart_toy',
  },
]

export const ARTIKELEN: KennisArtikel[] = [
  {
    slug: 'wat-kost-een-asieldier',
    categorieSlug: 'voorbereiding',
    titel: 'Wat kost een asieldier echt?',
    samenvatting:
      'Een overzicht van de eenmalige adoptiekosten en de terugkerende kosten waar je rekening mee houdt.',
    bijgewerkt: '2026-06-01',
    inhoudMd: `Adopteren uit een asiel is goedkoper dan een dier kopen bij een fokker, maar gratis is het niet. Een eerlijk beeld vooraf voorkomt verrassingen.

## Eenmalige kosten
De adoptiebijdrage ligt bij de meeste Nederlandse asiels tussen de 75 en 250 euro, afhankelijk van diersoort en leeftijd. Die bijdrage dekt vaak al chippen, vaccinaties, ontwormen en sterilisatie of castratie.

## Terugkerende kosten
Reken daarnaast op vaste maandlasten:

- **Voeding**: 20 tot 60 euro per maand, afhankelijk van grootte en dieet.
- **Dierenarts**: jaarlijkse controle en vaccinaties, plus een buffer voor onverwachte zorg.
- **Verzekering**: optioneel, maar een ziektekostenverzekering kan een grote rekening opvangen.

## Een buffer is geen luxe
Een dier kan ziek worden of een operatie nodig hebben. Een spaarbuffer van een paar honderd euro zorgt dat je niet hoeft te kiezen tussen je portemonnee en de gezondheid van je dier. In de intake vragen we naar je budget, niet om je af te wijzen, maar om dieren te tonen die bij je situatie passen.`,
  },
  {
    slug: 'is-adopteren-iets-voor-jou',
    categorieSlug: 'voorbereiding',
    titel: 'Is adopteren iets voor jou?',
    samenvatting:
      'Vijf eerlijke vragen die je jezelf stelt voordat je een asieldier in huis haalt.',
    bijgewerkt: '2026-06-01',
    inhoudMd: `Een dier adopteren is een keuze voor jaren. Deze vragen helpen je inschatten of het nu het juiste moment is.

## 1. Heb je tijd?
Een hond heeft dagelijks beweging en aandacht nodig. Een kat is zelfstandiger, maar ook niet onderhoudsvrij. Hoeveel uur per dag ben je thuis?

## 2. Past het bij je woonsituatie?
Mag je huisdieren houden van je verhuurder? Heb je een tuin of ben je aangewezen op uitlaten? Sommige dieren gedijen prima in een appartement, andere niet.

## 3. Past het in je budget?
Zie ook ons artikel over de kosten van een asieldier. Een realistische inschatting voorkomt problemen.

## 4. Is je gezin er klaar voor?
Iedereen in huis moet meewillen. Kinderen, partners en eventuele andere huisdieren bepalen mee welk dier past.

## 5. Kun je flexibel zijn in je verwachtingen?
Het perfecte dier op papier bestaat niet. Sta je open voor een dier dat misschien net wat ouder of rustiger is dan je je had voorgesteld, dan vergroot je de kans op een blijvende match.`,
  },
  {
    slug: 'zo-werkt-de-intake',
    categorieSlug: 'intake',
    titel: 'Zo werkt de intake, stap voor stap',
    samenvatting:
      'Wat we vragen tijdens de intake, waarom we dat vragen en wat er daarna met je antwoorden gebeurt.',
    bijgewerkt: '2026-06-10',
    inhoudMd: `De intake is een kort gesprek over jouw leefstijl. Het duurt een paar minuten en bepaalt op welke dieren we je matchen.

## Wat we vragen
We stellen vragen over je woning, je gezin, je activiteitsniveau, hoeveel je thuis bent, je ervaring met dieren, je budget, eventuele allergieën en je voorkeuren voor soort en leeftijd.

## Waarom we dat vragen
Elke vraag heeft een doel. Allergieën en woonsituatie zijn harde voorwaarden: ze bepalen welke dieren überhaupt passen. De rest weegt mee in een compatibiliteitsscore, zodat je geen dieren ziet die voorspelbaar niet bij je passen.

## Wat er met je antwoorden gebeurt
Je antwoorden vormen je profiel en worden gebruikt om jouw matches te berekenen. We zetten ze niet in voor doeleinden buiten het adoptieproces. Het asiel ziet je profiel pas wanneer jij zelf een aanvraag indient.

## En daarna?
Je krijgt een lijst met passende dieren, elk met een score en een korte uitleg waarom het dier bij je past. Vanaf daar bepaal jij met wie je contact opneemt.`,
  },
  {
    slug: 'de-eerste-dagen-3-3-3',
    categorieSlug: 'thuiskomst',
    titel: 'De eerste dagen: de 3-3-3 regel',
    samenvatting:
      'Hoe een nieuw dier went aan zijn thuis in drie dagen, drie weken en drie maanden.',
    bijgewerkt: '2026-06-12',
    inhoudMd: `Een nieuw dier heeft tijd nodig om te wennen. De 3-3-3 regel is een handig kompas voor die eerste periode.

## De eerste 3 dagen
Je dier is overprikkeld en onzeker. Geef rust, een eigen veilige plek en weinig nieuwe indrukken. Verwacht nog niet zijn echte karakter te zien: veel dieren zijn de eerste dagen stiller dan normaal.

## De eerste 3 weken
Je dier begint te wennen aan het ritme van het huis. Routine helpt enorm: vaste tijden voor eten, uitlaten en rust geven houvast. Je ziet langzaam meer van zijn persoonlijkheid.

## De eerste 3 maanden
Je dier voelt zich thuis en vertrouwt op je. De band is gevormd en eventueel gedrag dat in het begin opviel, is vaak gaan liggen.

## Wanneer hulp zoeken
Twijfel je over gedrag of gezondheid, wacht dan niet te lang. Het asiel kent het dier en denkt graag mee. In de app krijg je tijdens deze fasen gerichte nazorg-tips.`,
  },
  {
    slug: 'de-eerste-dierenartscontrole',
    categorieSlug: 'nazorg',
    titel: 'Nazorg en gezondheid: de basis op orde',
    samenvatting:
      'Dierenarts, voeding en gedrag in de eerste maanden, zodat je dier gezond went aan zijn nieuwe thuis.',
    bijgewerkt: '2026-06-12',
    inhoudMd: `Goede nazorg legt de basis voor een lang en gezond leven samen. Drie dingen verdienen meteen aandacht.

## De eerste dierenartscontrole
Plan binnen een paar weken een kennismaking bij een dierenarts. Die controleert de algehele gezondheid, neemt de vaccinatiestatus door en is meteen een vertrouwd adres als er iets is. Neem het medisch paspoort uit het asiel mee.

## Voeding zonder abrupte wissels
Houd in het begin het voer aan dat je dier in het asiel kreeg. Wil je overstappen, doe dat geleidelijk over een week of tien dagen, zodat de spijsvertering rustig went. Let op gewicht: te snel aankomen is net zo ongezond als vermageren.

## Gedrag lezen in plaats van straffen
Onzeker gedrag in de eerste periode is normaal. Beloon wat goed gaat en vermijd straf bij angst, dat maakt onzekerheid vaak erger. Zie je gedrag dat je zorgen baart, schakel dan op tijd een dierenarts of gedragsdeskundige in.

## Hou het ritme vast
Vaste tijden voor eten, beweging en rust geven houvast. Dat ritme is misschien wel de belangrijkste vorm van nazorg die je zelf in handen hebt.`,
  },
  {
    slug: 'aan-de-slag-met-je-asiel-dashboard',
    categorieSlug: 'dashboard',
    titel: 'Aan de slag met je asiel-dashboard',
    samenvatting:
      'Van registratie tot je eerste dieren in het systeem: de eerste stappen voor een asiel.',
    bijgewerkt: '2026-06-15',
    inhoudMd: `Een asiel komt in een paar stappen op gang met PootGelukkig.

## 1. Registreer je asiel
Maak een account aan met de naam en gegevens van je asiel. Met de gratis Start-tier kun je meteen beginnen.

## 2. Voer je dieren in
Voeg per dier een profiel toe met foto’s, een gedragsprofiel en een medisch paspoort. Hoe completer het profiel, hoe beter de matching werkt.

## 3. Ontvang aanvragen
Adoptanten matchen op leefstijl en dienen aanvragen in. Je ziet per aanvraag een match-score met een korte uitleg.

## 4. Beslis met de regie in eigen hand
De AI bereidt het voor, maar jij beslist. Gebruik de Copilot voor briefings en dossiers en houd je adopties bij met statistieken.

## Tip
Begin met een paar dieren om het systeem te leren kennen. Je breidt daarna eenvoudig uit naar je volledige aanbod.`,
  },
  {
    slug: 'de-ai-matchscore-lezen',
    categorieSlug: 'matching',
    titel: 'De AI-matchscore lezen en wegen',
    samenvatting:
      'Wat de score betekent, hoe hij tot stand komt en waarom hij je beslissing ondersteunt in plaats van overneemt.',
    bijgewerkt: '2026-06-15',
    inhoudMd: `De match-score helpt je sneller de kansrijke aanvragen herkennen. Maar de score vervangt je oordeel niet.

## Hoe de score is opgebouwd
De matching werkt in lagen. Eerst vallen dieren af die niet passen door harde voorwaarden, zoals allergieën of woonsituatie. Daarna berekent het systeem een compatibiliteitsscore van 0 tot 100, met een korte motivatie.

## Wat een hoge score wel en niet zegt
Een hoge score betekent dat de leefstijl van de adoptant goed aansluit bij de behoeften van het dier. Het is een sterk startpunt, geen garantie. Een kennismaking laat dingen zien die geen enkel profiel vangt.

## Hoe je de score gebruikt
Gebruik de score om je tijd te verdelen: begin bij de kansrijke aanvragen, maar blijf kijken naar de mens achter het profiel. Twijfel je, dan helpt de motivatietekst je gericht doorvragen tijdens de kennismaking.

## De beslissing blijft van jou
Jij kent het dier en de context. De score is een hulpmiddel, het asiel houdt altijd het laatste woord.`,
  },
  {
    slug: 'privacy-en-avg-voor-asiels',
    categorieSlug: 'privacy-avg',
    titel: 'Privacy en AVG voor asiels',
    samenvatting:
      'Hoe gegevens worden verwerkt, van wie ze zijn en wat de verwerkersovereenkomst regelt.',
    bijgewerkt: '2026-06-15',
    inhoudMd: `Werken met persoonsgegevens van adoptanten vraagt zorgvuldigheid. PootGelukkig is daarop ingericht.

## Van wie zijn de gegevens?
De gegevens van je dieren en adopties blijven van jouw asiel. PootGelukkig verwerkt ze namens jou om het adoptieproces te laten werken.

## Wat regelt de verwerkersovereenkomst?
In de verwerkersovereenkomst leggen we vast welke gegevens we verwerken, met welk doel, hoe lang we ze bewaren en welke beveiliging we toepassen. Dit is de basis voor AVG-conform werken.

## Dataminimalisatie
We vragen alleen wat nodig is voor matching en adoptie. Niets meer. Adoptantgegevens worden pas voor jou zichtbaar wanneer iemand een aanvraag indient.

## Rechten van betrokkenen
Adoptanten kunnen hun gegevens inzien en laten verwijderen. We helpen je om aan die verzoeken te voldoen binnen de wettelijke termijnen.`,
  },
  {
    slug: 'hoe-werkt-de-matching',
    categorieSlug: 'hoe-het-werkt',
    titel: 'Hoe werkt de matching, en wat doet de AI?',
    samenvatting:
      'Een heldere uitleg van het matching-model en de grens tussen wat de AI doet en wat de mens beslist.',
    bijgewerkt: '2026-06-18',
    inhoudMd: `Matching klinkt als magie, maar het is vooral zorgvuldig redeneren in stappen. Dit is wat er gebeurt.

## Laag 1: harde voorwaarden
Eerst sluiten we uit wat niet kan. Een allergie voor honden betekent geen honden. Een grote, energieke hond past niet in elk appartement. Wat niet past, tonen we niet.

## Laag 2: compatibiliteit
Voor de dieren die wél passen, berekenen we een score van 0 tot 100. We vergelijken de leefstijl van de adoptant met de behoeften en het gedrag van het dier, en geven een korte motivatie.

## Laag 3: leren van de praktijk
Op termijn leert het systeem van geslaagde adopties, zodat matches steeds beter worden. Dit gebeurt op geaggregeerd niveau, niet om individuele mensen te beoordelen.

## Wat de AI niet doet
De AI beslist nooit wie een dier mag adopteren. Dat oordeel ligt bij het asiel. De AI bespaart tijd en maakt het voorwerk inzichtelijk, maar de mens houdt de regie.

## Transparantie
We zijn open over wat de techniek doet. Heb je vragen over een specifieke match of score, dan kun je die altijd stellen aan het asiel.`,
  },
]

// ─── Helpers (puur, eenvoudig te testen) ─────────────────────────────────────

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
