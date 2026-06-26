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
  // ─── Voorbereiding (adoptant) ─────────────────────────────────────────────
  {
    slug: 'wat-kost-een-asieldier',
    categorieSlug: 'voorbereiding',
    titel: 'Wat kost een asieldier echt?',
    samenvatting:
      'Van adoptiebijdrage tot maandelijkse voer- en dierenartskosten. Een compleet overzicht van wat een asieldier écht kost, zodat je niet voor verrassingen komt te staan.',
    bijgewerkt: '2026-06-01',
    coverUrl: '/images/kennisbank/wat-kost-een-asieldier.jpg',
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
      'Twijfel je of adopteren bij je past? Vijf eerlijke vragen over tijd, budget, woonsituatie en gezin die je helpen beslissen of een asieldier nú de juiste keuze is.',
    bijgewerkt: '2026-06-01',
    coverUrl: '/images/kennisbank/is-adopteren-iets-voor-jou.jpg',
    inhoudMd: `Een dier adopteren is een keuze voor jaren. Deze vragen helpen je inschatten of het nu het juiste moment is.

## Veelgestelde vragen over adopteren

### 1. Heb je tijd?
Een hond heeft dagelijks beweging en aandacht nodig. Een kat is zelfstandiger, maar ook niet onderhoudsvrij. Hoeveel uur per dag ben je thuis?

### 2. Past het bij je woonsituatie?
Mag je huisdieren houden van je verhuurder? Heb je een tuin of ben je aangewezen op uitlaten? Sommige dieren gedijen prima in een appartement, andere niet.

### 3. Past het in je budget?
Zie ook ons artikel over de kosten van een asieldier. Een realistische inschatting voorkomt problemen.

### 4. Is je gezin er klaar voor?
Iedereen in huis moet meewillen. Kinderen, partners en eventuele andere huisdieren bepalen mee welk dier past.

### 5. Kun je flexibel zijn in je verwachtingen?
Het perfecte dier op papier bestaat niet. Sta je open voor een dier dat misschien net wat ouder of rustiger is dan je je had voorgesteld, dan vergroot je de kans op een blijvende match.`,
  },
  {
    slug: 'hoe-bereid-je-je-huis-voor-op-een-nieuw-dier',
    categorieSlug: 'voorbereiding',
    titel: 'Hoe bereid je je huis voor op een nieuw dier?',
    samenvatting: 'Praktische checklist met alles wat je nodig hebt voordat je asieldier thuiskomt: van een veilige plek en voerbakken tot planten die je beter kunt verwijderen.',
    bijgewerkt: '2026-07-01',
    coverUrl: '/images/kennisbank/hoe-bereid-je-je-huis-voor-op-een-nieuw-dier.jpg',
    inhoudMd: `Een nieuw dier komt in een onbekende omgeving. Een goede voorbereiding maakt de overgang soepeler.

## Checklist voor aankomst
- **Veilige plek**: een rustig hoekje met een mand of kussen waar het dier zich terug kan trekken
- **Voer- en waterbakken**: apart van elkaar, op een vaste plek
- **Eten**: vraag het asiel het vertrouwde voer mee, of koop hetzelfde merk
- **Speelgoed**: een paar eenvoudige speeltjes om te ontdekken
- **Halsband/riem**: voor honden, ook als je nog niet gaat wandelen
- **Kattenbak**: voor katten op een stille, toegankelijke plek
- **Bescherming**: stop snoeren weg, zet giftige planten buiten bereik

## Wat je beter niet doet
- Alles in één keer nieuw kopen. Het dier kan overweldigd raken.
- Direct familie en vrienden uitnodigen. Een nieuw dier heeft rust nodig.`,
  },
  {
    slug: 'welk-dier-past-bij-jouw-leefstijl',
    categorieSlug: 'voorbereiding',
    titel: 'Welk dier past bij jouw leefstijl?',
    samenvatting: 'Hond, kat of konijn? Ontdek welk asieldier past bij jouw tijd, ruimte en ervaring. Een heldere vergelijking van kosten, verzorging en benodigde aandacht per diersoort.',
    bijgewerkt: '2026-07-02',
    coverUrl: '/images/kennisbank/welk-dier-past-bij-jouw-leefstijl.jpg',
    inhoudMd: `Niet elk dier past bij elke leefstijl. Deze vergelijking helpt je een richting te kiezen.

## Hond
- **Tijd**: minimaal 2-3 uur per dag (uitlaten, spelen, trainen)
- **Ruimte**: tuin fijn, maar niet noodzakelijk bij voldoende beweging
- **Ervaring**: basiskennis hondentaal en opvoeding gewenst
- **Kosten**: €75-200 adoptie + €50-80/maand

## Kat
- **Tijd**: 30-60 min per dag actief aandacht
- **Ruimte**: appartement prima, mits voldoende klim- en speelmogelijkheden
- **Ervaring**: geschikt voor beginners
- **Kosten**: €75-150 adoptie + €30-50/maand

## Konijn
- **Tijd**: 30-60 min per dag verzorging en aandacht
- **Ruimte**: ruime kooi + dagelijks los in huis of ren
- **Ervaring**: specifieke kennis over voeding en huisvesting
- **Kosten**: €20-50 adoptie + €20-40/maand

## Laat je niet leiden door emotie
Het is verleidelijk om te vallen voor de eerste blik. Maar een dier dat past bij jouw energie en beschikbaarheid maakt de kans op een blijvende match veel groter.`,
  },
  // ─── Intake (adoptant) ────────────────────────────────────────────────────
  {
    slug: 'zo-werkt-de-intake',
    categorieSlug: 'intake',
    titel: 'Zo werkt de intake, stap voor stap',
    samenvatting:
      'Hoe de PootGelukkig intake werkt in een paar minuten: welke vragen we stellen en waarom, en wat er met je antwoorden gebeurt op weg naar jouw ideale match.',
    bijgewerkt: '2026-06-10',
    coverUrl: '/images/kennisbank/zo-werkt-de-intake.jpg',
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
    slug: 'hoe-lang-duurt-een-adoptie',
    categorieSlug: 'intake',
    titel: 'Hoe lang duurt een adoptie via PootGelukkig?',
    samenvatting: 'Hoe snel kun je een asieldier adopteren via PootGelukkig? Een realistische tijdlijn van intake tot sleuteloverdracht, inclusief tips om sneller een match te vinden.',
    bijgewerkt: '2026-07-05',
    coverUrl: '/images/kennisbank/hoe-lang-duurt-een-adoptie.jpg',
    inhoudMd: `Hoe snel een adoptie gaat, hangt af van meerdere factoren. Dit is een gemiddelde tijdlijn.

## Fase 1: Intake (5 minuten)
Het invullen van de leefstijl-intake duurt een paar minuten. Daarna zie je direct matches.

## Fase 2: Aanvraag indienen (1 dag)
Je kiest een dier, dient een aanvraag in. Het asiel reageert meestal binnen 1-2 werkdagen.

## Fase 3: Kennismaking (binnen 1 week)
Een geslaagde kennismaking is vaak binnen een week geregeld.

## Fase 4: Adoptie
Direct na de kennismaking kan de adoptie worden afgerond. Het totale doorloopt is meestal 1 tot 3 weken.

> **Tip**: Hoe flexibeler je bent in diersoort, leeftijd en uiterlijk, hoe sneller je een match vindt.`,
  },
  // ─── Thuiskomst (adoptant) ────────────────────────────────────────────────
  {
    slug: 'de-eerste-dagen-3-3-3',
    categorieSlug: 'thuiskomst',
    titel: 'De eerste dagen: de 3-3-3 regel',
    samenvatting:
      'De 3-3-3 regel helpt je begrijpen hoe een asieldier went aan zijn nieuwe thuis. Wat je kunt verwachten na drie dagen, drie weken en drie maanden, en wanneer je hulp moet zoeken.',
    bijgewerkt: '2026-06-12',
    coverUrl: '/images/kennisbank/de-eerste-dagen-3-3-3.jpg',
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
    slug: 'introductie-andere-huisdieren',
    categorieSlug: 'thuiskomst',
    titel: 'Introductie met andere huisdieren: zo doe je dat',
    samenvatting: 'Stap-voor-stap hoe je een nieuw asieldier veilig introduceert bij je bestaande hond, kat of ander huisdier. Van aparte ruimtes tot samenleven in vertrouwen en rust.',
    bijgewerkt: '2026-07-06',
    coverUrl: '/images/kennisbank/introductie-andere-huisdieren.jpg',
    inhoudMd: `De introductie tussen een nieuw en bestaand huisdier bepaalt vaak of ze goed samenleven. Geduld is de sleutel.

## Stap 1: Aparte ruimtes (dag 1-3)
Houd het nieuwe dier in een aparte kamer. Laat ze elkaar ruiken onder de deur door. Ruil dekens en speeltjes uit zodat ze elkaars geur leren kennen zonder direct contact.

## Stap 2: Zicht, geen contact (dag 4-7)
Laat ze elkaar zien via een babyhekje of een kier. Houd de sessies kort en positief. Beloon rustig gedrag.

## Stap 3: Korte ontmoetingen (dag 7-14)
Laat ze onder toezicht kort bij elkaar. Houd de eerste ontmoetingen kort (5-10 minuten) en bouw rustig op.

## Stap 4: Samenleven
Na twee tot drie weken kunnen de meeste dieren samenleven. Blijf voerbakken en rustplekken gescheiden houden in het begin.

> **Let op**: elk dier is anders. Sommige hebben dagen nodig, andere weken. Forceer niets.`,
  },
  // ─── Nazorg (adoptant) ───────────────────────────────────────────────────
  {
    slug: 'de-eerste-dierenartscontrole',
    categorieSlug: 'nazorg',
    titel: 'Nazorg en gezondheid: de basis op orde',
    samenvatting:
      'Dierenarts, voeding en gedrag in de eerste maanden na adoptie. Waar je op moet letten om je asieldier gezond en ontspannen te laten wennen aan zijn nieuwe thuis.',
    bijgewerkt: '2026-06-12',
    coverUrl: '/images/kennisbank/de-eerste-dierenartscontrole.jpg',
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
    slug: 'wanneer-naar-de-dierenarts',
    categorieSlug: 'nazorg',
    titel: 'Wanneer moet je naar de dierenarts?',
    samenvatting: 'Wanneer bel je direct de dierenarts en wat kan wachten tot morgen? Herken spoed, plan routinecontroles en noteer het noodnummer van een 24-uurskliniek vóór je het nodig hebt.',
    bijgewerkt: '2026-07-08',
    coverUrl: '/images/kennisbank/wanneer-naar-de-dierenarts.jpg',
    inhoudMd: `Niet elk vreemd gedrag is een reden voor paniek, maar sommige signalen vragen om actie.

## Spoed (meteen bellen)
- Ademhalingsproblemen (benauwd, piepend, blauw tandvlees)
- Niet kunnen plassen of poepen (langer dan 24 uur)
- Braken of diarree met bloed
- Aanrijding of val van hoogte
- Vergiftiging (braakt, trilt, kwijlt excessief)

## Binnen 24 uur
- Eten niet meer dan 24 uur
- Hoge koorts (neus warm en droog, dier is lusteloos)
- Zichtbaar pijn (janken, hijgen zonder inspanning, vermijden van aanraking)
- Oog- of oorontsteking

## Routine (binnen een maand)
- Jaarlijkse vaccinatie
- Ontwormen en vlooienbestrijding
- Tandheelkundige controle
- Gewichtscontrole

> **Tip**: noteer het telefoonnummer van een 24-uurs dierenkliniek in je telefoon vóór je het nodig hebt.`,
  },
  // ─── Dashboard (asiel) ───────────────────────────────────────────────────
  {
    slug: 'aan-de-slag-met-je-asiel-dashboard',
    categorieSlug: 'dashboard',
    titel: 'Aan de slag met je asiel-dashboard',
    samenvatting:
      'Stap-voor-stap aan de slag met PootGelukkig als asiel: registreren, dieren toevoegen, aanvragen ontvangen en matches beheren. Zo ben je in een uurtje operationeel.',
    bijgewerkt: '2026-06-15',
    coverUrl: '/images/kennisbank/aan-de-slag-met-je-asiel-dashboard.jpg',
    inhoudMd: `Een asiel komt in een paar stappen op gang met PootGelukkig.

## 1. Registreer je asiel
Maak een account aan met de naam en gegevens van je asiel. Met de gratis Start-tier kun je meteen beginnen.

## 2. Voer je dieren in
Voeg per dier een profiel toe met foto's, een gedragsprofiel en een medisch paspoort. Hoe completer het profiel, hoe beter de matching werkt.

## 3. Ontvang aanvragen
Adoptanten matchen op leefstijl en dienen aanvragen in. Je ziet per aanvraag een match-score met een korte uitleg.

## 4. Beslis met de regie in eigen hand
De AI bereidt het voor, maar jij beslist. Gebruik de Copilot voor briefings en dossiers en houd je adopties bij met statistieken.

## Tip
Begin met een paar dieren om het systeem te leren kennen. Je breidt daarna eenvoudig uit naar je volledige aanbod.`,
  },
  {
    slug: 'dieren-bulk-importeren',
    categorieSlug: 'dashboard',
    titel: 'Dieren in bulk importeren',
    samenvatting: 'Bespaar uren werk door meerdere dieren tegelijk in te voeren in PootGelukkig. Stap-voor-stap uitleg voor CSV-upload en API-koppeling met jouw eigen administratiesysteem.',
    bijgewerkt: '2026-07-10',
    coverUrl: '/images/kennisbank/dieren-bulk-importeren.jpg',
    inhoudMd: `Heb je veel dieren tegelijk in te voeren? Bulk-import bespaart uren werk.

## Optie 1: CSV-upload
Maak een CSV-bestand met kolommen voor naam, soort, leeftijd, geslacht, ras, gedragskenmerken, medische status en omschrijving. Upload het bestand in het dashboard en de dieren worden in één keer aangemaakt.

## Optie 2: API-koppeling
Voor asiels met een eigen administratiesysteem is een API-koppeling mogelijk. Dieren worden dan automatisch gesynchroniseerd. Neem contact met ons op voor de documentatie.

## Waar je op moet letten
- Zorg dat het CSV-bestand geen speciale tekens bevat die breken
- Controleer na import of alle foto's correct zijn gekoppeld
- Test met 2-3 proefdieren voordat je een volledige import doet`,
  },
  // ─── Matching (asiel) ─────────────────────────────────────────────────────
  {
    slug: 'de-ai-matchscore-lezen',
    categorieSlug: 'matching',
    titel: 'De AI-matchscore lezen en wegen',
    samenvatting:
      'Hoe de AI-matchscore van PootGelukkig tot stand komt, wat een hoge of lage score écht betekent en waarom het asiel altijd het laatste woord houdt in adoptiebeslissingen.',
    bijgewerkt: '2026-06-15',
    coverUrl: '/images/kennisbank/de-ai-matchscore-lezen.jpg',
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
    slug: 'aanvragen-filteren-en-beheren',
    categorieSlug: 'matching',
    titel: 'Aanvragen filteren, beheren en opvolgen',
    samenvatting: 'Houd overzicht op alle adoptieaanvragen in PootGelukkig: filteren op status en matchscore, notities toevoegen en via het platform communiceren met adoptanten.',
    bijgewerkt: '2026-07-12',
    coverUrl: '/images/kennisbank/aanvragen-filteren-en-beheren.jpg',
    inhoudMd: `Als er meerdere aanvragen binnenkomen, is het belangrijk om overzicht te houden.

## Status per aanvraag
Elke aanvraag heeft een status: nieuw, in behandeling, kennismaking gepland, afgerond of afgewezen. Je filtert eenvoudig op status.

## Sorteren op match-score
Begin met de hoogste scores. De kans op een succesvolle match is daar het grootst. Maar laat je niet blind staren op de score: een lagere score met een warme motivatie kan een betere match zijn.

## Notities bij aanvragen
Maak per aanvraag een korte notitie. Dat helpt bij het vergelijken van meerdere kandidaten voor hetzelfde dier.

## Communicatie
Alle communicatie verloopt via het platform. Zo heb je alles op één plek en mis je geen berichten.`,
  },
  // ─── Privacy (asiel) ─────────────────────────────────────────────────────
  {
    slug: 'privacy-en-avg-voor-asiels',
    categorieSlug: 'privacy-avg',
    titel: 'Privacy en AVG voor asiels',
    samenvatting:
      'Alles wat asielen moeten weten over privacy en AVG bij PootGelukkig: dataminimalisatie, verwerkersovereenkomst, rechten van adoptanten en beveiliging van dier- en persoonsgegevens.',
    bijgewerkt: '2026-06-15',
    coverUrl: '/images/kennisbank/privacy-en-avg-voor-asiels.jpg',
    inhoudMd: `Werken met persoonsgegevens van adoptanten vraagt zorgvuldigheid. PootGelukkig is daarop ingericht.

## Veelgestelde vragen over privacy

### Van wie zijn de gegevens?
De gegevens van je dieren en adopties blijven van jouw asiel. PootGelukkig verwerkt ze namens jou om het adoptieproces te laten werken.

### Wat regelt de verwerkersovereenkomst?
In de verwerkersovereenkomst leggen we vast welke gegevens we verwerken, met welk doel, hoe lang we ze bewaren en welke beveiliging we toepassen. Dit is de basis voor AVG-conform werken.

## Dataminimalisatie
We vragen alleen wat nodig is voor matching en adoptie. Niets meer. Adoptantgegevens worden pas voor jou zichtbaar wanneer iemand een aanvraag indient.

## Rechten van betrokkenen
Adoptanten kunnen hun gegevens inzien en laten verwijderen. We helpen je om aan die verzoeken te voldoen binnen de wettelijke termijnen.`,
  },
  {
    slug: 'bewaartermijnen-en-verwijderen',
    categorieSlug: 'privacy-avg',
    titel: 'Bewaartermijnen en gegevens verwijderen',
    samenvatting: 'Hoe lang bewaart PootGelukkig gegevens van adoptanten en adopties? Bewaartermijnen per categorie, verwijdering aanvragen en automatische opschoning uitgelegd voor asielen.',
    bijgewerkt: '2026-07-14',
    coverUrl: '/images/kennisbank/bewaartermijnen-en-verwijderen.jpg',
    inhoudMd: `Goed gegevensbeheer is onderdeel van AVG-compliance. Dit zijn de richtlijnen.

## Bewaartermijnen
- Adoptiegegevens: 2 jaar na afronding van de adoptie
- Intakeprofielen van niet-geadopteerde matches: 6 maanden na de laatste activiteit
- Communicatieberichten: 1 jaar
- Dierprofielen: zolang het dier in het asiel is

## Verwijderen aanvragen
Een adoptant kan op elk moment vragen om verwijdering van zijn of haar gegevens. Dat regelt het asiel via het dashboard, of neemt contact met ons op.

## Automatische opschoning
Het systeem verwijdert verlopen profielen automatisch. Je krijgt een melding voordat gegevens worden opgeschoond.`,
  },
  // ─── Hoe-het-werkt (algemeen) ─────────────────────────────────────────────
  {
    slug: 'hoe-werkt-de-matching',
    categorieSlug: 'hoe-het-werkt',
    titel: 'Hoe werkt de matching, en wat doet de AI?',
    samenvatting:
      'Hoe de AI-matching van PootGelukkig precies werkt: van harde voorwaarden en compatibiliteitsscore tot wat de technologie wél en niet beslist in het adoptieproces.',
    bijgewerkt: '2026-06-18',
    coverUrl: '/images/kennisbank/hoe-werkt-de-matching.jpg',
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
  {
    slug: 'voor-wie-is-pootgelukkig',
    categorieSlug: 'hoe-het-werkt',
    titel: 'Voor wie is PootGelukkig?',
    samenvatting: 'Voor wie is PootGelukkig bedoeld? Ontdek wat het platform biedt aan adoptanten, asielen en regionale netwerken. Voor iedereen die betrokken is bij dieradoptie in Nederland.',
    bijgewerkt: '2026-07-15',
    coverUrl: '/images/kennisbank/voor-wie-is-pootgelukkig.jpg',
    inhoudMd: `PootGelukkig is er voor iedereen die betrokken is bij dieradoptie in Nederland.

## Voor adoptanten (gratis)
Je vult een intake in, ziet gepersonaliseerde matches en dient aanvragen in. Geen kosten, geen verplichtingen.

## Voor asielen (gratis te proberen)
Je beheert je dieren, ontvangt aanvragen met AI-match-scores en gebruikt de Copilot. De gratis Start-tier is er om te ontdekken of het werkt voor jouw asiel.

## Voor netwerken (op maat)
Dierenlot-aangesloten asielen en regionale samenwerkingsverbanden krijgen gecentraliseerde facturatie, koepelrapportage en support op maat.

## Wie er niet bij kan
PootGelukkig richt zich op erkende asielen en herplaatsingsinitiatieven. Particuliere verkopers of fokkers kunnen geen gebruik maken van het platform.`,
  },

  {
    slug: 'wat-gebeurt-er-na-de-intake',
    categorieSlug: 'intake',
    titel: 'Wat gebeurt er na de intake?',
    samenvatting: 'Na je intake matcht het systeem, krijg je suggesties en kun je contact opnemen met het asiel. Een helder overzicht van het proces na je aanmelding.',
    bijgewerkt: '2026-07-20',
    coverUrl: '/images/kennisbank/wat-gebeurt-er-na-de-intake.jpg',
    inhoudMd: `Je intake is verwerkt. Wat gebeurt er daarna? Een kort overzicht van het proces.

## Je profiel wordt gematcht
Het systeem vergelijkt jouw leefstijl met de beschikbare dieren. Harde voorwaarden filteren we eerst, daarna berekenen we een compatibiliteitsscore per dier. Dit gebeurt in enkele seconden.

## Je ontvangt dier-suggesties
Je ziet een lijst met dieren die bij je passen, elk met een score en een korte uitleg. Je kunt filteren op soort, leeftijd en locatie.

## Contact met het asiel
Past een dier? Je dient een aanvraag in via het platform. Het asiel ontvangt je profiel en de match-score en neemt contact op. Meestal gebeurt dat binnen 1-2 werkdagen.

## De kennismaking
Na goedkeuring plan je een kennismaking. Je leert het dier kennen, stelt vragen en voelt of het klikt. Besluit je tot adoptie, dan wordt alles in het systeem afgerond.

## Veelgestelde vragen
### Hoe lang duurt het voordat ik matches zie?
Direct na de intake zie je de eerste suggesties.
### Kan ik meerdere aanvragen doen?
Ja, je kunt tegelijkertijd op meerdere dieren reageren.
### Wat als het niet klikt?
Geen probleem. Je kunt een nieuwe aanvraag doen voor een ander dier.`,
  },
  {
    slug: 'dagritme-opbouwen-nieuw-asieldier',
    categorieSlug: 'thuiskomst',
    titel: 'Een dagritme opbouwen met je nieuwe asieldier',
    samenvatting: 'Een vast ritme geeft een pas geadopteerd dier rust en voorspelbaarheid. Zo bouw je een dagelijkse routine die werkt voor jullie allebei.',
    bijgewerkt: '2026-07-21',
    coverUrl: '/images/kennisbank/dagritme-opbouwen-nieuw-asieldier.jpg',
    inhoudMd: `Een vast dagritme geeft een nieuw dier houvast. Het schept vertrouwen en vermindert stress. Zo bouw je het op.

## Waarom routine belangrijk is
Dieren leren van patronen. Door elke dag dezelfde volgorde aan te houden, weet je dier wat het kan verwachten. Dat maakt de overgang naar een nieuw thuis een stuk rustiger.

## Ochtendroutine
Begin de dag rustig. Bij honden: uitlaten zodra ze wakker zijn. Bij katten: even de kattenbak verschonen en vers water geven. Daarna ontbijt op een vast tijdstip. Een kwartiertje aandacht of spelen is een fijne start.

## Overdag: rust en regelmaat
Alleen thuis is voor veel dieren wennen. Bouw het op: begin met een uurtje, breid langzaam uit. Laat een kledingstuk met je geur achter, dat werkt geruststellend.

## Avondroutine
Rond etenstijd weer een vast moment. Daarna een rustige wandeling of speelsessie. De avond is voor ontspanning, niet voor nieuwe prikkels. Een vaste slaapplek en bedtijd sluiten de dag af.

## Wanneer kun je het ritme loslaten?
Na een maand of twee, als je dier zich helemaal thuis voelt, kun je soepeler worden met de tijden. Het ritme is dan vanzelfsprekend geworden.`,
  },
  {
    slug: 'gedragsveranderingen-eerste-maand',
    categorieSlug: 'nazorg',
    titel: 'Gedragsveranderingen herkennen in de eerste maand',
    samenvatting: 'Een nieuw thuis is wennen. Welke gedragsveranderingen zijn normaal en wanneer moet je alert zijn? Praktische gids voor de eerste maand van adoptie.',
    bijgewerkt: '2026-07-22',
    coverUrl: '/images/kennisbank/gedragsveranderingen-eerste-maand.jpg',
    inhoudMd: `Gedragsveranderingen in de eerste maand zijn normaal. Dit is wat je kunt verwachten en wanneer je actie moet ondernemen.

## Week 1: verstoppen en observeren
De meeste dieren zijn de eerste dagen stiller en trekken zich terug. Dat is normaal. Geef ze de ruimte en dwing geen contact af. Een eigen veilige plek helpt.

## Week 2: de ware aard komt boven
Na een week beginnen de meeste dieren hun echte persoonlijkheid te tonen. Je ziet speels gedrag, nieuwsgierigheid en voorkeuren ontstaan. Blijf rustig en voorspelbaar.

## Week 3-4: wennen en ontspannen
Rond week drie zie je het dier echt ontspannen. Het herkent de vaste patronen en vertrouwt op de omgeving. Eventueel ongewenst gedrag, zoals blaffen of krabben, kan nu pas echt zichtbaar worden.

## Wanneer schakel je een expert in?
Als het dier na vier weken nog steeds extreem angstig is, niet eet of drinkt, of agressief gedrag vertoont dat escaleert. Raadpleeg dan een gedragsdeskundige of de dierenarts. Het asiel kent het dier en kan ook meedenken.`,
  },
  {
    slug: 'statistieken-asiel-dashboard',
    categorieSlug: 'dashboard',
    titel: 'Statistieken en rapportages in je asiel-dashboard',
    samenvatting: 'Welke cijfers je als asiel in één oogopslag ziet en hoe je ze gebruikt om betere beslissingen te nemen over opname, matching en nazorg.',
    bijgewerkt: '2026-07-23',
    coverUrl: '/images/kennisbank/statistieken-asiel-dashboard.jpg',
    inhoudMd: `Het dashboard geeft je in één oogopslag inzicht in de prestaties van je asiel. Dit zijn de belangrijkste cijfers.

## Adoptiecijfers per maand
Zie hoeveel adopties je per maand hebt afgerond, uitgesplitst naar diersoort. Vergelijk periodes om trends te ontdekken. Dit helpt je om capaciteit en personeel beter te plannen.

## Wachtlijst en doorlooptijd
Hoe lang staan dieren gemiddeld in je asiel voordat ze worden geadopteerd? Het dashboard toont de gemiddelde doorlooptijd per diersoort. Honden hebben vaak een langere doorlooptijd dan katten.

## Retourpercentages bijhouden
Hoeveel adopties worden teruggedraaid? Het dashboard laat het percentage zien per maand en per diersoort. Een stijging is een signaal om je matching of nazorg aan te scherpen.

## Rapportages exporteren en delen
Exporteer je cijfers als PDF of CSV. Deel ze met je bestuur, gemeente of subsidieverstrekker om verantwoording af te leggen over je resultaten.`,
  },
  {
    slug: 'matchkans-asieldier-verbeteren',
    categorieSlug: 'matching',
    titel: 'Hoe verbeter je de matchkans van je asieldier?',
    samenvatting: 'Een volledig en eerlijk profiel is de sleutel tot een goede match. Tips voor asiels om het profiel van een dier te optimaliseren en de matchkans te vergroten.',
    bijgewerkt: '2026-07-24',
    coverUrl: '/images/kennisbank/matchkans-asieldier-verbeteren.jpg',
    inhoudMd: `Hoe vollediger het profiel van een dier, hoe beter de matching werkt. Dit kun je doen om de matchkans te verbeteren.

## Waarom een compleet profiel werkt
Het matchingalgoritme vergelijkt de eigenschappen van het dier met de leefstijl van de adoptant. Een incompleet profiel mist aanknopingspunten en leidt tot minder en minder precieze matches.

## Foto's maken die het gedrag tonen
Laat het dier zien in een rustige, natuurlijke setting. Een foto van een hond die rustig ligt, zegt meer dan een onscherpe kooifoto. Neem meerdere foto's: portret, volledige lichaamshouding en een foto in een huiselijke situatie.

## Gedragskenmerken eerlijk beschrijven
Wees eerlijk over eigenschappen: energiek, rustig, angstig, speels, zelfstandig. Een eerlijk beeld voorkomt dat een adoptant voor verrassingen komt te staan.

## Medische informatie volledig invullen
Vermeld vaccinaties, operaties en chronische aandoeningen. Dit schept vertrouwen en voorkomt dat de adoptie later afketst op medische gronden.

## Veelgestelde vragen over profieloptimalisatie
### Hoeveel foto's zijn optimaal?
Tussen de 3 en 5 foto's geven een goed beeld.
### Moet ik negatieve eigenschappen vermelden?
Ja. Een eerlijk profiel voorkomt teleurstelling en retouren.`,
  },
  {
    slug: 'rechten-adoptanten-avg',
    categorieSlug: 'privacy-avg',
    titel: 'Rechten van adoptanten onder de AVG',
    samenvatting: 'Welke privacyrechten heb je als adoptant? Inzage, correctie, verwijdering en bezwaar. Hoe PootGelukkig en asielen hiermee omgaan.',
    bijgewerkt: '2026-07-25',
    coverUrl: '/images/kennisbank/rechten-adoptanten-avg.jpg',
    inhoudMd: `De AVG geeft je als adoptant duidelijke rechten over je persoonsgegevens. Dit is wat je kunt doen.

## Recht op inzage
Je hebt het recht te weten welke gegevens van jou zijn opgeslagen. Vraag het asiel of PootGelukkig om een overzicht. We verstrekken dit binnen de wettelijke termijn van een maand.

## Recht op correctie
Kloppen je gegevens niet? Je kunt ze laten verbeteren. Denk aan een veranderd adres, telefoonnummer of woonsituatie. Een actueel profiel zorgt voor betere matches.

## Recht op vergetelheid
Wil je niet langer dat je gegevens worden gebruikt? Je kunt verzoeken om verwijdering. Let op: na een afgeronde adoptie bewaren we bepaalde gegevens nog voor wettelijke of administratieve doeleinden.

## Recht op bezwaar
Je kunt bezwaar maken tegen het gebruik van je gegevens voor bepaalde doeleinden. Bij PootGelukkig gebruiken we je gegevens alleen voor matching en adoptie, dus er is weinig om bezwaar op te maken.

## Hoe lang bewaren we je gegevens?
Intakeprofielen zonder adoptie worden na 6 maanden automatisch verwijderd. Na een adoptie worden basisgegevens maximaal 2 jaar bewaard.`,
  },
  {
    slug: 'asiel-aanmelden-pootgelukkig',
    categorieSlug: 'hoe-het-werkt',
    titel: 'Hoe meld je een asiel aan bij PootGelukkig?',
    samenvatting: 'Stappenplan voor asielen die PootGelukkig willen gebruiken. Van registratie tot eerste dieren importeren en de AI-matching activeren.',
    bijgewerkt: '2026-07-26',
    coverUrl: '/images/kennisbank/asiel-aanmelden-pootgelukkig.jpg',
    inhoudMd: `Een asiel aanmelden bij PootGelukkig is eenvoudig. In een paar stappen ben je operationeel.

## 1. Registreer je asiel
Maak een account aan op PootGelukkig met de naam en gegevens van je asiel. Kies de Start-tier (gratis) om te ontdekken of het platform werkt voor jullie situatie.

## 2. Voer je eerste dieren in
Voeg per dier een profiel toe: naam, soort, leeftijd, geslacht en een korte omschrijving. Een foto en gedragskenmerken maken het profiel compleet en verbeteren de matching direct.

## 3. Activeer de AI-matching
Zodra je dieren zijn ingevoerd, wordt de AI-matching automatisch actief. Adoptanten kunnen via het platform matches vinden en aanvragen indienen.

## 4. Nodig medewerkers uit
Voeg collega's toe aan je account zodat meerdere mensen het dashboard kunnen beheren. Elk teamlid krijgt een eigen inlog met de rechten die jij instelt.

## Hoe lang duurt het voordat je aan de slag kunt?
De registratie duurt 5 minuten. Het invoeren van de eerste dieren kost een halfuur tot een uur, afhankelijk van het aantal. Daarna is de matching direct actief.`,
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
