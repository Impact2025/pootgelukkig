/**
 * Seed script — vul database met uitgebreide demo-data
 * Uitvoeren: npm run db:seed
 */

import { db } from './index'
import {
  users, asielen, dieren, adopterProfielen,
  matches, gesprekken, berichten, adopties,
  medischeRecords, nazorgDagen,
  pleeggezinnen, pleegplaatsingen,
  wachtlijst,
} from './schema'
import bcryptjs from 'bcryptjs'
import { sql, eq } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Database leeggooien en opnieuw vullen...')

  // --- Opschonen in juiste volgorde (foreign keys) ---
  await db.execute(sql`DELETE FROM nazorg_dagen`)
  await db.execute(sql`DELETE FROM adopties`)
  await db.execute(sql`DELETE FROM berichten`)
  await db.execute(sql`DELETE FROM gesprekken`)
  await db.execute(sql`DELETE FROM matches`)
  await db.execute(sql`DELETE FROM medische_records`)
  await db.execute(sql`DELETE FROM adopter_profielen`)
  await db.execute(sql`DELETE FROM pleegplaatsingen`)
  await db.execute(sql`DELETE FROM pleeggezinnen`)
  await db.execute(sql`DELETE FROM wachtlijst`)
  await db.execute(sql`DELETE FROM dieren`)
  await db.execute(sql`DELETE FROM users`)
  await db.execute(sql`DELETE FROM asielen`)
  console.log('✓ Database leeggemaakt')

  // --- Noord-Holland Asielen (eerst, zodat asiel-account ernaar kan verwijzen) ---
  const [asielAmsterdam, asielHaarlem, asielZaandam, asielAlkmaar] = await db.insert(asielen).values([
    {
      naam: 'Dierenasiel Amsterdam',
      stad: 'Amsterdam',
      regio: 'Noord-Holland',
      adres: 'Polderweg 6, 1093 KP Amsterdam',
      telefoon: '020-6621822',
      email: 'info@dierenasielamsterdam.nl',
      website: 'www.dierenasielamsterdam.nl',
      beschrijving: 'Het grootste dierenasiel van Amsterdam, opgericht in 1895. Wij vangen jaarlijks ruim 3.000 dieren op en zorgen voor een goede herplaatsing.',
    },
    {
      naam: 'Dierenbescherming Haarlem',
      stad: 'Haarlem',
      regio: 'Noord-Holland',
      adres: 'Vondelweg 2, 2026 JE Haarlem',
      telefoon: '023-5262002',
      email: 'haarlem@dierenbescherming.nl',
      website: 'www.dierenbescherming.nl',
      beschrijving: 'Dierenbescherming Haarlem staat al meer dan 100 jaar klaar voor dieren in nood. Wij bieden tijdelijk onderdak aan honden, katten en kleine dieren.',
    },
    {
      naam: 'Asiel De Schuilplaats',
      stad: 'Zaandam',
      regio: 'Noord-Holland',
      adres: 'Rustenburgerlaan 14, 1506 GE Zaandam',
      telefoon: '075-6164748',
      email: 'info@deschuilplaats.nl',
      website: 'www.deschuilplaats.nl',
      beschrijving: 'Asiel De Schuilplaats is een kleinschalig, persoonlijk asiel in de Zaanstreek. Wij kennen al onze dieren bij naam en zorgen voor maatwerk bij adoptie.',
    },
    {
      naam: 'Dierenopvang Alkmaar',
      stad: 'Alkmaar',
      regio: 'Noord-Holland',
      adres: 'Rekerweg 12, 1826 SC Alkmaar',
      telefoon: '072-5651300',
      email: 'info@dierenopvangalkmaar.nl',
      website: 'www.dierenopvangalkmaar.nl',
      beschrijving: 'Dierenopvang Alkmaar verzorgt alle dakloze en afgestane dieren in de regio Alkmaar. Wij werken met een uitgebreid netwerk van pleegezinnen.',
    },
  ]).returning()
  console.log('✓ 4 Noord-Holland asielen aangemaakt')

  // --- Demo gebruikers ---
  const wachtwoordHash = await bcryptjs.hash('Demo1234!', 10)
  const [demoUser] = await db.insert(users).values({
    naam: 'Maya van Munster',
    email: 'demo@pootgelukkig.nl',
    wachtwoordHash,
    stad: 'Amsterdam',
    rol: 'adoptant',
    profielVoltooid: false,
  }).returning()
  console.log('✓ Adoptant demo (demo@pootgelukkig.nl / Demo1234!)')

  // Asiel demo account — gelinkt aan Dierenasiel Amsterdam
  await db.insert(users).values({
    naam: 'Jan Bakker',
    email: 'asiel@pootgelukkig.nl',
    wachtwoordHash,
    stad: 'Amsterdam',
    rol: 'asiel',
    asielId: asielAmsterdam.id,
    profielVoltooid: true,
  })
  console.log('✓ Asiel demo (asiel@pootgelukkig.nl / Demo1234!) → Dierenasiel Amsterdam')

  // Extra adoptant accounts voor demo-gesprekken & adopties
  const [userSophie, userThomas, userLena, userMark, userAnna] = await db.insert(users).values([
    { naam: 'Sophie Vermeer',   email: 'sophie.vermeer@gmail.com',  wachtwoordHash, stad: 'Amsterdam', rol: 'adoptant', profielVoltooid: true },
    { naam: 'Thomas de Groot',  email: 't.degroot@outlook.com',     wachtwoordHash, stad: 'Haarlem',   rol: 'adoptant', profielVoltooid: true },
    { naam: 'Lena van Dijk',    email: 'lena.vandijk@hotmail.com',  wachtwoordHash, stad: 'Amsterdam', rol: 'adoptant', profielVoltooid: true },
    { naam: 'Mark Janssen',     email: 'mark.janssen@gmail.com',    wachtwoordHash, stad: 'Utrecht',   rol: 'adoptant', profielVoltooid: false },
    { naam: 'Anna Bakker',      email: 'a.bakker@gmail.com',        wachtwoordHash, stad: 'Zaandam',   rol: 'adoptant', profielVoltooid: true },
  ]).returning()
  console.log('✓ 5 extra adoptant accounts aangemaakt')

  // --- 35 Dieren ---
  await db.insert(dieren).values([

    // ============ HONDEN (15) ============

    {
      asielId: asielAmsterdam.id,
      naam: 'Max',
      soort: 'hond',
      ras: 'Labrador Retriever',
      leeftijdJaren: 4,
      geslacht: 'reu',
      gewichtKg: 34,
      kleur: 'Geel',
      verhaal: 'Max is een vrolijke, grote Labrador die door zijn eigenaar moest worden afgestaan vanwege een verhuizing naar het buitenland. Hij is uitstekend getraind en kent alle basiscommando\'s. Max houdt van zwemmen, apporteren en lange wandelingen in het bos. Een perfecte hond voor een actief gezin.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'goed',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['gezinshond', 'kindvriendelijk', 'zwemmer', 'apporteur', 'sociaal', 'getraind'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000001', allergieën: [] },
    },

    {
      asielId: asielAmsterdam.id,
      naam: 'Roos',
      soort: 'hond',
      ras: 'Chihuahua',
      leeftijdJaren: 7,
      geslacht: 'vrouw',
      gewichtKg: 2.8,
      kleur: 'Caramel en wit',
      verhaal: 'Roos is een kleine dame met een grote persoonlijkheid. Ze is kalm, houdt van knuffelen op de bank en korte wandelingetjes. Ideaal voor iemand die een rustige metgezel zoekt. Ze kan alleen bij volwassenen of gezinnen met oudere kinderen.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: false,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'normaal',
        blaffen: 'veel',
        speelsheid: 'laag',
        tags: ['appartement', 'knuffelaar', 'rustig', 'senior-vriendelijk', 'kleine hond'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000002', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Thor',
      soort: 'hond',
      ras: 'Mechelse Herder Mix',
      leeftijdJaren: 2,
      geslacht: 'reu',
      gewichtKg: 28,
      kleur: 'Zwart en bruin',
      verhaal: 'Thor is een briljante, energieke Malinois-mix die meer structuur nodig heeft dan zijn vorige eigenaar kon bieden. Hij heeft een hoog IQ en wordt onrustig zonder voldoende uitdaging. Voor een ervaren hondeneigenaar die van sport houdt — agility, bikejöring of wandelsport — is Thor de ideale partner.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600',
      gedragsProfiel: {
        energieNiveau: 'zeer_hoog',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'slecht',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['ervaren eigenaar', 'sport', 'intelligent', 'actief', 'tuin vereist'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: false, gechippt: true, chipNummer: 'NL-528210000003', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Bella',
      soort: 'hond',
      ras: 'Beagle',
      leeftijdJaren: 3,
      geslacht: 'vrouw',
      gewichtKg: 12,
      kleur: 'Tricolor',
      verhaal: 'Bella is een vrolijke Beagle met een neus die nooit stil staat. Ze is dol op snuffelwandelingen in de natuur en speelt graag met andere honden. Haar neus leidt haar soms in avonturen, dus een omheinde tuin is een must. Ze is geweldig met kinderen en heel sociaal.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: true,
        alleenThuis: 'matig',
        trainbaarheid: 'normaal',
        blaffen: 'veel',
        speelsheid: 'hoog',
        tags: ['gezinshond', 'kindvriendelijk', 'snuffelaar', 'sociaal', 'tuin'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000004', allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Oscar',
      soort: 'hond',
      ras: 'Franse Bulldog',
      leeftijdJaren: 5,
      geslacht: 'reu',
      gewichtKg: 14,
      kleur: 'Brindle',
      verhaal: 'Oscar is de perfecte stadshond. Hij houdt van korte wandelingen, vervolgens de hele dag op de bank. Hij snurkt luid en adoreert aandacht. Ideaal voor appartement, werkt thuis of gepensioneerden. Hij is super vriendelijk met iedereen die hij tegenkomt.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['appartement', 'rustig', 'knuffelaar', 'stadshond', 'weinig beweging'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000005', allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Nora',
      soort: 'hond',
      ras: 'Weimaraner',
      leeftijdJaren: 1,
      leeftijdMaanden: 8,
      geslacht: 'vrouw',
      gewichtKg: 24,
      kleur: 'Grijs-zilver',
      verhaal: 'Nora is een elegante jonge Weimaraner die nog volop in ontwikkeling is. Ze heeft heel veel energie en heeft dagelijks uren beweging nodig. Ze is intelligent, leergierig en hecht zich sterk aan haar baas. Ze heeft een groot huis met tuin en een sportieve eigenaar nodig.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      gedragsProfiel: {
        energieNiveau: 'zeer_hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: true,
        alleenThuis: 'slecht',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['puppy', 'actief', 'sportief', 'tuin vereist', 'leergierig'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: false, gechippt: true, chipNummer: 'NL-528210000006', allergieën: [] },
    },

    {
      asielId: asielAmsterdam.id,
      naam: 'Sam',
      soort: 'hond',
      ras: 'Labradoodle',
      leeftijdJaren: 6,
      geslacht: 'reu',
      gewichtKg: 22,
      kleur: 'Crème',
      verhaal: 'Sam is een vriendelijke, hypo-allergene Labradoodle die perfect is voor gezinnen met allergie. Hij verliest nauwelijks haar, is supergeduldiger met kinderen en heeft een zacht karakter. Hij was huishond bij een gezin met 3 kinderen en is alle drukte gewend.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'goed',
        trainbaarheid: 'hoog',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['hypo-allergeen', 'gezinshond', 'kindvriendelijk', 'sociaal', 'no-shed'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000007', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Mila',
      soort: 'hond',
      ras: 'Teckel',
      leeftijdJaren: 8,
      geslacht: 'vrouw',
      gewichtKg: 8,
      kleur: 'Rood-bruin',
      verhaal: 'Mila is een wijze, lieve senior-teckel die door het overlijden van haar baasje in het asiel belandde. Ze heeft haar hele leven bij een rustig persoon gewoond en zoekt dat weer. Ze geniet van korte wandelingetjes en lange middagdutjes op de bank. Pure liefde in een klein pakketje.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1546470427-0d4b6c87b928?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: false,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'normaal',
        speelsheid: 'laag',
        tags: ['senior', 'rustig', 'appartement', 'volwassenen', 'one-person'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000008', allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Finn',
      soort: 'hond',
      ras: 'Siberische Husky',
      leeftijdJaren: 3,
      geslacht: 'reu',
      gewichtKg: 27,
      kleur: 'Zwart en wit',
      verhaal: 'Finn is een indrukwekkende Husky met ijsblauwe ogen en een vrije geest. Hij is ontsnapt uit zijn vorige tuin (meerdere keren!) en heeft een uitdagings-proof omheining nodig. Finn is uiterst sociaal, houdt van mensen en andere honden, en heeft een atleet als baas nodig.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      gedragsProfiel: {
        energieNiveau: 'zeer_hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: true,
        alleenThuis: 'slecht',
        trainbaarheid: 'laag',
        blaffen: 'veel',
        speelsheid: 'hoog',
        tags: ['actief', 'ontsnapper', 'roept (huilt)', 'tuin vereist', 'atletisch'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: false, gechippt: true, chipNummer: 'NL-528210000009', allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Stella',
      soort: 'hond',
      ras: 'Cocker Spaniel',
      leeftijdJaren: 2,
      geslacht: 'vrouw',
      gewichtKg: 11,
      kleur: 'Goud',
      verhaal: 'Stella is een zachte, gevoelige Cocker Spaniel die van haar wereld heeft genoten. Ze is ideaal voor een rustig huishouden of een gezin met wat oudere kinderen. Ze rolt graag op schoot en geniet van borstelen. Haar lange oren hebben extra verzorging nodig.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['zachtaardig', 'gevoelig', 'knuffelaar', 'sociaal', 'gezinshond'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000010', allergieën: [] },
    },

    {
      asielId: asielAmsterdam.id,
      naam: 'Bruno',
      soort: 'hond',
      ras: 'Rottweiler Mix',
      leeftijdJaren: 4,
      geslacht: 'reu',
      gewichtKg: 40,
      kleur: 'Zwart en tan',
      verhaal: 'Bruno is een loyale, trouwe hond die een slechte start heeft gehad maar daarna volledig is herbloeid. Hij is nu een betrouwbare, gehoorzame hond. Hij heeft een ervaren eigenaar nodig die zijn zelfvertrouwen begrijpt. Met de juiste handleiding is hij een fantastische gezinsbewaker.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1558929996-da64ba858215?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'normaal',
        tags: ['ervaren eigenaar', 'loyaal', 'bewaker', 'tuin', 'geen kinderen'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000011', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Lola',
      soort: 'hond',
      ras: 'Pomeranian',
      leeftijdJaren: 3,
      geslacht: 'vrouw',
      gewichtKg: 3,
      kleur: 'Oranje',
      verhaal: 'Lola is een vlotte, levendige Pomeranian die overal de show steelt. Ze is klein maar denkt groot. Lola is dol op spelletjes, trucjes leren en lange gesprekken (ze is erg spraakzaam). Perfect voor appartementbewoners die een actieve, kleine hond willen.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: false,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'veel',
        speelsheid: 'hoog',
        tags: ['appartement', 'kleine hond', 'truckjes', 'sociaal', 'energiek'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000012', allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Fleur',
      soort: 'hond',
      ras: 'Jack Russell Terrier',
      leeftijdJaren: 2,
      geslacht: 'vrouw',
      gewichtKg: 7,
      kleur: 'Wit en bruin',
      verhaal: 'Fleur is een pittige, onvermoeibare Jack Russell met meer energie dan een kerncentrale. Ze is slim, grappig en altijd in voor avontuur. Ze heeft iemand nodig die haar uitdaagt met puzzels, wandelingen en trainingen. Nooit saai met Fleur in huis!',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600',
      gedragsProfiel: {
        energieNiveau: 'zeer_hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'slecht',
        trainbaarheid: 'normaal',
        blaffen: 'veel',
        speelsheid: 'hoog',
        tags: ['terriër', 'actief', 'pittig', 'grappig', 'avonturier'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000013', allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Gus',
      soort: 'hond',
      ras: 'Sint-Bernard',
      leeftijdJaren: 3,
      geslacht: 'reu',
      gewichtKg: 68,
      kleur: 'Rood en wit',
      verhaal: 'Gus is een zachte reus die denkt dat hij een schooter is. Ondanks zijn imposante formaat is hij de vriendelijkste hond van het asiel. Hij is kalm, geduldig en dol op kinderen. Hij heeft een grote tuin nodig want hij speelt graag buiten. En ja, hij kwijlt een beetje.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['grote hond', 'zacht karakter', 'kindvriendelijk', 'tuin', 'rustige reus'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000014', allergieën: [] },
    },

    {
      asielId: asielAmsterdam.id,
      naam: 'Bowie',
      soort: 'hond',
      ras: 'Border Collie Mix',
      leeftijdJaren: 3,
      geslacht: 'reu',
      gewichtKg: 18,
      kleur: 'Zwart en wit',
      verhaal: 'Bowie is een vrolijke, energieke hond die op zoek is naar een nieuw avontuur. Hij is gevonden in een park en heeft sindsdien bij ons in het asiel laten zien hoe slim en lief hij is. Hij leert razendsnel commando\'s en is dol op apporteren.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['kindvriendelijk', 'houdt van rennen', 'sociaal', 'kan met katten', 'leergierig'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000015', allergieën: [] },
    },

    // ============ KATTEN (12) ============

    {
      asielId: asielAmsterdam.id,
      naam: 'Mochi',
      soort: 'kat',
      ras: 'Perzische Kat',
      leeftijdJaren: 6,
      geslacht: 'vrouw',
      gewichtKg: 4,
      kleur: 'Wit',
      verhaal: 'Mochi is een majestueuze Perzische dame die van luxe houdt. Ze heeft dagelijks borstelen nodig en geeft in ruil daarvoor onvoorwaardelijke liefde. Ze is rustig, houdt van haar vertrouwde plekjes en is perfect voor een rustig huis of appartement.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['indoor', 'rustig', 'verzorging nodig', 'appartement', 'knuffelkat'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000016', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Shadow',
      soort: 'kat',
      ras: 'Europese Korthaar',
      leeftijdJaren: 3,
      geslacht: 'reu',
      gewichtKg: 5,
      kleur: 'Zwart',
      verhaal: 'Shadow is een mysterieuze zwarte kater die op zijn eigen voorwaarden lief is. Hij begrijpt je dag beter dan jijzelf en verschijnt precies wanneer je hem nodig hebt. Hij heeft zijn eigen agenda maar deelt graag warmte op de bank. Kies Shadow en hij kiest jou terug.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['zelfstandig', 'mysterieus', 'one-person', 'indoor', 'avondkat'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000017', allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Oranje',
      soort: 'kat',
      ras: 'Britse Korthaar',
      leeftijdJaren: 4,
      geslacht: 'reu',
      gewichtKg: 6,
      kleur: 'Oranje',
      verhaal: 'Oranje (hij heeft zijn naam te danken aan zijn kleur) is een dikke, ronde kater die het liefst op zijn rug in de zon ligt. Hij knort als een kleine tractor en houdt van buikwrijven. Hij is vriendelijk met iedereen. Het perfecte Netflix-gezelschap.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['knuffelaar', 'lui', 'gezinsvriendelijk', 'appartement', 'snurker'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000018', allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Pippi',
      soort: 'kat',
      ras: 'Siamese',
      leeftijdJaren: 2,
      geslacht: 'vrouw',
      gewichtKg: 3.5,
      kleur: 'Crème met donkere punten',
      verhaal: 'Pippi is de meest spraakzame kat van het asiel. Ze vertelt je haar hele dag, beoordeelt al je keuzes en is altijd aanwezig om te controleren wat je aan het doen bent. Ze houdt van mensen en klaagt als je te lang wegblijft. Nooit eenzaam met Pippi.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'slecht',
        trainbaarheid: 'normaal',
        blaffen: 'veel',
        speelsheid: 'hoog',
        tags: ['spraakzaam', 'sociaal', 'aandachtsbehoefte', 'slim', 'actief'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000019', allergieën: [] },
    },

    {
      asielId: asielAmsterdam.id,
      naam: 'Tobias',
      soort: 'kat',
      ras: 'Maine Coon',
      leeftijdJaren: 5,
      geslacht: 'reu',
      gewichtKg: 8,
      kleur: 'Bruin tabby',
      verhaal: 'Tobias is een imposante Maine Coon — groot van formaat maar goud van karakter. Hij is een rustige, waardige kater die graag in de buurt van zijn mensen is maar niet altijd aangeraakt wil worden. Hij speelt graag en is uitstekend met andere katten.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'normaal',
        speelsheid: 'normaal',
        tags: ['grote kat', 'waardig', 'sociaal', 'multi-kat', 'gezinsvriendelijk'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000020', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Nala',
      soort: 'kat',
      ras: 'Bengal',
      leeftijdJaren: 1,
      leeftijdMaanden: 6,
      geslacht: 'vrouw',
      gewichtKg: 3.5,
      kleur: 'Goud met zwarte vlekken',
      verhaal: 'Nala is een wilde kleine Bengal die denkt dat ze een luipaard is. Ze klimt overal, jaagt op alles wat beweegt en heeft een heleboel energie. Ze heeft veel speelgoed, krabpalen en interactie nodig. Ze is prachtig om te zien en houdt van haar eigen manier van knuffelen.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      gedragsProfiel: {
        energieNiveau: 'zeer_hoog',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['wild', 'klimmer', 'actief', 'prachtig', 'enige kat'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000021', allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Grijs',
      soort: 'kat',
      ras: 'Russisch Blauw',
      leeftijdJaren: 7,
      geslacht: 'vrouw',
      gewichtKg: 4,
      kleur: 'Blauw-grijs',
      verhaal: 'Grijs is een elegante Russisch Blauw die met ouder worden steeds lievere geworden is. Ze is rustig, spaarzaam in haar affectie maar als ze besluit dat je haar persoon bent, is ze de trouwste maatje die je kunt hebben. Ideaal voor rustig huishouden.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['senior', 'rustig', 'elegant', 'one-person', 'appartement'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000022', allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Coco',
      soort: 'kat',
      ras: 'Abessijn',
      leeftijdJaren: 3,
      geslacht: 'vrouw',
      gewichtKg: 3.8,
      kleur: 'Tawny (goudoranje)',
      verhaal: 'Coco is een atletische Abessijn die elke kamer in 5 seconden kan ontdekken. Ze is nieuwsgierig, speels en houdt van hoogte. Ze leert tricks en volgt je overal. Ze heeft speelgoed, klimwanden en actieve eigenaars nodig. Ze is liefdevol op haar eigen energieke manier.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['actief', 'atletisch', 'nieuwsgierig', 'klimmer', 'tricks'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000023', allergieën: [] },
    },

    {
      asielId: asielAmsterdam.id,
      naam: 'Mimi',
      soort: 'kat',
      ras: 'Ragdoll',
      leeftijdJaren: 4,
      geslacht: 'vrouw',
      gewichtKg: 5,
      kleur: 'Seal bicolor',
      verhaal: 'Mimi leeft tot haar ras: ze wordt slap als een pop als je haar oppakt. Ze is de meest ontspannen kat die je je kunt voorstellen. Ze volgt je van kamer tot kamer, wacht op jou aan de deur en sliep bij haar vorige eigenaar onder de dekens. Totale hartsteler.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'matig',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['hangkat', 'knuffelaar', 'kindvriendelijk', 'slaapt bij je', 'zacht'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000024', allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Timo',
      soort: 'kat',
      ras: 'Ocicat',
      leeftijdJaren: 2,
      geslacht: 'reu',
      gewichtKg: 5.5,
      kleur: 'Gevlekt zilver',
      verhaal: 'Timo is de hondachtigste kat die je ooit zult ontmoeten. Hij apporteert balletjes, komt als je roept, speelt met water en loopt aan de lijn. Hij is supergezinsvriendelijk en kan goed met honden overweg. Een unieke persoonlijkheid in een prachtig kattenpak.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: true,
        hondenVriendelijk: true,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['hondachtig', 'apporteur', 'leash-trained', 'sociaal', 'uniek'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000025', allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Luna',
      soort: 'kat',
      ras: 'Europese Korthaar',
      leeftijdJaren: 5,
      geslacht: 'vrouw',
      gewichtKg: 3.8,
      kleur: 'Zwart-wit',
      verhaal: 'Luna is gevonden als zwerfkat in Zaandam en heeft langzaam haar vertrouwen opgebouwd. Ze is nu een rustige, lieve kat die van haar stoel houdt en zachte aanrakingen waardeert. Ze past het best bij een rustig huishouden, geen kleine kinderen.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['ex-zwerfkat', 'rustig', 'geduld nodig', 'appartement', 'zelfstandig'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000026', allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Pluisje',
      soort: 'kat',
      ras: 'Angora',
      leeftijdJaren: 6,
      geslacht: 'vrouw',
      gewichtKg: 4.2,
      kleur: 'Wit met blauwe ogen',
      verhaal: 'Pluisje ziet eruit als een levend knuffeldier. Haar lange witte vacht vraagt dagelijkse verzorging, maar ze geniet zelf ook van het borstelen. Ze is een rustige, elegante kat die graag in de zon ligt en zachte muziek waardeert. Haar naam zegt alles.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'laag',
        tags: ['prachtig haar', 'verzorging nodig', 'rustig', 'elegant', 'indoor'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: true, chipNummer: 'NL-528210000027', allergieën: [] },
    },

    // ============ KONIJNEN (4) ============

    {
      asielId: asielAmsterdam.id,
      naam: 'Sneeuw',
      soort: 'konijn',
      ras: 'Vlaamse Reus',
      leeftijdJaren: 2,
      geslacht: 'vrouw',
      gewichtKg: 7,
      kleur: 'Wit',
      verhaal: 'Sneeuw is een indrukwekkend groot konijn dat zachtaardig en rustig is. Ze heeft een grote ren nodig en veel ruimte om te huppelen. Ze eet graag uit je hand en laat zich makkelijk optillen. Een prachtig, goedmoedig dier voor een gezin dat van rabbits houdt.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['groot konijn', 'zachtaardig', 'gezinsvriendelijk', 'tuin', 'ren nodig'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: false, chipNummer: null, allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Cinnamon',
      soort: 'konijn',
      ras: 'Holland Lop',
      leeftijdJaren: 1,
      leeftijdMaanden: 4,
      geslacht: 'reu',
      gewichtKg: 2,
      kleur: 'Kaneel-bruin',
      verhaal: 'Cinnamon is een mini Holland Lop met hangoren die je hart stelen. Hij is jong, levendig en enorm sociaal. Hij bindt snel en geniet van dagelijks contact. Hij kan binnen op een grote ren leven en is ideaal als eerste konijn voor een gezin met kinderen.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'normaal',
        blaffen: 'weinig',
        speelsheid: 'hoog',
        tags: ['hangoren', 'jong', 'sociaal', 'gezinsvriendelijk', 'indoor'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: false, gechippt: false, chipNummer: null, allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Thumper',
      soort: 'konijn',
      ras: 'Rex Konijn',
      leeftijdJaren: 3,
      geslacht: 'reu',
      gewichtKg: 4,
      kleur: 'Blauw-grijs',
      verhaal: 'Thumper heeft de zachtste vacht van het asiel — echt als fluweel. Hij is kalm, zelfsturend en geniet van lange verkenningssessies in de tuin. Hij is gecastreerd en kan goed samenleven met een gecastreerde vrouwelijke partner. Zoekt een rustig huis met een tuin.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1589897059602-2e397bb3e6be?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['fluwelen vacht', 'kalm', 'tuin', 'gecastreerd', 'rustiger'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: false, chipNummer: null, allergieën: [] },
    },

    {
      asielId: asielAlkmaar.id,
      naam: 'Pip',
      soort: 'konijn',
      ras: 'Nederlander Dwerg',
      leeftijdJaren: 1,
      geslacht: 'man',
      gewichtKg: 1.2,
      kleur: 'Wit en grijs',
      verhaal: 'Pip is een piepklein maar enorm levendig dwergkonijn. Hij is gewend aan kinderen en geniet van dagelijks contact. Hij is ideaal als eerste huisdier voor gezinnen die willen beginnen met kleinvee. Perfect voor appartement met grote binnenren.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'normaal',
        blaffen: 'weinig',
        speelsheid: 'hoog',
        tags: ['dwergkonijn', 'kindvriendelijk', 'appartement', 'actief', 'speels'],
      },
      medischPaspoort: { gevaccineerd: true, gecastreerd: true, gechippt: false, chipNummer: null, allergieën: [] },
    },

    // ============ CAVIA'S (2) ============

    {
      asielId: asielHaarlem.id,
      naam: 'Biscuit',
      soort: 'cavia',
      ras: 'Abessijnse Cavia',
      leeftijdJaren: 1,
      geslacht: 'vrouw',
      gewichtKg: 0.9,
      kleur: 'Roodbruin en wit',
      verhaal: 'Biscuit is een vrolijke, sociale cavia die graag in gezelschap is. Ze heeft haar vriendinnen nodig (cavia\'s leven bij voorkeur in koppels) en kan eventueel samen met een andere cavia worden geadopteerd. Ze is gewend aan kinderen en laat zich makkelijk vasthouden.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=600',
      gedragsProfiel: {
        energieNiveau: 'normaal',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['cavia', 'sociaal', 'kindvriendelijk', 'koppel nodig', 'zacht'],
      },
      medischPaspoort: { gevaccineerd: false, gecastreerd: false, gechippt: false, chipNummer: null, allergieën: [] },
    },

    {
      asielId: asielHaarlem.id,
      naam: 'Peanut',
      soort: 'cavia',
      ras: 'Engelsche Cavia',
      leeftijdJaren: 2,
      geslacht: 'vrouw',
      gewichtKg: 1.1,
      kleur: 'Zwart, rood en wit (tricolor)',
      verhaal: 'Peanut is Biscuits maatje en ze zijn al hun leven samen. Zij kunnen het beste als duo geadopteerd worden. Peanut is wat rustiger dan Biscuit maar even lief. Ze "wheekt" vrolijk als ze haar groente hoort aankomen. Twee vreugdebommetjes voor de prijs van één.',
      status: 'beschikbaar',
      hoofdFotoUrl: '/dieren/peanut.png',
      gedragsProfiel: {
        energieNiveau: 'laag',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'goed',
        trainbaarheid: 'laag',
        blaffen: 'weinig',
        speelsheid: 'normaal',
        tags: ['cavia', 'duo-adoptie', 'kindvriendelijk', 'rustig', 'spraakzaam'],
      },
      medischPaspoort: { gevaccineerd: false, gecastreerd: false, gechippt: false, chipNummer: null, allergieën: [] },
    },

    // ============ VOGELS (2) ============

    {
      asielId: asielAmsterdam.id,
      naam: 'Kiwi',
      soort: 'vogel',
      ras: 'Valkparkiet',
      leeftijdJaren: 3,
      geslacht: 'reu',
      kleur: 'Groen en geel',
      verhaal: 'Kiwi is een pratende valkparkiet die al een woordenschat van 30+ woorden heeft. Hij zegt "Hallo!", "Kiwi lief!" en "Lekker!" op de meest onverwachte momenten. Hij is tam, stapt makkelijk op een vinger en houdt van gezelschap. Ideaal voor iemand die een interactieve vogel zoekt.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: true,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'hoog',
        blaffen: 'veel',
        speelsheid: 'hoog',
        tags: ['pratend', 'tam', 'interactief', 'vrolijk', 'appartement'],
      },
      medischPaspoort: { gevaccineerd: false, gecastreerd: false, gechippt: false, chipNummer: null, allergieën: [] },
    },

    {
      asielId: asielZaandam.id,
      naam: 'Rio',
      soort: 'vogel',
      ras: 'Agapornis (Dwergpapegaai)',
      leeftijdJaren: 2,
      geslacht: 'vrouw',
      kleur: 'Groen met oranje kop',
      verhaal: 'Rio is een kleurrijke Agapornis die leeft voor verbinding. Ze is gewend geweest aan een partner maar kan ook wennen aan menselijk gezelschap. Ze speelt graag, klimt door haar kooi en houdt van muziek. Ze is het levende bewijs dat grote liefde in kleine pakketjes zit.',
      status: 'beschikbaar',
      hoofdFotoUrl: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=600',
      gedragsProfiel: {
        energieNiveau: 'hoog',
        kindvriendelijk: false,
        katVriendelijk: false,
        hondenVriendelijk: false,
        alleenThuis: 'matig',
        trainbaarheid: 'normaal',
        blaffen: 'normaal',
        speelsheid: 'hoog',
        tags: ['kleurrijk', 'sociaal', 'muziek', 'appartement', 'aandachtsbehoefte'],
      },
      medischPaspoort: { gevaccineerd: false, gecastreerd: false, gechippt: false, chipNummer: null, allergieën: [] },
    },

  ])

  // --- Pleeggezinnen ---
  const [pgFamilie1, pgFamilie2, pgFamilie3, pgFamilie4, pgFamilie5, pgFamilie6] = await db.insert(pleeggezinnen).values([
    {
      asielId: asielAmsterdam.id,
      naam: 'Familie De Vries',
      email: 'devries@gmail.com',
      telefoon: '06-12345678',
      adres: 'Keizersgracht 45',
      stad: 'Amsterdam',
      soortVoorkeur: ['hond', 'kat'],
      maxDieren: 2,
      ervaringNiveau: 'veel',
      notities: 'Groot huis met tuin. Heeft eerder 3 pleegdieren gehad, allemaal succesvol herplaatst. Pensionado, altijd thuis.',
      actief: true,
    },
    {
      asielId: asielAmsterdam.id,
      naam: 'Mirjam Hoekstra',
      email: 'm.hoekstra@outlook.com',
      telefoon: '06-87654321',
      adres: 'Jordaan 12',
      stad: 'Amsterdam',
      soortVoorkeur: ['kat'],
      maxDieren: 3,
      ervaringNiveau: 'veel',
      notities: 'Werkt thuis als freelancer. Gespecialiseerd in schuwe katten en kittens. Heeft een rustige woning zonder kinderen.',
      actief: true,
    },
    {
      asielId: asielAmsterdam.id,
      naam: 'Familie Jansen-Bakker',
      email: 'jansen.bakker@gmail.com',
      telefoon: '06-11223344',
      adres: 'Amstelveenseweg 88',
      stad: 'Amsterdam',
      soortVoorkeur: ['hond'],
      maxDieren: 1,
      ervaringNiveau: 'beetje',
      notities: 'Jong gezin met 2 kinderen (6 en 9 jaar). Heeft tuin van 80m². Gewend aan grote honden via familie.',
      actief: true,
    },
    {
      asielId: asielAmsterdam.id,
      naam: 'Peter van den Berg',
      email: 'p.vandenberg@hotmail.com',
      telefoon: '06-55667788',
      adres: 'Westerpark 3',
      stad: 'Amsterdam',
      soortVoorkeur: ['konijn', 'cavia'],
      maxDieren: 2,
      ervaringNiveau: 'veel',
      notities: 'Gepensioneerd dierenarts. Ideaal voor zieke of herstellende dieren. Heeft medische uitrusting thuis.',
      actief: true,
    },
    {
      asielId: asielHaarlem.id,
      naam: 'Familie Smit',
      email: 'smit.pleeggezin@gmail.com',
      telefoon: '06-99887766',
      adres: 'Grote Markt 7',
      stad: 'Haarlem',
      soortVoorkeur: ['hond', 'kat', 'konijn'],
      maxDieren: 2,
      ervaringNiveau: 'veel',
      notities: 'Boerderij buiten de stad. Ruimte voor grotere honden. Al 5 jaar actief pleeggezin voor Dierenbescherming Haarlem.',
      actief: true,
    },
    {
      asielId: asielHaarlem.id,
      naam: 'Lisanne Vermeer',
      email: 'l.vermeer@gmail.com',
      telefoon: '06-44332211',
      adres: 'Nieuwe Gracht 22',
      stad: 'Haarlem',
      soortVoorkeur: ['kat'],
      maxDieren: 2,
      ervaringNiveau: 'beetje',
      notities: 'Studente diergeneeskunde. Neemt pleegkatten op tijdens vakanties en weekenden. Heeft ervaring met socialisatie.',
      actief: true,
    },
  ]).returning()
  console.log('✓ 6 pleeggezinnen aangemaakt')

  // --- Pleegplaatsingen (koppel bestaande dieren aan pleeggezinnen) ---
  // Haal de eerste paar dieren op voor plaatsingen
  const alleDieren = await db.select({ id: dieren.id, naam: dieren.naam }).from(dieren).limit(4)
  if (alleDieren.length >= 3) {
    await db.insert(pleegplaatsingen).values([
      {
        dierId: alleDieren[0].id,
        pleeggezinId: pgFamilie1.id,
        startdatum: new Date('2026-01-15'),
        notities: 'Loopt goed. Dier is al flink gesocialiseerd.',
        actief: true,
      },
      {
        dierId: alleDieren[1].id,
        pleeggezinId: pgFamilie2.id,
        startdatum: new Date('2026-02-03'),
        notities: 'Schuwe kat, wordt steeds vertrouwder.',
        actief: true,
      },
      {
        dierId: alleDieren[2].id,
        pleeggezinId: pgFamilie5.id,
        startdatum: new Date('2026-03-01'),
        notities: 'Past goed in het gezin.',
        actief: true,
      },
    ])
    console.log('✓ 3 pleegplaatsingen aangemaakt')
  }

  // --- Wachtlijst ---
  await db.insert(wachtlijst).values([
    {
      naam: 'Sophie Vermeer',
      email: 'sophie.vermeer@gmail.com',
      soort: 'hond',
      ras: 'Golden Retriever',
      leeftijdVoorkeur: 'Pup (0-1 jaar)',
      notities: 'Gezin met 2 kinderen, grote tuin. Zijn al eerder hondeneigenaar geweest.',
      actief: true,
      aangemeldOp: new Date('2026-01-08'),
    },
    {
      naam: 'Thomas de Groot',
      email: 't.degroot@outlook.com',
      soort: 'kat',
      ras: 'Maine Coon',
      leeftijdVoorkeur: 'Kitten (0-1 jaar)',
      notities: 'Appartement in Amsterdam. Werkt thuis, heeft veel tijd voor een dier.',
      actief: true,
      aangemeldOp: new Date('2026-01-15'),
    },
    {
      naam: 'Lena van Dijk',
      email: 'lena.vandijk@hotmail.com',
      soort: 'konijn',
      ras: null,
      leeftijdVoorkeur: 'Jong (1-3 jaar)',
      notities: 'Wil graag twee konijnen samen. Heeft buitenverblijf van 6m².',
      actief: true,
      aangemeldOp: new Date('2026-02-03'),
    },
    {
      naam: 'Mark Janssen',
      email: 'mark.janssen@gmail.com',
      soort: 'hond',
      ras: 'Labrador',
      leeftijdVoorkeur: 'Volwassen (3-7 jaar)',
      notities: 'Actieve sporter, loopt dagelijks 10km. Zoekt een energieke hond.',
      actief: true,
      aangemeldOp: new Date('2026-02-11'),
    },
    {
      naam: 'Anna Bakker',
      email: 'a.bakker@gmail.com',
      soort: 'kat',
      ras: 'Ragdoll',
      leeftijdVoorkeur: 'Maakt niet uit',
      notities: 'Gepensioneerd, is altijd thuis. Heeft eerder 2 katten gehad.',
      actief: true,
      aangemeldOp: new Date('2026-02-19'),
    },
    {
      naam: 'Pieter van Houten',
      email: 'p.vanhouten@kpn.nl',
      soort: 'cavia',
      ras: null,
      leeftijdVoorkeur: 'Jong (1-3 jaar)',
      notities: 'Voor dochter (8 jaar). Eerste huisdier. Hebben een grote slaapkamer vrij.',
      actief: true,
      aangemeldOp: new Date('2026-03-02'),
    },
    {
      naam: 'Sara El Amrani',
      email: 'sara.elamrani@gmail.com',
      soort: 'hond',
      ras: 'Border Collie',
      leeftijdVoorkeur: 'Jong (1-3 jaar)',
      notities: 'Woont vlakbij het Vondelpark. Zoekt een slimme, trainbare hond.',
      actief: true,
      aangemeldOp: new Date('2026-03-10'),
    },
    {
      naam: 'Bas Hendriks',
      email: 'b.hendriks@outlook.com',
      soort: 'vogel',
      ras: 'Parkiet',
      leeftijdVoorkeur: 'Maakt niet uit',
      notities: 'Heeft thuis al een parkiet, zoekt een maatje erbij.',
      actief: true,
      aangemeldOp: new Date('2026-03-14'),
    },
  ])
  console.log('✓ 8 wachtlijst aanmeldingen aangemaakt')

  // --- Medische records (aankomende behandelingen voor medisch overzicht) ---
  const dierenVoorMedisch = await db.select({ id: dieren.id, naam: dieren.naam }).from(dieren).limit(8)
  if (dierenVoorMedisch.length >= 5) {
    await db.insert(medischeRecords).values([
      // Vandaag & achterstallig (volgendeDatum <= nu)
      {
        dierId: dierenVoorMedisch[0].id,
        type: 'vaccinatie',
        titel: 'Jaarlijkse DHPP-vaccinatie',
        beschrijving: 'Combinatievaccin tegen distemper, hepatitis, parvo en parainfluenza.',
        datum: new Date('2025-03-20'),
        volgendeDatum: new Date('2026-03-18'), // achterstallig
        status: 'aankomend',
        uitvoerder: 'Dierenarts Smeets',
      },
      {
        dierId: dierenVoorMedisch[1].id,
        type: 'ontworming',
        titel: 'Kwartaalse ontworming',
        beschrijving: 'Breedspectrum ontworming met Milbemax.',
        datum: new Date('2025-12-20'),
        volgendeDatum: new Date('2026-03-19'), // gisteren — achterstallig
        status: 'aankomend',
        uitvoerder: 'Asiel medewerker',
      },
      // Deze week
      {
        dierId: dierenVoorMedisch[2].id,
        type: 'check-up',
        titel: 'Nacontrole na castratie',
        beschrijving: 'Wondcontrole en hechtingen verwijderen.',
        datum: new Date('2026-03-10'),
        volgendeDatum: new Date('2026-03-24'),
        status: 'aankomend',
        uitvoerder: 'Dierenarts van Rijn',
      },
      {
        dierId: dierenVoorMedisch[3].id,
        type: 'vaccinatie',
        titel: 'Rabiësvaccinatie',
        beschrijving: 'Verplicht voor dieren die mogelijk worden geadopteerd naar het buitenland.',
        datum: new Date('2025-03-25'),
        volgendeDatum: new Date('2026-03-25'),
        status: 'aankomend',
        uitvoerder: 'Dierenarts Smeets',
      },
      {
        dierId: dierenVoorMedisch[4].id,
        type: 'behandeling',
        titel: 'Tandreiniging onder narcose',
        beschrijving: 'Tandsteen verwijderen en gebitsbeoordeling.',
        datum: new Date('2026-03-26'),
        volgendeDatum: new Date('2026-03-26'),
        status: 'aankomend',
        uitvoerder: 'Dierenartspraktijk Noord',
      },
      // Komende periode (> 7 dagen, < 40 dagen)
      {
        dierId: dierenVoorMedisch[0].id,
        type: 'vlooienbehandeling',
        titel: 'Maandelijkse vlooien- & tekenbehandeling',
        beschrijving: 'Frontline spot-on behandeling.',
        datum: new Date('2026-02-20'),
        volgendeDatum: new Date('2026-04-05'),
        status: 'aankomend',
        uitvoerder: 'Asiel medewerker',
      },
      {
        dierId: dierenVoorMedisch[1].id,
        type: 'check-up',
        titel: 'Algemene gezondheidscontrole',
        beschrijving: 'Periodieke check voor adoptie-klaring.',
        datum: new Date('2026-01-10'),
        volgendeDatum: new Date('2026-04-10'),
        status: 'aankomend',
        uitvoerder: 'Dierenarts van Rijn',
      },
      {
        dierId: dierenVoorMedisch[2].id,
        type: 'vaccinatie',
        titel: 'Kattengriep vaccinatie',
        beschrijving: 'Herhalingsvaccinatie RCP.',
        datum: new Date('2025-04-15'),
        volgendeDatum: new Date('2026-04-15'),
        status: 'aankomend',
        uitvoerder: 'Dierenarts Smeets',
      },
    ])
    console.log('✓ 8 medische records aangemaakt')
  }

  // --- Gesprekken & Berichten ---
  const dierenVoorChat = await db.select({ id: dieren.id, naam: dieren.naam, asielId: dieren.asielId })
    .from(dieren).where(eq(dieren.asielId, asielAmsterdam.id)).limit(6)

  if (dierenVoorChat.length >= 5) {
    const [g1, g2, g3, g4, g5] = await db.insert(gesprekken).values([
      { userId: userSophie.id, dierId: dierenVoorChat[0].id, asielId: asielAmsterdam.id, laasteBerichtOp: new Date('2026-03-19T14:32:00'), afspraakDatum: new Date('2026-03-25T10:00:00'), afspraakBevestigd: true },
      { userId: userThomas.id, dierId: dierenVoorChat[1].id, asielId: asielAmsterdam.id, laasteBerichtOp: new Date('2026-03-18T09:15:00') },
      { userId: demoUser.id,   dierId: dierenVoorChat[2].id, asielId: asielAmsterdam.id, laasteBerichtOp: new Date('2026-03-17T16:45:00') },
      { userId: userLena.id,   dierId: dierenVoorChat[3].id, asielId: asielAmsterdam.id, laasteBerichtOp: new Date('2026-03-15T11:20:00') },
      { userId: userAnna.id,   dierId: dierenVoorChat[4].id, asielId: asielAmsterdam.id, laasteBerichtOp: new Date('2026-03-10T08:00:00') },
    ]).returning()

    await db.insert(berichten).values([
      // Gesprek 1 — Sophie (afspraak gepland, 2 ongelezen van adoptant)
      { gesprekId: g1.id, verzenderType: 'adoptant', verzenderId: userSophie.id,   inhoud: 'Hallo! Ik ben geïnteresseerd in ' + dierenVoorChat[0].naam + '. Kunnen we een afspraak maken?', gelezen: true,  verstuurdOp: new Date('2026-03-17T10:00:00') },
      { gesprekId: g1.id, verzenderType: 'asiel',    verzenderId: 1,               inhoud: 'Hoi Sophie! Wat leuk dat je interesse hebt. We plannen graag een kennismaking. Wanneer komt jou uit?', gelezen: true,  verstuurdOp: new Date('2026-03-17T14:00:00') },
      { gesprekId: g1.id, verzenderType: 'adoptant', verzenderId: userSophie.id,   inhoud: 'Volgende week dinsdag om 10:00 zou perfect zijn!', gelezen: true,  verstuurdOp: new Date('2026-03-18T09:30:00') },
      { gesprekId: g1.id, verzenderType: 'asiel',    verzenderId: 1,               inhoud: 'Super, afspraak staat gepland op dinsdag 25 maart om 10:00 bij ons asiel. Tot dan!', gelezen: true,  verstuurdOp: new Date('2026-03-18T11:00:00') },
      { gesprekId: g1.id, verzenderType: 'adoptant', verzenderId: userSophie.id,   inhoud: 'Geweldig! Mag ik mijn partner meenemen?', gelezen: false, verstuurdOp: new Date('2026-03-19T14:10:00') },
      { gesprekId: g1.id, verzenderType: 'adoptant', verzenderId: userSophie.id,   inhoud: 'En is er iets wat we mee moeten nemen naar de kennismaking?', gelezen: false, verstuurdOp: new Date('2026-03-19T14:32:00') },

      // Gesprek 2 — Thomas (1 ongelezen)
      { gesprekId: g2.id, verzenderType: 'adoptant', verzenderId: userThomas.id,   inhoud: 'Goedemiddag, ik las dat ' + dierenVoorChat[1].naam + ' goed omgaat met andere katten. Klopt dat?', gelezen: true,  verstuurdOp: new Date('2026-03-16T13:00:00') },
      { gesprekId: g2.id, verzenderType: 'asiel',    verzenderId: 1,               inhoud: 'Hoi Thomas! Ja klopt, ' + dierenVoorChat[1].naam + ' is heel sociaal. Heb je al andere katten thuis?', gelezen: true,  verstuurdOp: new Date('2026-03-16T15:30:00') },
      { gesprekId: g2.id, verzenderType: 'adoptant', verzenderId: userThomas.id,   inhoud: 'Nog niet, maar ik overweeg er twee te nemen. Zou ' + dierenVoorChat[1].naam + ' daar blij mee zijn?', gelezen: false, verstuurdOp: new Date('2026-03-18T09:15:00') },

      // Gesprek 3 — Maya/demo (alles gelezen)
      { gesprekId: g3.id, verzenderType: 'adoptant', verzenderId: demoUser.id,     inhoud: 'Hoi! Ik heb de AI-matching gedaan en ' + dierenVoorChat[2].naam + ' kwam als 94% match uit. Kunnen we kennismaken?', gelezen: true, verstuurdOp: new Date('2026-03-15T10:00:00') },
      { gesprekId: g3.id, verzenderType: 'asiel',    verzenderId: 1,               inhoud: 'Hoi Maya! Wat geweldig, ' + dierenVoorChat[2].naam + ' is inderdaad een topkandidaat voor jou. Stuur ons je beschikbaarheid!', gelezen: true, verstuurdOp: new Date('2026-03-15T14:00:00') },
      { gesprekId: g3.id, verzenderType: 'adoptant', verzenderId: demoUser.id,     inhoud: 'Ik ben beschikbaar in het weekend van 22 of 23 maart. Wat zijn de openingstijden?', gelezen: true, verstuurdOp: new Date('2026-03-17T16:45:00') },

      // Gesprek 4 — Lena (alles gelezen, afgesloten)
      { gesprekId: g4.id, verzenderType: 'adoptant', verzenderId: userLena.id,     inhoud: 'Heeft ' + dierenVoorChat[3].naam + ' al eerder bij kinderen gewoond?', gelezen: true, verstuurdOp: new Date('2026-03-14T09:00:00') },
      { gesprekId: g4.id, verzenderType: 'asiel',    verzenderId: 1,               inhoud: 'Hoi Lena! Nee, maar ' + dierenVoorChat[3].naam + ' is heel zacht van karakter. We raden een kennismaking aan met de kinderen erbij.', gelezen: true, verstuurdOp: new Date('2026-03-14T11:00:00') },
      { gesprekId: g4.id, verzenderType: 'adoptant', verzenderId: userLena.id,     inhoud: 'Bedankt voor de info. We komen graag langs met de kinderen!', gelezen: true, verstuurdOp: new Date('2026-03-15T11:20:00') },

      // Gesprek 5 — Anna (ouder gesprek)
      { gesprekId: g5.id, verzenderType: 'adoptant', verzenderId: userAnna.id,     inhoud: 'Ik ben op zoek naar een rustige kat. Is ' + dierenVoorChat[4].naam + ' geschikt voor iemand die al op leeftijd is?', gelezen: true, verstuurdOp: new Date('2026-03-09T15:00:00') },
      { gesprekId: g5.id, verzenderType: 'asiel',    verzenderId: 1,               inhoud: 'Absoluut! ' + dierenVoorChat[4].naam + ' houdt van rustige omgevingen en is dol op aandacht. Een perfecte match!', gelezen: true, verstuurdOp: new Date('2026-03-10T08:00:00') },
    ])
    console.log('✓ 5 gesprekken met berichten aangemaakt (3 ongelezen)')
  }

  // --- Adoptieverzoeken ---
  const dierenVoorAdoptie = await db.select({ id: dieren.id, naam: dieren.naam })
    .from(dieren).where(eq(dieren.asielId, asielAmsterdam.id)).limit(9)

  if (dierenVoorAdoptie.length >= 6) {
    await db.insert(adopties).values([
      // Openstaand — actie vereist
      { userId: userSophie.id, dierId: dierenVoorAdoptie[0].id, asielId: asielAmsterdam.id, status: 'aangevraagd', aangevraagdOp: new Date('2026-03-19T10:00:00') },
      { userId: userThomas.id, dierId: dierenVoorAdoptie[1].id, asielId: asielAmsterdam.id, status: 'aangevraagd', aangevraagdOp: new Date('2026-03-18T14:30:00') },
      { userId: demoUser.id,   dierId: dierenVoorAdoptie[2].id, asielId: asielAmsterdam.id, status: 'aangevraagd', aangevraagdOp: new Date('2026-03-17T09:15:00') },
      // Geschiedenis
      { userId: userLena.id,   dierId: dierenVoorAdoptie[3].id, asielId: asielAmsterdam.id, status: 'goedgekeurd', aangevraagdOp: new Date('2026-03-10T11:00:00') },
      { userId: userAnna.id,   dierId: dierenVoorAdoptie[4].id, asielId: asielAmsterdam.id, status: 'afgerond',    aangevraagdOp: new Date('2026-02-20T09:00:00'), adoptieDatum: new Date('2026-03-05T14:00:00') },
      { userId: userMark.id,   dierId: dierenVoorAdoptie[5].id, asielId: asielAmsterdam.id, status: 'afgerond',    aangevraagdOp: new Date('2026-02-01T10:00:00'), adoptieDatum: new Date('2026-02-15T14:00:00') },
      { userId: demoUser.id,   dierId: dierenVoorAdoptie[6 < dierenVoorAdoptie.length ? 6 : 5].id, asielId: asielAmsterdam.id, status: 'afgewezen', aangevraagdOp: new Date('2026-01-15T13:00:00') },
      { userId: userThomas.id, dierId: dierenVoorAdoptie[7 < dierenVoorAdoptie.length ? 7 : 4].id, asielId: asielAmsterdam.id, status: 'geannuleerd', aangevraagdOp: new Date('2026-01-05T09:00:00') },
    ])
    console.log('✓ 8 adoptieverzoeken aangemaakt (3 open, 5 geschiedenis)')
  }

  console.log('\n✅ Demo-data succesvol aangemaakt!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Demo account:')
  console.log('   E-mail:     demo@pootgelukkig.nl')
  console.log('   Wachtwoord: Demo1234!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏠 4 Noord-Holland asielen')
  console.log('   • Dierenasiel Amsterdam')
  console.log('   • Dierenbescherming Haarlem')
  console.log('   • Asiel De Schuilplaats (Zaandam)')
  console.log('   • Dierenopvang Alkmaar')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🐾 35 dieren:')
  console.log('   • 15 honden (van Chihuahua tot Sint-Bernard)')
  console.log('   • 12 katten (van Bengal tot Ragdoll)')
  console.log('   •  4 konijnen')
  console.log('   •  2 cavia\'s')
  console.log('   •  2 vogels')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed().catch(console.error)
