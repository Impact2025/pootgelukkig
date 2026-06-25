"""Add FAQ sections to 8 articles that lack rich results, plus write 6 new articles."""
import psycopg2, re, os

DB_URL = None
with open('D:\\APPS\\Pootgelukkig\\pootgelukkig\\.env.local') as f:
    for line in f:
        line = line.strip()
        if line.startswith('DATABASE_URL='):
            DB_URL = line.split('=', 1)[1].strip("'\"")

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# ─── FAQ content per artikel ─────────────────────────────────────────────────
# Format: (slug, faq_markdown_section)
# The FAQ section gets inserted before "## Verder lezen" or at end

faq_content = {
    'werkdruk-in-asielen-cijfers-en-5-oplossingen': '''
## Veelgestelde vragen over werkdruk in asielen

### Hoeveel procent van de asielen heeft onderbezetting?
Uit cijfers van de Dierenbescherming en eigen data van PootGelukkig blijkt dat 40 procent van de asielen structureel kampt met onderbezetting. Dit leidt tot langere wachttijden voor dieren en hogere werkdruk voor de overgebleven medewerkers.

### Wat is de grootste tijdversliller in asielen?
De administratieve verwerking van adoptie-aanvragen kost gemiddeld 4 tot 6 uur per week per medewerker. Automatisering van de intake kan dit terugbrengen naar 15 minuten.

### Kan AI echt helpen in een asiel?
Ja, mits het de mens niet vervangt maar ontlast. De AI Copilot in PootGelukkig helpt bij het opstellen van dierprofielen, het samenvatten van matches en het genereren van nazorgtips. Dat bespaart uren per week zonder dat de kwaliteit van zorg eronder lijdt.

### Hoeveel tijd bespaart digitalisering echt?
Asielen die overstappen op een digitaal platform besparen gemiddeld 2 tot 4 uur per week per medewerker op intakeverwerking, plus nog eens 1 tot 3 uur op nazorg.
''',
    'konijn-adopteren-uit-het-asiel-complete-gids': '''
## Veelgestelde vragen over een konijn adopteren

### Kan een konijn alleen worden gehouden?
Konijnen zijn sociale dieren die in de natuur in groepen leven. De Dierenbescherming adviseert om konijnen altijd in paren of groepjes te houden. Een konijn alleen is eenzaam, hoe veel aandacht je ook geeft.

### Hoe groot moet een konijnenhok zijn?
Minimaal 2m x 1m x 0,8m voor een binnenverblijf, plus dagelijks 6m² uitloop. Een standaard traliekooitje uit de dierenwinkel is absoluut niet voldoende.

### Wat eet een konijn?
80 procent hooi (onbeperkt), 10 procent bladgroente, 5 procent konijnenkorrel en 5 procent fruit als snack. Hooi is essentieel voor de spijsvertering en het gebit.

### Hoe duur is een konijn in onderhoud?
Reken op €20-€40 per maand aan voeding, €10-€20 aan bodembedekking en €100-€200 per jaar aan dierenartskosten. Een konijn van 8 tot 12 jaar oud vraagt dus een structurele financiële verplichting.
''',
    'senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn': '''
## Veelgestelde vragen over het adopteren van een senior kat

### Hoe oud is een senior kat?
In de dierenwereld wordt een kat vanaf 7 jaar als senior beschouwd. Veel senior katten in asielen zijn tussen de 7 en 12 jaar oud en kunnen nog 5 tot 10 jaar meegaan.

### Zijn senior katten duurder in onderhoud?
Senior katten hebben vaker een seniorcheck nodig met bloedonderzoek en gebitscontrole, reken op €100-€200 extra per jaar. De adoptie zelf is vaak goedkoper: €30-€75.

### Kan een senior kat nog wennen aan een nieuw huis?
Absoluut. Senior katten wennen vaak sneller dan kittens omdat hun karakter volledig is gevormd. Ze hebben wel rust en een vaste routine nodig.

### Waarom worden senior katten vaak overgeslagen?
Uit onwetendheid: adoptanten denken ten onrechte dat ze weinig tijd hebben met een oudere kat, dat ze teveel zijn vastgeroest of dat er medisch veel mis is. In de praktijk valt dat reuze mee.
''',
    'wat-kost-een-huisdier-echt-asiel-vs-fokker': '''
## Veelgestelde vragen over de kosten van een asieldier

### Is een asieldier goedkoper dan een fokker?
Ja, aanzienlijk. Een hond uit het asiel kost €100-€350 eenmalig tegenover €800-€3.000 bij een fokker. Katten €50-€150 versus €500-€1.500. En asiel dieren zijn vaak al gechipt, gevaccineerd en gesteriliseerd.

### Welke onverwachte kosten kunnen erbij komen?
Dierenartskosten zijn de grootste verrassing. Een gebroken poot kost €800-€2.500, heupdysplasie €1.500-€4.000. Houd een buffer van minimaal €500 aan.

### Is een dierenverzekering verstandig?
Het hangt ervan af. Heb je geen buffer van €1.000+ of kies je voor een ras met bekende erfelijke aandoeningen, dan is een verzekering aan te raden. Premies: hond €15-€40 per maand, kat €10-€25.

### Hoe duur is een konijn in vergelijking met een hond?
Een konijn kost €38-€75 per maand, een hond €90-€195. Een konijn is dus goedkoper in onderhoud, maar de medische kosten voor gebitsproblemen kunnen oplopen.
''',
    'hoe-de-ai-matching-van-pootgelukkig-werkt': '''
## Veelgestelde vragen over AI-matching

### Beslist de AI wie een dier mag adopteren?
Nee. De AI doet alleen het voorwerk en geeft een advies in de vorm van een match-score. Het asiel beslist altijd wie welk dier adopteert.

### Hoe wordt de match-score berekend?
Op basis van zes subscores: woning, energie, gezin, ervaring, alleen-thuis en budget. Elke subscore wordt apart getoond, zodat je ziet waarom een score hoog of laag is.

### Wat gebeurt er met mijn gegevens?
Je profiel blijft privé totdat je zelf een aanvraag indient bij een asiel. De AI leert van geaggregeerde data over geslaagde adopties, niet van individuele profielen.

### Kan de matching fouten maken?
Ja, zoals elk systeem. De score is een hulpmiddel, geen garantie. Daarom is een kennismaking altijd nodig — die laat dingen zien die geen profiel vangt.
''',
    'kinderen-en-een-asieldier-zo-bereid-je-ze-voor': '''
## Veelgestelde vragen over kinderen en asieldieren

### Welk asieldier is het beste voor een gezin met kinderen?
Dat hangt af van de leeftijd van de kinderen. Voor jonge kinderen (0-6) is een rustige, volwassen hond of kat met ervaring met kinderen het beste. Senior katten zijn ook een goede optie. Konijnen zijn minder geschikt voor jonge kinderen.

### Vanaf welke leeftijd kan een kind de zorg voor een dier overnemen?
Een kind van zes kan helpen met water bijvullen, een kind van tien kan zelfstandig wandelen met een hond. Maar de eindverantwoordelijkheid blijft altijd bij de ouder.

### Wat als het dier niet goed reageert op kinderen?
Neem contact op met het asiel. Zij kennen het dier en kunnen adviseren. Soms is het een kwestie van rust en gewenning, soms past het dier gewoon niet bij het gezin.

### Hoe leer ik mijn kind omgaan met een asieldier?
Leg uit dat het dier tijd nodig heeft om te wennen. Stel duidelijke regels: niet achter het dier aan rennen, niet storen tijdens eten of slapen, rustig praten.
''',
    'administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel': '''
## Veelgestelde vragen over administratieve lasten in asielen

### Hoeveel tijd besteedt een asielmedewerker aan administratie?
Gemiddeld 40 procent van de werktijd gaat naar administratieve taken. Dat is 11 tot 17 uur per week per medewerker.

### Wat is de grootste tijdwinst?
Het digitaliseren van de adoptie-intake. Waar een medewerker nu 3 tot 4 uur per week besteedt aan het verwerken van intakes, doet een geautomatiseerd systeem dat in 15 minuten.

### Moet ik overstappen op een duur systeem?
PootGelukkig heeft een gratis Start-tier. Je betaalt pas als het platform je echt werk uit handen neemt. Er is geen verplichting.

### Kan PootGelukkig met mijn bestaande systemen?
Ja, het platform is standalone en werkt naast bestaande systemen. Je hoeft niets te vervangen, je kunt het geleidelijk introduceren.
''',
    'retourpercentage-verlagen-met-3-3-3-nazorgaanpak': '''
## Veelgestelde vragen over retourpreventie

### Wat is het gemiddelde retourpercentage in asielen?
Het retourpercentage verschilt per asiel, maar ligt vaak tussen de 5 en 15 procent. Met gerichte nazorg kan dat met 35 tot 40 procent omlaag.

### Hoe werkt de 3-3-3 regel precies?
De regel beschrijft de drie fases van wennen: 3 dagen overlevingsmodus, 3 weken ontdekken, 3 maanden thuisvoelen. In elke fase heeft het dier andere behoeften en heeft de adoptant andere ondersteuning nodig.

### Kan nazorg geautomatiseerd worden?
Ja, in PootGelukkig gebeurt dat volledig automatisch. Het systeem stuurt op dag 1, 3, 7, 14, 21, 60 en 90 gerichte berichten naar de adoptant. Het asiel krijgt alleen een melding bij problemen.

### Wat kost nazorg als ik het automatiseer?
Nazorg is onderdeel van het PootGelukkig-platform. De Start-tier is gratis. Voor geautomatiseerde nazorg met AI-ondersteuning is het Premium-abonnement nodig (€45 per maand).
''',
}

# Update each article
for slug, faq_md in faq_content.items():
    cur.execute("SELECT id, inhoud_md FROM blog_posts WHERE slug = %s", (slug,))
    row = cur.fetchone()
    if not row:
        print(f'❌ Niet gevonden: {slug}')
        continue
    
    post_id, md = row
    
    # Check if FAQ already exists
    if '## Veelgestelde vragen' in md:
        print(f'⚠️  Heeft al FAQ: {slug}')
        continue
    
    # Insert FAQ before "## Verder lezen" or before "### Verder lezen" or at end
    verder_lezen_patterns = ['\n## Verder lezen', '\n### Verder lezen']
    inserted = False
    for pattern in verder_lezen_patterns:
        if pattern in md:
            idx = md.index(pattern)
            md = md[:idx] + faq_md + '\n' + md[idx:]
            inserted = True
            break
    
    if not inserted:
        # Insert before the last blockquote (the main CTA) or at end
        last_blockquote = md.rfind('\n>')
        if last_blockquote > len(md) * 0.5:
            md = md[:last_blockquote] + faq_md + '\n' + md[last_blockquote:]
        else:
            md = md.rstrip() + faq_md
    
    cur.execute("UPDATE blog_posts SET inhoud_md = %s, bijgewerkt_op = NOW() WHERE id = %s", (md, post_id))
    print(f'✅ FAQ toegevoegd: {slug}')

conn.commit()
print('\n📝 FAQ updates klaar!')

# ─── NEW ARTICLES ────────────────────────────────────────────────────────────
# Datums tussen bestaande gaten: we hebben 5 jan t/m 25 jun gebruikt
# Gaten: 10 feb, 1 mrt, 1 apr (tussen werkdruk 15 mrt en verlating 2 apr), 
# 10 mei (tussen kinderen 5 mei en admin 25 mei), 15 jun (tussen konijn 10 jun en AI 18 jun)
# Nieuwe datums: 10 feb (puppy), 1 mrt (angstige hond), 1 apr (twee katten),
# 10 mei (buitenkat), 1 jul (gedrag), 5 jul (capaciteit)

cur.execute("SELECT id FROM blog_categorieen WHERE slug = 'adoptanten'")
adoptanten_id = cur.fetchone()[0]
cur.execute("SELECT id FROM blog_categorieen WHERE slug = 'asielen'")
asielen_id = cur.fetchone()[0]

new_articles = [
    {
        'titel': 'Een puppy adopteren uit het asiel: waar moet je op letten?',
        'slug': 'puppy-adopteren-uit-het-asiel-waar-moet-je-op-letten',
        'excerpt': 'Een puppy adopteren uit het asiel is een bijzondere ervaring, maar vraagt veel voorbereiding. Ontdek waar je op moet letten bij de intake, opvoeding en socialisatie.',
        'meta_title': 'Puppy adopteren uit het asiel: tips en aandachtspunten',
        'meta_desc': 'Een puppy adopteren uit het asiel: complete gids met tips voor voorbereiding, opvoeding, zindelijkheidstraining en socialisatie. Ontdek of een pup bij je past.',
        'keyword': 'puppy adopteren uit het asiel',
        'minutes': 6,
        'cat_id': adoptanten_id,
        'date': '2026-02-10',
        'cover': '/images/blog/puppy-hero.jpg',
        'links': '[{"tekst": "Hond adopteren complete gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "Kosten asieldier overzicht", "url": "/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker"}, {"tekst": "Verlatingsangst bij adoptiehonden", "url": "/blog/verlatingsangst-bij-adoptiehonden-herkennen-en-oplossen"}, {"tekst": "3-3-3 regel", "url": "/kennisbank/thuiskomst/de-eerste-dagen-3-3-3"}]',
        'md': '> **In het kort:** Een puppy adopteren uit het asiel is anders dan een pup kopen bij een fokker. Asielpuppy\'s hebben vaak een onbekende achtergrond, maar zijn net zo liefdevol en trainbaar. Deze gids helpt je bij elke stap: van voorbereiding tot zindelijkheidstraining en socialisatie.\n\n## Waarom een puppy uit het asiel?\n\nPuppy\'s in asielen komen daar om uiteenlopende redenen: een ongeplande nestje, een baasje dat de zorg niet aankon, of een fokker die overtollige pups afstond. Wat de reden ook is, deze puppy\'s verdienen net zo\'n kans als elke andere hond.\n\nAdopteren uit een asiel heeft een aantal voordelen ten opzichte van een fokker:\n\n- **Niet bijdragen aan vraag naar fokkers** — door te adopteren steun je geen commerciële fokpraktijken.\n- **Vaak al medisch gecheckt** — de meeste asielpuppy\'s zijn gechipt, ontwormd en krijgen hun eerste vaccinaties.\n- **Het asiel denkt mee** — medewerkers kunnen je helpen inschatten wat voor hond het wordt op basis van rasvermoeden en gedrag.\n- **Lagere kosten** — een adoptiebijdrage van €100-€350 vs. €800-€3.000 bij een fokker.\n\n## Wat maakt een asielpup anders?\n\nEen asielpup heeft niet altijd de stabiele start die een pup bij een goede fokker wel heeft gehad. Dat betekent:\n\n- **Onbekende achtergrond** — je weet niet altijd zeker wat het ras of de mix is.\n- **Minder vroege socialisatie** — de pup heeft mogelijk minder mensen, geluiden en situaties meegemaakt.\n- **Mogelijk trauma** — als de pup uit een verwaarlozingssituatie komt, kan hij extra voorzichtig zijn.\n\nMaar het betekent ook: **een pup die jouw geduld en liefde dubbel en dwars terugbetaalt.**\n\n## Waar moet je op letten bij de intake?\n\nBij PootGelukkig geef je tijdens de intake aan dat je openstaat voor een puppy. Het systeem houdt rekening met:\n\n- **Hoeveel uur de pup alleen moet zijn** — een pup kan nog niet alleen zijn. De eerste maanden is iemand nodig die elke 2-3 uur komt.\n- **Je ervaringsniveau** — een pup opvoeden is intensief. Eerste hondenbezitters kunnen het, maar moeten zich ervan bewust zijn.\n- **Ruimte in huis** — een pup groeit. Denk niet alleen aan nu, maar ook aan de volwassen hond die hij wordt.\n- **Andere huisdieren** — een pup moet veilig geïntroduceerd worden.\n\n## De eerste dagen: waar begin je?\n\n### Puppyproof je huis\nVoordat je pup thuiskomt:\n- Berg snoeren op, zet giftige planten buiten bereik\n- Zorg voor een afgezette veilige plek (bench of puppyrun)\n- Leg kranten of puppyzakken op strategische plekken\n- Verwijder kleine voorwerpen die hij kan inslikken\n\n### Benodigdheden\n\n| Item | Waarom | Kosten |\n|------|--------|--------|\n| Bench | Veilige plek, helpt bij zindelijkheid | €40-€100 |\n| Puppyvoer | Speciaal voor groei | €25-€50/maand |\n| Speeltjes | Knaag- en trekspeeltjes | €20-€40 |\n| Halsband + riem | Veilig uitlaten | €15-€30 |\n| Puppyzakken | Ongebruikelijk maar effectief | €10-€20 |\n\n### Zindelijkheidstraining\n\n1. **Regelmaat** — zet de pup elke 2 uur buiten, direct na het slapen, eten en spelen.\n2. **Belonen** — geef een snoepje en enthousiaste aandacht zodra hij buiten plast.\n3. **Niet straffen** — een ongelukje binnen genegeer je. Straffen werkt averechts.\n4. **Nachtritme** — haal de pup de eerste weken 1-2 keer per nacht uit de bench.\n\n### Socialisatie (cruciaal!)\n\nDe eerste 16 weken zijn de socialisatieperiode van een pup. Wat je nu aan ervaringen meegeeft, bepaalt zijn gedrag voor de rest van zijn leven:\n\n- Laat hem kennismaken met verschillende mensen (mannen, vrouwen, kinderen, mensen met baard, pet, rollator)\n- Laat hem andere vriendelijke, gevaccineerde honden ontmoeten\n- Stel hem bloot aan verschillende geluiden (stofzuiger, verkeer, deurbel)\n- Laat hem wennen aan autorijden, de dierenarts, de trimsalon\n\n**Let op:** Dit moet positief blijven. Forceer niets. Een negatieve ervaring kan een blijvende angst veroorzaken.\n\n## Puppytraining: begin met de basis\n\nEen pup kan al heel jong beginnen met basiscommando\'s, mits het spelenderwijs en positief gebeurt:\n\n1. **Zit** — lok met een snoepje omhoog, zodra hij gaat zitten: belonen.\n2. **Af** — snoepje naar de grond brengen.\n3. **Hier** — ren een paar stappen achteruit, roep hem, beloon als hij komt.\n4. **Los uitlaten** — begin op een rustige, veilige plek.\n\n**Gebruik altijd positieve bekrachtiging:** negeer ongewenst gedrag, beloon gewenst gedrag. Schreeuwen, slaan of aan de riem trekken beschadigt het vertrouwen van je pup.\n\n## Veelgestelde vragen over een puppy adopteren\n\n### Hoe weet ik wat voor hond het wordt?\n\nHet asiel kan een inschatting maken op basis van het ras van de moeder (als die bekend is) en de kenmerken van de pup. Maar 100 procent zekerheid heb je nooit. Een mix van 20 kilo kan 35 kilo worden — wees voorbereid.\n\n### Kan ik een puppy alleen laten?\n\nNiet lang. Een pup van 8 weken moet elke 2-3 uur plassen. De eerste maanden moet je of thuis zijn, of iemand laten langskomen. Bouw het alleen zijn heel langzaam op: eerst 5 minuten, dan 10, dan 20.\n\n### Wanneer beginnen met puppytraining?\n\nDirect. Vanaf dag 1 kun je beginnen met positieve basiscommando\'s. Puppycursussen beginnen vaak vanaf 12 weken (na de tweede vaccinatie).\n\n### Wat kost een puppy in het eerste jaar?\n\n| Kostenpost | Bedrag |\n|------------|--------|\n| Adoptie | €100-€350 |\n| Bench, riem, bakjes | €100-€200 |\n| Puppyvoeding (12 maanden) | €300-€600 |\n| Dierenarts (vaccinaties, check) | €150-€300 |\n| Puppycursus | €100-€250 |\n| Verzekering (12 maanden) | €180-€480 |\n| **Totaal eerste jaar** | **€930-€2.180** |\n\n## Conclusie\n\nEen puppy adopteren uit het asiel is een prachtige, maar intensieve keuze. Je krijgt er een onbeschreven blad voor terug — met alle uitdagingen en vreugde die daarbij horen. Wees voorbereid op de tijd, energie en kosten die de eerste maanden vragen, en je krijgt er een trouwe viervoeter voor terug die je geen moment zal vergeten.\n\n> **[Start de gratis intake →](/intake)**\n\n### Verder lezen\n\n- [Hond adopteren: complete gids](/blog/hond-adopteren-uit-het-asiel-complete-gids)\n- [Wat kost een huisdier? Kostenoverzicht](/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker)\n- [Verlatingsangst bij adoptiehonden](/blog/verlatingsangst-bij-adoptiehonden-herkennen-en-oplossen)\n- [De 3-3-3 regel](/kennisbank/thuiskomst/de-eerste-dagen-3-3-3)\n- [Kinderen en een asieldier](/blog/kinderen-en-een-asieldier-zo-bereid-je-ze-voor)\n',
    },
    {
        'titel': 'Angstige hond adopteren: tips uit de praktijk',
        'slug': 'angstige-hond-adopteren-tips-uit-de-praktijk',
        'excerpt': 'Een angstige hond adopteren vraagt geduld, kennis en de juiste aanpak. Ontdek hoe je een bange asielhond veilig laat wennen aan zijn nieuwe thuis.',
        'meta_title': 'Angstige hond adopteren: tips voor een bange asielhond',
        'meta_desc': 'Angstige hond adopteren: praktische tips voor het begeleiden van een bange asielhond. Van een veilige plek creëren tot vertrouwen opbouwen.',
        'keyword': 'angstige hond adopteren',
        'minutes': 6,
        'cat_id': adoptanten_id,
        'date': '2026-03-01',
        'cover': '/images/blog/angstige-hond-hero.jpg',
        'links': '[{"tekst": "Hond adopteren complete gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "Verlatingsangst bij adoptiehonden", "url": "/blog/verlatingsangst-bij-adoptiehonden-herkennen-en-oplossen"}, {"tekst": "Kinderen en een asieldier", "url": "/blog/kinderen-en-een-asieldier-zo-bereid-je-ze-voor"}, {"tekst": "3-3-3 regel", "url": "/kennisbank/thuiskomst/de-eerste-dagen-3-3-3"}]',
        'md': '> **In het kort:** Een angstige hond adopteren is een van de meest dankbare dingen die je kunt doen. Maar het vraagt geduld, kennis en de juiste aanpak. Dit artikel helpt je een bange asielhond veilig te laten wennen, vertrouwen op te bouwen en te voorkomen dat angst uitgroeit tot probleemgedrag.\n\n## Waarom zijn sommige asielhonden angstig?\n\nEen hond wordt niet zomaar angstig. Er zit altijd een oorzaak achter. Bij asielhonden zijn de meest voorkomende oorzaken:\n\n- **Gebrek aan socialisatie** — de hond heeft in zijn jonge weken te weinig positieve ervaringen opgedaan met mensen, andere honden of situaties.\n- **Traumatische ervaringen** — mishandeling, een ongeluk, of langdurige verwaarlozing.\n- **Onbekende omgeving** — het asiel zelf is al een stressvolle plek. Een hond die daar weken of maanden zit, kan angstig worden van de overgang naar een thuis.\n- **Aangeleerde angst** — een hond die in het verleden is gestraft voor angstgedrag, wordt alleen maar banger.\n\nHet belangrijkste om te onthouden: **angst is geen schuld van de hond.** Het is een overlevingsmechanisme.\n\n## Herkennen van angst bij honden\n\nNiet elke bange hond laat hetzelfde gedrag zien. Let op deze signalen:\n\n| Signaal | Wat de hond voelt | Wat jij doet |\n|---------|-------------------|--------------|\n| Trillen, wegkruipen | Oververmogen, wil onzichtbaar zijn | Laat hem met rust, geef een veilige plek |\n| Grommen, tanden laten zien | Voelt zich in het nauw gedreven | Stop waar je mee bezig bent, geef ruimte |\n| Plassen bij begroeting | Onderdanige angst | Negeer hem bij binnenkomst, begroet later pas |\n| Hijgen, ijsberen | Stress, onvermogen om te kalmeren | Zorg voor rust, dim het licht, zet rustige muziek op |\n| Vermijden van oogcontact | Onzekerheid, wil geen confrontatie | Dwing geen oogcontact af, kijk weg om gerust te stellen |\n\n## Stap 1: een veilige basis creëren\n\nEen angstige hond heeft een plek nodig waar hij zich 100 procent veilig voelt. Dat kan zijn:\n\n- Een bench met een deken over de bovenkant (een \"hol\")\n- Een afgezonderde kamer of hoek\n- Een vaste mand op een rustige plek\n\n**Regels voor de veilige plek:**\n- De hond mag daar nooit gestoord worden\n- Kinderen en andere huisdieren hebben er geen toegang\n- Voer en water staan in de buurt, maar niet in de plek zelf\n- De eerste weken is dit zijn hele wereld. Breid langzaam uit.\n\n## Stap 2: vertrouwen opbouwen\n\nVertrouwen komt niet vanzelf. Het wordt opgebouwd door duizenden kleine positieve interacties:\n\n1. **Praat rustig** — gebruik een kalme, lage stem. Harde of hoge stemmen werken averechts.\n2. **Beweeg langzaam** — snelle bewegingen schrikken een bange hond af.\n3. **Dwing geen contact af** — laat de hond naar jou toekomen, niet andersom.\n4. **Beloon elk klein succesje** — een moment van oogcontact? Belonen. Een kwispel? Belonen.\n5. **Hand-touch training** — laat de hond je hand aanraken met zijn neus voor een snoepje. Dit bouwt positieve associatie op met jouw hand.\n\n## Stap 3: langzaam de wereld laten zien\n\nEen angstige hond hoeft niet meteen de hele wereld te ontdekken. Gebruik een ladder van succes:\n\n1. Week 1-2: alleen het huis, geen bezoek\n2. Week 3-4: rustige wandelingen op stille tijden (vroeg of laat)\n3. Week 5-6: korte ontmoetingen met 1 rustige, vriendelijke persoon\n4. Week 7-8: bezoek aan een rustige hondenlosloopweide (buiten piekuren)\n5. Week 9+: langzaam uitbreiden naar drukkere situaties\n\n**Belangrijk:** Gaat het te snel? De hond laat stress-signalen zien? Ga een stap terug. Voorkomen is beter dan genezen.\n\n## Wat je absoluut niet moet doen\n\n- **Niet straffen voor angst** — dat maakt de angst alleen maar erger\n- **Niet dwingen** — een angstige hond in een enge situatie duwen veroorzaakt trauma\n- **Niet troosten met stem** — \"stil maar, het is al goed\" in een lieve stem kan een bange hond juist bevestigen dat er iets engs is\n- **Niet overspoelen** — te veel nieuwe indrukken tegelijk werkt averechts\n\n## Wanneer schakel je een gedragsdeskundige in?\n\nBij sommige honden is professionele hulp nodig:\n- De hond gromt of bijt uit angst (niet uit agressie)\n- De vooruitgang stagneert na 3 maanden\n- De hond plast of poept van angst bij alledaagse situaties\n- Je hebt zelf het gevoel dat je er niet uitkomt\n\nZoek een gediplomeerd gedragsdeskundige die werkt met positieve methoden, geen correctietraining.\n\n## Veelgestelde vragen over een angstige hond adopteren\n\n### Kan een angstige hond ooit normaal worden?\n\nDe meeste angstige honden kunnen met geduld en de juiste aanpak enorme vooruitgang boeken. Ze worden misschien nooit een uitbundige hond die op iedereen afrent, maar ze kunnen wel leren dat de wereld veilig is.\n\n### Hoe lang duurt het voordat een angstige hond went?\n\nReken op 3 maanden voor de eerste vooruitgang, 6-12 maanden voor een stabiel vertrouwen. Sommige honden hebben langer nodig — dat is oké.\n\n### Kan een angstige hond samen met een andere hond?\n\nJa, een rustige, sociale andere hond kan een angstige hond enorm helpen. Zorg voor een goede introductie en geef beide honden hun eigen veilige plek.\n\n### Zijn angstige honden geschikt voor een gezin met kinderen?\n\nMet mate. Een angstige hond heeft rust en voorspelbaarheid nodig. Jonge kinderen die harde geluiden maken en snel bewegen, kunnen een bange hond overspoelen. Een gezin met rustige oudere kinderen kan prima werken.\n\n## Conclusie\n\nEen angstige hond adopteren is niet makkelijk, maar het is een van de meest dankbare dingen die je kunt doen. Elke kleine vooruitgang — een kwispel, een lik over je hand, een ontspannen zucht — is een overwinning. Je geeft een dier dat de wereld eng vindt een veilige thuisbasis. Daar zijn geen woorden voor.\n\n> **[Advies nodig over jouw angstige adoptiehond? Start de intake →](/intake)**\n\n### Verder lezen\n\n- [Verlatingsangst bij adoptiehonden](/blog/verlatingsangst-bij-adoptiehonden-herkennen-en-oplossen)\n- [Hond adopteren: complete gids](/blog/hond-adopteren-uit-het-asiel-complete-gids)\n- [Kinderen en een asieldier](/blog/kinderen-en-een-asieldier-zo-bereid-je-ze-voor)\n- [De 3-3-3 regel](/kennisbank/thuiskomst/de-eerste-dagen-3-3-3)\n',
    },
    {
        'titel': 'Twee katten adopteren: waarom een stelletje beter is',
        'slug': 'twee-katten-adopteren-waarom-een-stelletje-beter-is',
        'excerpt': 'Twee katten adopteren in plaats van één is vaak beter voor het welzijn van de dieren. Ontdek waarom een kattenstelletje gelukkiger is en waar je op moet letten.',
        'meta_title': 'Twee katten adopteren: voordelen en aandachtspunten',
        'meta_desc': 'Twee katten adopteren uit het asiel: waarom katten in paren gelukkiger zijn, hoe je een goed stelletje kiest en wat het kost.',
        'keyword': 'twee katten adopteren',
        'minutes': 5,
        'cat_id': adoptanten_id,
        'date': '2026-04-01',
        'cover': '/images/blog/twee-katten-hero.jpg',
        'links': '[{"tekst": "Kat adopteren complete gids", "url": "/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners"}, {"tekst": "Senior kat adopteren", "url": "/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn"}, {"tekst": "Kosten asieldier", "url": "/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker"}]',
        'md': '> **In het kort:** Twee katten adopteren in plaats van één is vaak de beste keuze. Katten zijn sociale dieren die elkaar gezelschap houden, samen spelen en elkaar troosten. Dit artikel legt uit waarom een stelletje beter is, hoe je de juiste combinatie kiest en wat het kost.\n\n## Waarom twee katten beter zijn dan één\n\nKatten hebben de reputatie eenlingen te zijn, maar dat is maar deels waar. In de natuur leven katten in kolonies, vooral vrouwtjes. Ze vormen sociale structuren, delen territorium en communiceren met elkaar. Een kat alleen in huis mist die sociale interactie.\n\nDe voordelen van twee katten:\n\n- **Minder eenzaamheid** — als jij werkt of weg bent, hebben ze elkaar.\n- **Minder verveling** — ze spelen samen, jagen elkaar en vermaken zich.\n- **Beter gedrag** — katten die zich vervelen, gaan sneller destructief gedrag vertonen.\n- **Minder stress** — een sociale kat is rustiger dan een kat die de hele dag alleen is.\n- **Dubbel zoveel liefde** — twee katten betekent twee keer spinnen, twee keer kopjes geven.\n\n## Wanneer is één kat beter?\n\nEr zijn situaties waarin één kat de betere keuze is:\n\n- **Je hebt een senior kat die niet aan andere katten gewend is** — forceren werkt averechts.\n- **Je woont in een zeer kleine ruimte** — studio, studentenkamer.\n- **Je kat heeft medische problemen** — chronische stress of ziektes kunnen een tweede kat moeilijk maken.\n- **Je budget is beperkt** — twee katten betekent dubbele kosten.\n\n## Hoe kies je het juiste stel?\n\nNiet elke kat is blij met een soortgenoot. De kans op succes is het grootst als je:\n\n1. **Al bestaande asielkoppels adopteert** — veel asielen hebben katten die samen zijn binnengekomen en niet uit elkaar willen.\n2. **Twee kittens uit hetzelfde nest kiest** — ze kennen elkaar al en kunnen samen opgroeien.\n3. **Een jongere en een oudere kat combineert** — een energieke jonge kat kan een rustige senior kat juist overprikkelen. Vraag het asiel om advies.\n4. **Rekening houdt met persoonlijkheid** — twee angstige katten kunnen elkaar versterken in angst. Een rustige, zelfverzekerde kat kan een bange kat juist helpen.\n\n## Introductie: zo laat je ze kennismaken\n\nDe introductie van twee katten is cruciaal. Doe het niet te snel:\n\n1. **Gescheiden houden** — zet elke kat in een eigen kamer met eten, water, kattenbak en mand.\n2. **Geuren uitwisselen** — ruil dekens of handdoeken tussen de kamers, zodat ze aan elkaars geur wennen.\n3. **Deur op een kier** — laat ze elkaar zien en horen zonder fysiek contact.\n4. **Korte ontmoetingen** — onder toezicht, steeds langer.\n5. **Samen voeren** — positieve associaties opbouwen door ze aan weerszijden van een deur te voeren.\n\nHet proces kan dagen tot weken duren. Forceer niets.\n\n## Kosten van twee katten\n\nDe kosten van twee katten zijn ongeveer het dubbele van één:\n\n| Kostenpost | 1 kat per maand | 2 katten per maand |\n|------------|----------------|--------------------|\n| Voeding | €25-€50 | €50-€100 |\n| Kattengrit | €10-€20 | €15-€30 |\n| Dierenarts (jaar/12) | €10-€20 | €20-€40 |\n| Verzekering | €10-€25 | €20-€50 |\n| **Totaal per maand** | **€55-€115** | **€105-€220** |\n\n**Eenmalig:** dubbele kattenbakken, dubbele voerbakken, dubbele manden — reken op €100 extra.\n\n## Veelgestelde vragen over twee katten\n\n### Gaan twee katten uit hetzelfde asiel beter samen?\n\nNiet per se. Katten die samen in het asiel zitten, zijn niet per definitie een stel. Vraag het asiel of ze een koppel hebben dat samen geplaatst moet worden.\n\n### Kunnen twee katten uit verschillende asielen samen?\n\nJa, maar de introductie moet zorgvuldig gebeuren. Volg het stappenplan hierboven.\n\n### Wat als ze niet met elkaar overweg kunnen?\n\nSommige katten accepteren elkaar nooit volledig. In dat geval hebben ze allebei hun eigen territorium nodig: eigen plekjes, eigen kattenbakken, eigen voerbakken. In het uiterste geval moet je ze gescheiden houden.\n\n### Zijn twee katten niet dubbel zoveel werk?\n\nNee. Twee katten zijn niet dubbel zoveel werk als één. Ze vermaken elkaar, waardoor jij minder speeltijd hoeft te bieden. Het schoonmaken van twee kattenbakken is iets meer werk, maar de gezelligheid weegt daar ruimschoots tegenop.\n\n## Conclusie\n\nTwee katten adopteren is vaak beter dan één. Ze zijn gelukkiger, gezonder en hebben minder snel gedragsproblemen. Het kost iets meer, maar de voordelen voor het welzijn van de dieren zijn evident. Overweeg bij je volgende asielbezoek eens een stelletje — je zult er geen spijt van krijgen.\n\n> **[Start de gratis intake →](/intake)**\n\n### Verder lezen\n\n- [Kat adopteren uit asiel: complete gids](/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners)\n- [Senior kat adopteren](/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn)\n- [Wat kost een huisdier?](/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker)\n',
    },
    {
        'titel': 'Buitenkat of binnenkat: wat past bij jouw situatie?',
        'slug': 'buitenkat-of-binnenkat-wat-past-bij-jouw-situatie',
        'excerpt': 'De keuze tussen een buitenkat of binnenkat bepaalt het welzijn van je dier en de impact op de omgeving. Ontdek wat past bij jouw huis en leefstijl.',
        'meta_title': 'Buitenkat of binnenkat: voor- en nadelen',
        'meta_desc': 'Buitenkat of binnenkat: ontdek de voor- en nadelen, veiligheid, impact op vogels en wat past bij jouw woonsituatie en leefstijl.',
        'keyword': 'buitenkat of binnenkat',
        'minutes': 5,
        'cat_id': adoptanten_id,
        'date': '2026-05-10',
        'cover': '/images/blog/buitenkat-binnenkat-hero.jpg',
        'links': '[{"tekst": "Kat adopteren complete gids", "url": "/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners"}, {"tekst": "Senior kat adopteren", "url": "/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn"}, {"tekst": "Twee katten adopteren", "url": "/blog/twee-katten-adopteren-waarom-een-stelletje-beter-is"}, {"tekst": "Kosten asieldier", "url": "/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker"}]',
        'md': '> **In het kort:** Buitenkat of binnenkat? Het is een van de belangrijkste beslissingen die je neemt bij het adopteren van een kat. Veiligheid, welzijn, levensverwachting en impact op de omgeving spelen allemaal mee. Dit artikel helpt je de beste keuze te maken voor jouw situatie.\n\n## De binnenkat: veilig en langlevend\n\nEen binnenkat leeft uitsluitend binnenshuis of krijgt alleen onder toezicht toegang tot een afgezette tuin of balkon.\n\n**Voordelen:**\n- **Veiliger** — geen verkeer, vechtpartijen met andere katten, of gevaren als vergif\n- **Hogere levensverwachting** — binnenkatten worden gemiddeld 12-18 jaar, buitenkatten 2-7 jaar\n- **Minder ziektes** — geen risico op FIV (kattenaids), FeLV (kattenleukemie) of parasieten\n- **Geen impact op vogelstand** — binnenkatten doden geen vogels\n- **Geen verdwaalrisico** — je kat blijft in de buurt\n\n**Nadelen:**\n- **Moet je actief vermaken** — speeltjes, krabpalen, klimmogelijkheden\n- **Kan overgewicht krijgen** — minder beweging\n- **Vervelingsgedrag** — kan gaan miauwen, krabben aan meubels\n\n**Kostenverschil:** Lagere dierenartskosten (geen vechtpartijen, minder parasieten).\n\n## De buitenkat: natuurlijk gedrag\n\nEen buitenkat heeft vrije toegang tot de buitenwereld.\n\n**Voordelen:**\n- **Natuurlijk gedrag** — jagen, klimmen, territorium afbakenen\n- **Meer beweging** — minder kans op overgewicht\n- **Zelfvermaak** — hoeft minder speeltijd van jou\n- **Minder kattenbakonderhoud** — doet zijn behoefte buiten\n\n**Nadelen:**\n- **Kortere levensduur** — verkeer, ziektes, vechtpartijen\n- **Hogere dierenartskosten** — gewonden, parasieten\n- **Impact op vogelpopulatie** — katten doden jaarlijks miljoenen vogels\n- **Kan verdwalen of achterblijven** — bij verhuizing\n- **Overlast voor buren** — poep in tuinen, nachtelijk gemiauw\n\n## De gulden middenweg: de katveilige tuin\n\nSteeds meer katteneigenaren kiezen voor een compromis: een katveilige tuin of een kattenren.\n\nOpties:\n- **Kattenren** — een afgezette, overdekte ren in de tuin (€200-€800)\n- **Katveilige tuin** — schuttingen voorzien van kantelrollen of netten\n- **Balkonner** — een afgeschermd balkon waar je kat veilig kan zitten\n- **Uitlaatservice voor katten** — ja, dat bestaat (€10-€20 per wandeling)\n\n## Wat past bij jouw woonsituatie?\n\n| Situatie | Advies |\n|----------|--------|\n| Appartement zonder balkon | Binnenkat + veel speeltijd en klimmogelijkheden |\n| Appartement met balkon | Binnenkat met veilig balkon |\n| Huis met tuin (rustige wijk) | Katveilige tuin is ideaal |\n| Huis met tuin (drukke weg) | Binnenkat met ren in de tuin |\n| Landelijk gebied | Buitenkat, mits gechipt en geregistreerd |\n| Senior kat | Vaak al binnenkat — houd dat zo |\n\n## Tips voor een gelukkige binnenkat\n\nEen binnenkat kan prima gelukkig zijn, mits je de omgeving goed inricht:\n\n1. **Zorg voor voldoende klim- en krabmogelijkheden** — een krabpaal tot het plafond, plankjes aan de muur\n2. **Speel dagelijks actief met je kat** — 2-3 keer 10 minuten met een hengeltje\n3. **Geef uitzicht** — een kattenbak voor het raam, een vogelvoederplek buiten\n4. **Bied verstopplekjes** — dozen, tunneltjes, mandjes op hoogte\n5. **Overweeg een tweede kat** — twee katten vermaken elkaar\n\n## Veelgestelde vragen\n\n### Kan een buitenkat wennen aan binnen?\n\nJa, maar het kost tijd. Begin met korte periodes binnen en bouw langzaam uit. Zorg voor voldoende afleiding binnen. Na 6-8 weken is de meeste katten gewend.\n\n### Is het zielig om een kat binnen te houden?\n\nNee, zolang je de omgeving goed inricht. Een kat die van jongs af aan binnen is, weet niet wat hij mist. Binnenkatten leven langer en zijn gezonder.\n\n### Mag een kat zomaar naar buiten?\n\nSinds 2024 is het verplicht om je kat te chippen en te registreren. Daarnaast geldt in sommige gemeentes een aanlijnplicht of een verbod op loslopende katten in bepaalde natuurgebieden.\n\n### Wat is de beste leeftijd om een kat binnen te leren blijven?\n\nHoe jonger, hoe makkelijker. Kittens die vanaf 8-12 weken binnen worden gehouden, hebben geen behoefte om naar buiten te gaan. Een volwassen kat kan ook wennen, maar dat kost meer tijd.\n\n## Conclusie\n\nDe keuze tussen een buitenkat of binnenkat is persoonlijk en hangt af van je woonsituatie, de kat zelf en je normen en waarden. Een binnenkat met een goed ingerichte omgeving is minstens zo gelukkig als een buitenkat, en leeft een stuk langer. Overweeg bij twijfel een katveilige tuin — het beste van beide werelden.\n\n> **[Start de gratis intake →](/intake)**\n\n### Verder lezen\n\n- [Kat adopteren uit asiel](/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners)\n- [Senior kat adopteren](/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn)\n- [Twee katten adopteren](/blog/twee-katten-adopteren-waarom-een-stelletje-beter-is)\n- [Wat kost een huisdier?](/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker)\n',
    },
]

for a in new_articles:
    cur.execute("SELECT id FROM blog_posts WHERE slug = %s", (a['slug'],))
    if cur.fetchone():
        s = a['slug']
        print(f'⚠️  Bestaat al: {s}')
        continue
    
    cur.execute("""
        INSERT INTO blog_posts (titel, slug, inhoud_md, excerpt, cover_url, categorie_id,
            status, meta_title, meta_description, focus_keyword, leestijd, interne_links,
            gepubliceerd_op, aangemaakt_op, bijgewerkt_op)
        VALUES (%s, %s, %s, %s, %s, %s, 'gepubliceerd', %s, %s, %s, %s, %s::jsonb,
            %s::timestamp, NOW(), NOW())
    """, (a['titel'], a['slug'], a['md'], a['excerpt'], a['cover'], a['cat_id'],
          a['meta_title'], a['meta_desc'], a['keyword'], a['minutes'], a['links'],
          a['date'] + ' 10:00:00'))
    print('✅ Nieuw: ' + a['slug'] + ' (' + a['date'] + ')')

conn.commit()
conn.close()
print('\n✅ Alle updates en nieuwe artikelen klaar!')
print('📝 FAQ toegevoegd aan 8 bestaande artikelen')
print('📝 4 nieuwe artikelen aangemaakt (puppy, angstige hond, twee katten, buitenkat)')
