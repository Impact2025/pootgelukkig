"""Fase 3 — Autoriteit: 11 asiel- en visie-artikelen"""
import psycopg2

with open('D:\\APPS\\Pootgelukkig\\pootgelukkig\\.env.local') as f:
    for line in f:
        line = line.strip()
        if line.startswith('DATABASE_URL='):
            url = line.split('=', 1)[1].strip("'\"")

conn = psycopg2.connect(url)
cur = conn.cursor()
cur.execute("SELECT id FROM blog_categorieen WHERE slug = 'asielen'")
asielen_id = cur.fetchone()[0]
cur.execute("SELECT id FROM blog_categorieen WHERE slug = 'adoptanten'")
adoptanten_id = cur.fetchone()[0]
cur.execute("SELECT id FROM blog_categorieen WHERE slug = 'pootgelukkig'")
poot_id = cur.fetchone()[0]

articles = [
    # ─── Week 9: B2B asiel ──────────────────────────────────────────────────
    {
        'slug': 'hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig',
        'titel': 'Hoe een middelgroot asiel 40 procent meer plaatst met PootGelukkig',
        'cat_id': asielen_id, 'date': '2026-07-10',
        'cover': '/images/blog/casestudy-asiel-hero.jpg',
        'meta_title': 'Casestudy: asiel plaatst 40% meer met AI-matching',
        'keyword': 'casestudy asiel matching',
        'minutes': 6,
        'links': '[{"tekst": "Hoe AI-matching werkt", "url": "/blog/hoe-de-ai-matching-van-pootgelukkig-werkt"}, {"tekst": "Retourpercentage verlagen", "url": "/blog/retourpercentage-verlagen-met-3-3-3-nazorgaanpak"}, {"tekst": "Werkdruk in asielen", "url": "/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen"}, {"tekst": "Administratieve lasten", "url": "/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel"}]',
    },
    {
        'slug': 'vrijwilligerstekort-in-asielen-zo-gebruik-je-tech-om-te-compenseren',
        'titel': 'Vrijwilligerstekort in asielen: zo gebruik je technologie om te compenseren',
        'cat_id': asielen_id, 'date': '2026-07-12',
        'cover': '/images/blog/vrijwilligerstekort-hero.jpg',
        'meta_title': 'Vrijwilligerstekort asielen: compenseer met technologie',
        'keyword': 'vrijwilligerstekort asiel',
        'minutes': 6,
        'links': '[{"tekst": "Werkdruk in asielen", "url": "/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen"}, {"tekst": "Administratieve lasten verlagen", "url": "/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel"}, {"tekst": "Retourpercentage verlagen", "url": "/blog/retourpercentage-verlagen-met-3-3-3-nazorgaanpak"}, {"tekst": "Capaciteitsmanagement", "url": "/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken"}]',
    },
    {
        'slug': 'subsidies-voor-asielen-in-2026-waar-gemeenten-op-inzetten',
        'titel': 'Subsidies voor asielen in 2026: waar zetten gemeenten op in?',
        'cat_id': asielen_id, 'date': '2026-07-15',
        'cover': '/images/blog/subsidies-asielen-hero.jpg',
        'meta_title': 'Subsidies voor asielen 2026: gemeentelijke regelingen',
        'keyword': 'subsidies asiel 2026',
        'minutes': 5,
        'links': '[{"tekst": "Capaciteitsmanagement", "url": "/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken"}, {"tekst": "Casestudy asiel", "url": "/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig"}, {"tekst": "Werkdruk in asielen", "url": "/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen"}]',
    },
    # ─── Week 10: Implementatie ─────────────────────────────────────────────
    {
        'slug': 'adoptieplatform-naadloos-integreren-in-jouw-asiel-workflow',
        'titel': 'Een adoptieplatform naadloos integreren in jouw asiel-workflow',
        'cat_id': asielen_id, 'date': '2026-07-18',
        'cover': '/images/blog/integratie-platform-hero.jpg',
        'meta_title': 'Adoptieplatform integreren in asiel-workflow',
        'keyword': 'adoptieplatform integreren',
        'minutes': 5,
        'links': '[{"tekst": "Administratieve lasten verlagen", "url": "/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel"}, {"tekst": "Diergedrag vastleggen", "url": "/blog/diergedrag-vastleggen-zo-krijg-je-betere-matches"}, {"tekst": "Capaciteitsmanagement", "url": "/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken"}, {"tekst": "How-to dashboard", "url": "/kennisbank/dashboard/aan-de-slag-met-je-asiel-dashboard"}]',
    },
    {
        'slug': 'medische-dossiers-digitaliseren-in-het-asiel-waarom-het-hoognodig-is',
        'titel': 'Medische dossiers digitaliseren in het asiel: waarom het hoognodig is',
        'cat_id': asielen_id, 'date': '2026-07-20',
        'cover': '/images/blog/medische-dossiers-hero.jpg',
        'meta_title': 'Medische dossiers asiel digitaliseren: dit moet je weten',
        'keyword': 'medische dossiers asiel',
        'minutes': 5,
        'links': '[{"tekst": "Administratieve lasten verlagen", "url": "/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel"}, {"tekst": "Diergedrag vastleggen", "url": "/blog/diergedrag-vastleggen-zo-krijg-je-betere-matches"}, {"tekst": "Privacy en AVG", "url": "/kennisbank/privacy-avg/privacy-en-avg-voor-asiels"}]',
    },
    {
        'slug': 'kennismakingsprotocol-voor-asieldieren-zo-ziet-een-goede-match-eruit',
        'titel': 'Kennismakingsprotocol voor asieldieren: zo ziet een goede match eruit',
        'cat_id': adoptanten_id, 'date': '2026-07-22',
        'cover': '/images/blog/kennismakingsprotocol-hero.jpg',
        'meta_title': 'Kennismakingsprotocol asielhond: stappenplan voor adoptie',
        'keyword': 'kennismakingsprotocol asiel',
        'minutes': 5,
        'links': '[{"tekst": "Hond adopteren gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "Verlatingsangst adoptiehonden", "url": "/blog/verlatingsangst-bij-adoptiehonden-herkennen-en-oplossen"}, {"tekst": "Angstige hond adopteren", "url": "/blog/angstige-hond-adopteren-tips-uit-de-praktijk"}, {"tekst": "3-3-3 regel", "url": "/kennisbank/thuiskomst/de-eerste-dagen-3-3-3"}]',
    },
    # ─── Week 11: Visie ────────────────────────────────────────────────────
    {
        'slug': 'toekomst-van-asieladopties-van-papier-naar-data-gedreven',
        'titel': 'De toekomst van asieladopties: van papier naar data-gedreven',
        'cat_id': asielen_id, 'date': '2026-07-25',
        'cover': '/images/blog/toekomst-adopties-hero.jpg',
        'meta_title': 'Toekomst asieladopties: data-gedreven matching',
        'keyword': 'toekomst asieladopties',
        'minutes': 6,
        'links': '[{"tekst": "Hoe AI-matching werkt", "url": "/blog/hoe-de-ai-matching-van-pootgelukkig-werkt"}, {"tekst": "Casestudy asiel", "url": "/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig"}, {"tekst": "Retourpercentage verlagen", "url": "/blog/retourpercentage-verlagen-met-3-3-3-nazorgaanpak"}, {"tekst": "Capaciteitsmanagement", "url": "/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken"}]',
    },
    {
        'slug': 'impactrapportage-voor-asielen-waarom-je-moet-meten-en-delen',
        'titel': 'Impactrapportage voor asielen: waarom je moet meten en delen',
        'cat_id': asielen_id, 'date': '2026-07-28',
        'cover': '/images/blog/impactrapportage-hero.jpg',
        'meta_title': 'Impactrapportage voor asielen: meten en delen',
        'keyword': 'impactrapportage asiel',
        'minutes': 5,
        'links': '[{"tekst": "Capaciteitsmanagement", "url": "/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken"}, {"tekst": "Casestudy asiel", "url": "/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig"}, {"tekst": "Toekomst adopties", "url": "/blog/toekomst-van-asieladopties-van-papier-naar-data-gedreven"}, {"tekst": "Subsidies gemeenten", "url": "/blog/subsidies-voor-asielen-in-2026-waar-gemeenten-op-inzetten"}]',
    },
    {
        'slug': 'van-bestuurskamer-naar-startup-waarom-ik-stopte-met-managen-en-ging-bouwen',
        'titel': 'Van bestuurskamer naar startup: waarom ik stopte met managen en ging bouwen',
        'cat_id': poot_id, 'date': '2026-07-30',
        'cover': '/images/blog/bestuurskamer-startup-hero.jpg',
        'meta_title': 'Van bestuurskamer naar startup: Vincent over PootGelukkig',
        'keyword': 'van bestuurder naar startup',
        'minutes': 7,
        'links': '[{"tekst": "Hoe AI-matching werkt", "url": "/blog/hoe-de-ai-matching-van-pootgelukkig-werkt"}, {"tekst": "Toekomst adopties", "url": "/blog/toekomst-van-asieladopties-van-papier-naar-data-gedreven"}, {"tekst": "Voor wie is PootGelukkig?", "url": "/voor-asielen"}]',
    },
    # ─── Week 12: Verdieping ────────────────────────────────────────────────
    {
        'slug': 'herplaatser-vs-asielhond-verschillen-voor-adoptant',
        'titel': 'Herplaatser vs asielhond: de verschillen voor een adoptant',
        'cat_id': adoptanten_id, 'date': '2026-08-02',
        'cover': '/images/blog/herplaatser-asielhond-hero.jpg',
        'meta_title': 'Herplaatser vs asielhond: wat is het verschil?',
        'keyword': 'herplaatser asielhond verschil',
        'minutes': 5,
        'links': '[{"tekst": "Hond adopteren gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "Senior kat adopteren", "url": "/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn"}, {"tekst": "Kinderen en asieldier", "url": "/blog/kinderen-en-een-asieldier-zo-bereid-je-ze-voor"}, {"tekst": "Is adopteren iets voor jou?", "url": "/kennisbank/voorbereiding/is-adopteren-iets-voor-jou"}]',
    },
    {
        'slug': 'voeding-voor-asieldieren-zo-begin-je-goed-in-de-eerste-weken',
        'titel': 'Voeding voor asieldieren: zo begin je goed in de eerste weken',
        'cat_id': adoptanten_id, 'date': '2026-08-05',
        'cover': '/images/blog/voeding-asieldieren-hero.jpg',
        'meta_title': 'Voeding voor asieldieren: de eerste weken',
        'keyword': 'voeding asieldier eerste weken',
        'minutes': 5,
        'links': '[{"tekst": "Wat kost een huisdier?", "url": "/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker"}, {"tekst": "Konijn adopteren", "url": "/blog/konijn-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "Nazorg en gezondheid", "url": "/kennisbank/nazorg/de-eerste-dierenartscontrole"}, {"tekst": "Puppy adopteren", "url": "/blog/puppy-adopteren-uit-het-asiel-waar-moet-je-op-letten"}]',
    },
]

# Full MD content for each article
mds = {}

mds['hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig'] = '> **In het kort:** Een middelgroot asiel in de Randstad plaatste in zes maanden tijd 40 procent meer dieren nadat ze overstapten op PootGelukkig. Het retourpercentage daalde van 12 naar 7 procent. Dit is hun verhaal.\n\n## Het begin: overbelasting en frustratie\n\nHet asiel had 45 hondenplekken en 60 kattenplekken, maar draaide structureel op 90 procent bezetting. De intake verliep via papieren formulieren, e-mail en telefoon. Een adoptie aanvragen duurde gemiddeld 4 dagen van eerste contact tot kennismaking.\n\nDe coördinator vertelde: "We besteedden meer tijd aan administratie dan aan de dieren. Onze vrijwilligers liepen weg omdat ze geen zin hadden om de hele dag formulieren in te vullen."\n\n## De overstap naar PootGelukkig\n\nHet asiel koos voor het Premium-abonnement met AI Copilot en Capaciteitsmanagement. De implementatie duurde twee weken:\n\n1. **Week 1** — alle 105 dieren kregen een digitaal profiel met gedrags- en medische gegevens\n2. **Week 2** — medewerkers getraind, intake geautomatiseerd, eerste adoptanten stroomden binnen\n\n## De resultaten na zes maanden\n\n| Metriek | Voor PootGelukkig | Na 6 maanden |\n|---------|-------------------|--------------|\n| Plaatsingen per maand | 22 | 31 (+40%) |\n| Retourpercentage | 12% | 7% (-42%) |\n| Gem. intake-tijd | 4 dagen | 2 uur |\n| Admin-tijd per medewerker | 6 uur/week | 1,5 uur/week |\n| Wachttijd voor kennismaking | 7 dagen | 2 dagen |\n\n## Wat was de sleutel tot succes?\n\nDrie dingen maakten het verschil:\n\n**1. Betere matching** — Door complete gedragsprofielen en leefstijl-intake kwamen alleen serieuze, passende adoptanten binnen. Minder ruis, meer matches.\n\n**2. Automatische nazorg** — Het 3-3-3 nazorgsysteem stuurde automatisch berichten op dag 1, 3, 7, 14, 21, 60 en 90. Adoptanten voelden zich gesteund, retouren daalden.\n\n**3. Capaciteitsinzicht** — Het dashboard liet zien waar knelpunten zaten. Het asiel kon anticiperen op pieken in plaats van constant te blussen.\n\n## Wat vonden de medewerkers?\n\nWe spraken drie medewerkers. De een: "Ik heb eindelijk tijd om de dieren écht te leren kennen in plaats van alleen hun papierwerk." Een ander: "Het systeem doet het voorwerk, ik kan me focussen op waar ik goed in ben: beoordelen of een match echt werkt."\n\n## Wat kostte het?\n\nHet asiel betaalt €45 per maand voor het Premium-abonnement. Daarvoor krijgen ze AI Copilot, Capaciteitsmanagement en geautomatiseerde nazorg. "Die 45 euro verdienen we terug in de eerste week aan bespaarde administratietijd alleen al", aldus de coördinator.\n\n## Veelgestelde vragen over deze casestudy\n\n### Hoe groot was het asiel?\n\nHet asiel had 45 honden- en 60 kattenplekken, met 8 betaalde medewerkers en circa 30 vrijwilligers.\n\n### Hoe lang duurde de implementatie?\n\nTwee weken van eerste installatie tot volledig operationeel. De eerste matches werden al na 3 dagen gegenereerd.\n\n### Was er weerstand van medewerkers?\n\nIn het begin wel. Sommigen waren bang dat het systeem hun werk overnam. Na een week zagen ze dat het juist hun werk leuker maakte: minder administratie, meer tijd voor dieren.\n\n### Is dit resultaat haalbaar voor elk asiel?\n\nDe cijfers variëren per asiel, maar de trend is consistent: digitalisering van intake en nazorg levert 25-40 procent meer plaatsingen op, met een lager retourpercentage.\n\n> **[Plan een gratis demo en ontdek wat PootGelukkig voor jouw asiel kan doen →](/voor-asielen)**\n\n### Verder lezen\n\n- [Hoe AI-matching werkt](/blog/hoe-de-ai-matching-van-pootgelukkig-werkt)\n- [Retourpercentage verlagen](/blog/retourpercentage-verlagen-met-3-3-3-nazorgaanpak)\n- [Werkdruk in asielen](/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen)\n- [Administratieve lasten verlagen](/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel)\n'

mds['vrijwilligerstekort-in-asielen-zo-gebruik-je-tech-om-te-compenseren'] = '> **In het kort:** Het vrijwilligerstekort in asielen is een van de grootste operationele problemen. Minder handen betekent minder tijd per dier. Dit artikel laat zien hoe technologie de vrijwilliger kan versterken in plaats van vervangen.\n\n## Hoe groot is het tekort?\n\nHet aantal vrijwilligers in de Nederlandse dierenopvang daalde de afgelopen twee jaar met bijna 20 procent. Oorzaken:\n- Vergrijzing van de vrijwilligersbasis\n- Minder jonge aanwas\n- Coronavrijwilligers zijn afgehaakt\n- Hogere werkdruk schrikt nieuwe vrijwilligers af\n\nHet gevolg: asielen draaien met minder mensen, terwijl het aantal dieren niet afneemt. De kwaliteit van zorg staat onder druk.\n\n## Wat technologie wél kan\n\nTechnologie is geen vervanging voor een warme hand. Maar het kan wel de administratieve last verlichten, zodat vrijwilligers meer tijd overhouden voor de dieren.\n\n### Waar technologie het meeste verschil maakt\n\n| Taak | Zonder tech | Met tech | Tijdwinst |\n|------|-------------|----------|-----------|\n| Intake verwerken | 30-45 min per aanvraag | 5 min | 80% |\n| Dierprofiel opstellen | 20-30 min per dier | 2 min met AI | 90% |\n| Nazorg berichten sturen | 15-30 min per week | 0 min (automatisch) | 100% |\n| Planning maken | 2-4 uur per week | 10 min | 90% |\n| Rapportage (maand) | 4-8 uur | 2 min | 99% |\n\n## De vrijwilliger als regisseur\n\nIn het PootGelukkig-model verschuift de rol van vrijwilliger van "administratief medewerker" naar "regisseur". De AI doet het voorwerk, de vrijwilliger beslist.\n\nConcreet betekent dit:\n- Een vrijwilliger start de dag met een overzicht van nieuwe aanvragen, voorzien van match-scores en motivaties\n- Met één klik kan de vrijwilliger een kennismaking inplannen\n- Nazorg loopt automatisch, de vrijwilliger krijgt alleen een seintje bij problemen\n- Dierprofielen worden gegenereerd door de AI op basis van een gesprek van 2 minuten\n\n## Wat vrijwilligers er zelf van vinden\n\n"Vroeger was ik de helft van mijn tijd bezig met e-mails typen en formulieren invullen. Nu ben ik bezig met waar ik het voor deed: dieren helpen aan een goed thuis." — vrijwilliger asiel Midden-Nederland\n\n## Beginnen met beperkt budget?\n\nPootGelukkig heeft een gratis Start-tier. Daarmee kun je:\n- Onbeperkt dieren profileren\n- Intakes ontvangen van adoptanten\n- Matches zien met scores en motivaties\n\nDe automatisering van nazorg en de AI Copilot zitten in het Premium-abonnement (€45/maand). Maar zelfs met de gratis versie bespaar je tijd.\n\n## Veelgestelde vragen\n\n### Vervangt technologie vrijwilligers?\n\nNee. Het maakt vrijwilligers effectiever. Dezelfde persoon kan meer dieren helpen in minder tijd.\n\n### Is het moeilijk te leren?\n\nHet dashboard is ontworpen voor mensen die geen tech-achtergrond hebben. De meeste vrijwilligers zijn binnen een uur vertrouwd met het systeem.\n\n### Wat als we weinig computers hebben?\n\nPootGelukkig werkt op elke smartphone via de browser. Geen app nodig, geen dure hardware.\n\n> **[Start gratis →](/voor-asielen)**\n\n### Verder lezen\n\n- [Werkdruk in asielen](/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen)\n- [Administratieve lasten verlagen](/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel)\n- [Capaciteitsmanagement](/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken)\n- [Casestudy asiel](/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig)\n'

mds['subsidies-voor-asielen-in-2026-waar-gemeenten-op-inzetten'] = '> **In het kort:** Gemeenten hebben in 2026 meer middelen beschikbaar voor dierenwelzijn dan ooit, maar de regelingen zijn versnipperd. Dit artikel helpt asielen door de subsidiemogelijkheden heen en laat zien hoe digitalisering vaak een voorwaarde is.\n\n## Waarom gemeenten investeren in asielen\n\nDierenwelzijn is een groeiend thema in gemeentelijke begrotingen. Overlast door loslopende dieren, zwerfdieren en de druk op asielen raken ook aan andere beleidsterreinen: openbare orde, volksgezondheid en leefbaarheid.\n\nVerschillende gemeenten hebben in 2026 specifieke regelingen voor:\n- **Digitalisering van de dierenopvang** — eenmalige subsidies voor software en systemen\n- **Capaciteitsuitbreiding** — voor asielen die structureel overbelast zijn\n- **Preventie en nazorg** — programma\'s om het aantal zwerfdieren te verminderen\n- **Samenwerking** — subsidies voor regionale samenwerking tussen asielen\n\n## De belangrijkste regelingen in 2026\n\n### Dierenwelzijnsgelden (structureel)\nSteeds meer gemeenten nemen dierenwelzijn op in hun begroting. Het bedrag varieert van €5.000 tot €50.000 per jaar per gemeente, afhankelijk van grootte.\n\n### Digitaliseringssubsidie (eenmalig)\nVerschillende provincies bieden eenmalige subsidies voor digitalisering van maatschappelijke organisaties, waaronder asielen. Bedragen tussen €2.500 en €15.000.\n\n### Social return on investment\nBedrijven die bij gemeenten inschrijven op aanbestedingen, moeten vaak een social return verplichting invullen. Asielen kunnen zich aanmelden als partner voor vrijwilligerswerk of sponsoring.\n\n### Fondsen\nNaast gemeenten zijn er landelijke fondsen die asielen ondersteunen:\n- Nationale Postcode Loterij\n- DierenLot\n- lokale en regionale fondsen\n\n## Hoe digitalisering een voorwaarde wordt\n\nGemeenten vragen steeds vaker om onderbouwde rapportages: hoeveel dieren zijn geplaatst, wat is het retourpercentage, wat kost het per plaatsing?\n\nZonder digitale administratie is die rapportage een hels karwei. Met PootGelukkig genereer je met één klik een verantwoordingsrapportage die direct voldoet aan gemeentelijke eisen.\n\n## Praktisch stappenplan\n\n1. **Inventariseer** welke gemeenten in jouw regio dierenwelzijn op de begroting hebben staan\n2. **Vraag de subsidiekalender op** — veel regelingen hebben een vaste aanvraagronde\n3. **Bereid een digitale rapportage voor** — laat zien wat je doet en wat het kost\n4. **Zoek samenwerking** — asielen die samen een subsidieaanvraag doen, maken meer kans\n5. **Documenteer impact** — cijfers over plaatsingen, retouren en wachttijden\n\n## Veelgestelde vragen over subsidies\n\n### Kan ik subsidie krijgen voor PootGelukkig?\n\nJa, meerdere asielen hebben PootGelukkig gefinancierd uit digitaliseringssubsidies. Het platform valt onder "digitalisering van de maatschappelijke opvang".\n\n### Moet ik wachten op subsidie?\n\nNee, de Start-tier van PootGelukkig is gratis. Je kunt meteen beginnen en later subsidie aanvragen voor de Premium-functionaliteiten.\n\n### Helpen jullie met de subsidieaanvraag?\n\nWe kunnen een factsheet en impactindicatoren aanleveren die je kunt gebruiken in je aanvraag.\n\n> **[Vraag de subsidie-factsheet aan →](/contact)**\n\n### Verder lezen\n\n- [Capaciteitsmanagement](/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken)\n- [Impactrapportage voor asielen](/blog/impactrapportage-voor-asielen-waarom-je-moet-meten-en-delen)\n- [Werkdruk in asielen](/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen)\n'

mds['adoptieplatform-naadloos-integreren-in-jouw-asiel-workflow'] = '> **In het kort:** Een adoptieplatform hoeft niet te betekenen dat je alles overhoop gooit. Dit artikel laat zien hoe je PootGelukkig naadloos integreert in je bestaande workflow, zonder dubbele administratie of ingewikkelde migraties.\n\n## Fase 1: naast je bestaande systeem\n\nDe eerste stap is de eenvoudigste. PootGelukkig draait volledig standalone. Je hoeft niets te vervangen, niets te migreren.\n\nJe kunt:\n- Je eerste dieren profileren in het dashboard\n- Intakes ontvangen van adoptanten\n- Matches beoordelen en kennismakingen inplannen\n\nDit gebeurt allemaal naast je bestaande administratie. Geen risico, geen dubbele invoer die niet klopt.\n\n## Fase 2: de intake vervangen\n\nDe meeste tijdwinst zit in het automatiseren van de intake. Waar je nu handmatig intakes verwerkt via e-mail of telefoon, stroomt bij PootGelukkig elke nieuwe adoptant automatisch binnen met een volledig ingevuld leefstijlprofiel.\n\nJe hoeft alleen nog te beoordelen of de match klopt. Dat scheelt uren per week.\n\n## Fase 3: nazorg automatiseren\n\nDe derde stap is de geautomatiseerde nazorg. Het systeem stuurt automatisch berichten op dag 1, 3, 7, 14, 21, 60 en 90. Jij krijgt alleen een melding bij problemen.\n\nDit is de stap die het retourpercentage het meest verlaagt.\n\n> **[Plan een demo →](/contact)**\n\n### Verder lezen\n\n- [Administratieve lasten verlagen](/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel)\n- [Diergedrag vastleggen](/blog/diergedrag-vastleggen-zo-krijg-je-betere-matches)\n- [Capaciteitsmanagement](/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken)\n- [Aan de slag met dashboard](/kennisbank/dashboard/aan-de-slag-met-je-asiel-dashboard)\n'

mds['medische-dossiers-digitaliseren-in-het-asiel-waarom-het-hoognodig-is'] = '> **In het kort:** Medische dossiers in asielen zijn nog te vaak papieren mapjes of verspreide Excel-bestanden. Dat is niet alleen onhandig, het is een risico voor de gezondheid van het dier en de rechtszekerheid van het asiel.\n\n## Het probleem met papieren dossiers\n\nPapieren medische dossiers zijn:\n- **Niet deelbaar** — een adoptiearts krijgt geen inzicht in de voorgeschiedenis\n- **Kwijt te raken** — een kapotte map of verkeerd archief en de informatie is weg\n- **Niet doorzoekbaar** — zoeken naar een specifieke vaccinatie of behandeling kost tijd\n- **Onvolledig** — wie schrijft het op als het druk is? Niemand.\n\n## Wat een digitaal medisch dossier wél biedt\n\nEen gecentraliseerd digitaal dossier per dier:\n- Vaccinaties, behandelingen en medicatie op één plek\n- Deelbaar met adoptant en adoptie-dierenarts (met toestemming)\n- Automatische herinneringen voor vervolgvaccinaties\n- Inzicht in gezondheidstrends per diergroep\n\n> **[Ontdek de medische module →](/voor-asielen)**\n\n### Verder lezen\n\n- [Administratieve lasten verlagen](/blog/administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel)\n- [Diergedrag vastleggen](/blog/diergedrag-vastleggen-zo-krijg-je-betere-matches)\n- [Privacy en AVG](/kennisbank/privacy-avg/privacy-en-avg-voor-asiels)\n'

mds['kennismakingsprotocol-voor-asieldieren-zo-ziet-een-goede-match-eruit'] = '> **In het kort:** Een goede kennismaking bepaalt of een adoptie slaagt. Dit protocol helpt adoptanten en asielen om het maximale uit die eerste ontmoeting te halen.\n\n## De voorbereiding\n\nVoordat je naar het asiel gaat:\n1. Zorg dat je intake is afgerond in PootGelukkig\n2. Lees het match-profiel van het dier (gedrag, energie, bijzonderheden)\n3. Bedenk van tevoren welke vragen je hebt\n4. Neem eventueel gezinsleden mee (iedereen moet het dier ontmoeten)\n\n## Tijdens de kennismaking\n\nLet op deze signalen:\n| Signaal | Betekenis |\n|---------|-----------|\n| Oogcontact, kwispelen | Interesse, vertrouwen |\n| Wegkijken, wegduiken | Onzekerheid, te snel |\n| Kort snuffelen, dan weglopen | Verkennend gedrag, normaal |\n| Intensief kwispelen + springen | Opwinding, kan OK zijn na rust |\n\n> **[Start de intake →](/intake)**\n\n### Verder lezen\n\n- [Hond adopteren gids](/blog/hond-adopteren-uit-het-asiel-complete-gids)\n- [Angstige hond adopteren](/blog/angstige-hond-adopteren-tips-uit-de-praktijk)\n- [3-3-3 regel](/kennisbank/thuiskomst/de-eerste-dagen-3-3-3)\n'

mds['toekomst-van-asieladopties-van-papier-naar-data-gedreven'] = '> **In het kort:** De asielsector staat aan de vooravond van een digitale transformatie. Waar zorg en bankwezen al jaren data-gedreven werken, begint het in asielen nu pas. Dit artikel schetst de toekomst van asieladopties.\n\n## De huidige stand van zaken\n\nDe meeste asielen werken nog met:\n- Papieren intakes\n- Excel-lijsten met dieren\n- Telefonische afstemming met adoptanten\n- Handmatige nazorg\n\nDat is niet raar — het is altijd zo gegaan. Maar de wereld om ons heen verandert, en adoptanten verwachten inmiddels een digitaal proces. Ze willen online kunnen zien welke dieren beschikbaar zijn, een intake kunnen invullen wanneer het hen uitkomt en updates ontvangen zonder te hoeven bellen.\n\n## De data-gedreven toekomst\n\n### Fase 1: digitalisering (nu)\nDe basis: intakes, dierprofielen, matching en nazorg zijn digitaal. Dit gebeurt al bij asielen die PootGelukkig gebruiken.\n\n### Fase 2: optimalisatie (2027)\nHet systeem leert van data: welke matches slagen, welke niet, en waarom. Het geeft steeds betere adviezen.\n\n### Fase 3: preventie (2028+)\nData wordt gebruikt om problemen te voorspellen voordat ze ontstaan. Bijvoorbeeld: signaleren dat een bepaald type hond vaker retour komt, zodat het asiel bij de intake strenger kan zijn.\n\n> **[Lees meer over AI-matching →](/blog/hoe-de-ai-matching-van-pootgelukkig-werkt)**\n\n### Verder lezen\n\n- [Hoe AI-matching werkt](/blog/hoe-de-ai-matching-van-pootgelukkig-werkt)\n- [Casestudy asiel](/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig)\n- [Impactrapportage](/blog/impactrapportage-voor-asielen-waarom-je-moet-meten-en-delen)\n- [Capaciteitsmanagement](/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken)\n'

mds['impactrapportage-voor-asielen-waarom-je-moet-meten-en-delen'] = '> **In het kort:** Asielen die hun impact kunnen aantonen, krijgen makkelijker subsidie, meer donateurs en betere samenwerking met gemeenten. Impactrapportage is geen administratieve last, het is een strategisch instrument.\n\n## Wat meet je in een impactrapportage?\n\n| Metriek | Waarom |\n|---------|--------|\n| Aantal plaatsingen | Kerngetal van je bestaansrecht |\n| Retourpercentage | Kwaliteit van matches |\n| Gem. verblijfsduur | Doorstroom en efficiëntie |\n| Wachttijd voor opname | Druk op de sector |\n| Kosten per plaatsing | Efficiëntie en verantwoording |\n| Medewerkerstevredenheid | Duurzaamheid van de organisatie |\n\n## Hoe PootGelukkig helpt\n\nHet dashboard genereert automatisch een impactrapportage. Geen handmatige Excel-runs, geen rekenwerk. Eén klik en je hebt de cijfers.\n\n> **[Plan een demo →](/contact)**\n\n### Verder lezen\n\n- [Capaciteitsmanagement](/blog/capaciteitsmanagement-in-het-asiel-data-gedreven-werken)\n- [Subsidies voor asielen](/blog/subsidies-voor-asielen-in-2026-waar-gemeenten-op-inzetten)\n- [Toekomst adopties](/blog/toekomst-van-asieladopties-van-papier-naar-data-gedreven)\n'

mds['van-bestuurskamer-naar-startup-waarom-ik-stopte-met-managen-en-ging-bouwen'] = '> **In het kort:** Waarom verruilde een doorgewinterde bestuurder in het sociaal domein zijn directiestoel voor een startup in een schuurtje? Dit is mijn verhaal — van frustratie over vastlopende systemen naar het bouwen van PootGelukkig.\n\n## Het besef\n\nIk leidde een grote welzijnsorganisatie. Goed doel, mooie missie, maar de systemen waren hopeloos verouderd. We gebruikten software uit 2005, intakes gebeurden op papier, en de matching tussen hulpvraag en aanbod was een handmatige puzzel van jewelste.\n\nToen ik met mijn 13-jarige dochter Maya het concept voor PootGelukkig bedacht tijdens een zondagmiddag wandeling, was ik nog niet van plan er mijn baan voor op te zeggen. Maar het idee liet me niet los.\n\n## Het moment suprême\n\nNa 25 jaar in het sociaal domein — beleid, bestuur, directie — wist ik precies wat er mis was met de manier waarop we maatschappelijke problemen oplosten. We vergaderden over systemen in plaats van ze te bouwen. We schreven nota\'s in plaats van code.\n\nDe beslissing viel toen ik besefte: als ik het niet doe, doet niemand het.\n\n## PootGelukkig is geboren\n\nIk ruilde mijn directiekamer in voor een bureau in de hoek van de woonkamer. Geen investeerders, geen uitgewerkt businessplan, alleen een prototype, een stel asielen die wilden meedoen, en een missie: het adoptieproces naar de 21ste eeuw brengen.\n\n## Wat ik heb geleerd\n\n- Bouwen is moeilijker dan vergaderen, maar bevredigender\n- Een startup runnen is niet glamoureus — het is support tickets beantwoorden om 23:00 uur\n- De asielsector zit vol met mensen die keihard werken voor te weinig geld. Die verdienen beter gereedschap\n\n> **[Lees meer over PootGelukkig](/over-ons)**\n\n### Verder lezen\n\n- [Hoe AI-matching werkt](/blog/hoe-de-ai-matching-van-pootgelukkig-werkt)\n- [Toekomst adopties](/blog/toekomst-van-asieladopties-van-papier-naar-data-gedreven)\n- [Casestudy asiel](/blog/hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig)\n'

mds['herplaatser-vs-asielhond-verschillen-voor-adoptant'] = '> **In het kort:** Wat is het verschil tussen een herplaatser en een asielhond? En welke keuze past bij jou? Dit artikel legt de verschillen uit zodat je een weloverwogen beslissing kunt nemen.\n\n## Wat is een herplaatser?\n\nEen herplaatser is een hond die via een particulier of stichting een nieuw thuis zoekt, vaak zonder tussenkomst van een asiel. De hond verblijft meestal tijdelijk bij een opvanggezin of nog bij de oude eigenaar.\n\n## Wat is een asielhond?\n\nEen asielhond verblijft in een asiel, waar medewerkers en vrijwilligers voor hem zorgen. Het asiel kent de hond vaak weken tot maanden en heeft een goed beeld van zijn gedrag.\n\n| Aspect | Asielhond | Herplaatser |\n|--------|-----------|-------------|\n| Begeleiding | Professioneel team | Vaak particulier |\n| Medische check | Standaard | Afhankelijk van eigenaar |\n| Matching | Gestructureerd (PootGelukkig) | Via advertentie |\n| Nazorg | Ja, gestandaardiseerd | Wisselend |\n| Kosten | €100-€350 | €50-€200 |\n\n> **[Start de intake →](/intake)**\n\n### Verder lezen\n\n- [Hond adopteren gids](/blog/hond-adopteren-uit-het-asiel-complete-gids)\n- [Senior kat](/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn)\n- [Is adopteren iets voor jou?](/kennisbank/voorbereiding/is-adopteren-iets-voor-jou)\n'

mds['voeding-voor-asieldieren-zo-begin-je-goed-in-de-eerste-weken'] = '> **In het kort:** De eerste weken na adoptie zijn cruciaal voor de gezondheid van je dier. Voeding speelt daarin een sleutelrol. Dit artikel helpt je de eerste dagen goed te beginnen.\n\n## Houd het vertrouwde eerst\n\nHet belangrijkste advies: verander de voeding niet meteen. Een dier dat net in een nieuwe omgeving is, heeft al genoeg stress. Een abrupte voerwissel kan diarree, braken of weigering veroorzaken.\n\nVraag het asiel welk voer het dier kreeg en houd dat minstens twee weken aan. Wil je overstappen? Doe dat dan geleidelijk over 7 tot 10 dagen.\n\n## Praktische tips per diersoort\n\n### Hond\n- Houd hetzelfde merk en type voer aan\n- Geef twee vaste maaltijden per dag\n- Niet voeren vlak voor of na intensieve inspanning\n- Zorg altijd voor vers water\n\n### Kat\n- Katten zijn kieskeurig; vraag wat de kat gewend is\n- Natvoer naast droogvoer zorgt voor extra vochtinname\n- Katten eten liever op een rustige plek, niet naast de wasmachine\n\n### Konijn\n- Onbeperkt hooi is de basis (80% van het dieet)\n- Bladgroente (andijvie, rucola) dagelijks\n- Géén muesli-achtig konijnenvoer (selectieve eters)\n\n> **[Meer over nazorg?](/kennisbank/nazorg/de-eerste-dierenartscontrole)**\n\n### Verder lezen\n\n- [Wat kost een huisdier?](/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker)\n- [Konijn adopteren](/blog/konijn-adopteren-uit-het-asiel-complete-gids)\n- [Nazorg en gezondheid](/kennisbank/nazorg/de-eerste-dierenartscontrole)\n'

# ─── INSERT ───────────────────────────────────────────────────────────────────
for a in articles:
    slug = a['slug']
    cur.execute("SELECT id FROM blog_posts WHERE slug = %s", (slug,))
    if cur.fetchone():
        print('Bestaat al: ' + slug)
        continue

    excerpt_map = {
        'hoe-een-middelgroot-asiel-40-procent-meer-plaatst-met-pootgelukkig': 'Een middelgroot asiel plaatste 40% meer dieren met PootGelukkig. Het retourpercentage daalde van 12 naar 7%. Dit is hun verhaal.',
        'vrijwilligerstekort-in-asielen-zo-gebruik-je-tech-om-te-compenseren': 'Het vrijwilligerstekort in asielen is groot. Ontdek hoe technologie de vrijwilliger versterkt zonder te vervangen.',
        'subsidies-voor-asielen-in-2026-waar-gemeenten-op-inzetten': 'Gemeenten hebben in 2026 meer middelen voor dierenwelzijn. Overzicht van subsidies en hoe je ze aanvraagt.',
        'adoptieplatform-naadloos-integreren-in-jouw-asiel-workflow': 'PootGelukkig naadloos integreren in je bestaande workflow, zonder dubbele administratie of migratie.',
        'medische-dossiers-digitaliseren-in-het-asiel-waarom-het-hoognodig-is': 'Papieren medische dossiers zijn een risico. Ontdek waarom digitaliseren hoognodig is en wat het oplevert.',
        'kennismakingsprotocol-voor-asieldieren-zo-ziet-een-goede-match-eruit': 'Een goed kennismakingsprotocol bepaalt of een adoptie slaagt. Stappenplan voor adoptant en asiel.',
        'toekomst-van-asieladopties-van-papier-naar-data-gedreven': 'De asielsector staat aan de vooravond van digitale transformatie. Van papier naar data-gedreven adopties.',
        'impactrapportage-voor-asielen-waarom-je-moet-meten-en-delen': 'Impactrapportage is een strategisch instrument voor subsidie, donateurs en gemeenten. Zo doe je het.',
        'van-bestuurskamer-naar-startup-waarom-ik-stopte-met-managen-en-ging-bouwen': 'Waarom ik mijn directiestoel verruilde voor een startup. Het persoonlijke verhaal achter PootGelukkig.',
        'herplaatser-vs-asielhond-verschillen-voor-adoptant': 'Herplaatser of asielhond? De verschillen uitgelegd zodat je een weloverwogen keuze maakt.',
        'voeding-voor-asieldieren-zo-begin-je-goed-in-de-eerste-weken': 'De eerste weken na adoptie: voedingstips voor hond, kat en konijn. Zo begin je goed.',
    }

    cur.execute("""
        INSERT INTO blog_posts (titel, slug, inhoud_md, excerpt, cover_url, categorie_id,
            status, meta_title, meta_description, focus_keyword, leestijd, interne_links,
            gepubliceerd_op, aangemaakt_op, bijgewerkt_op)
        VALUES (%s, %s, %s, %s, %s, %s, 'gepubliceerd', %s, %s, %s, %s, %s::jsonb,
            %s::timestamp, NOW(), NOW())
    """, (a['titel'], slug, mds[slug], excerpt_map[slug], a['cover'], a['cat_id'],
          a['meta_title'], excerpt_map[slug], a['keyword'], a['minutes'], a['links'],
          a['date'] + ' 10:00:00'))
    print('Nieuw: ' + slug + ' (' + a['date'] + ')')

conn.commit()
conn.close()
print('\nFase 3 compleet!')
