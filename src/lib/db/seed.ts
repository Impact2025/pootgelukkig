/**
 * Seed script — vult de database met realistische ImpactOS-testdata
 * Uitvoeren: npm run db:seed
 */

import { db } from './index'
import {
  organisaties, dossiers, clienten, begeleidingen,
  users, aiContentQueue, aiRollenConfig,
} from './schema'
import bcryptjs from 'bcryptjs'
import { sql } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Database leeggooien en opnieuw vullen met ImpactOS-testdata...')

  // --- Opschonen in juiste volgorde (foreign keys) ---
  await db.execute(sql`DELETE FROM ai_content_queue`)
  await db.execute(sql`DELETE FROM ai_rollen_config`)
  await db.execute(sql`DELETE FROM nazorg_dagen`)
  await db.execute(sql`DELETE FROM begeleidingen`)
  await db.execute(sql`DELETE FROM clienten`)
  await db.execute(sql`DELETE FROM dossiers`)
  await db.execute(sql`DELETE FROM users`)
  await db.execute(sql`DELETE FROM organisaties`)
  console.log('✓ Database leeggemaakt')

  // --- Organisatie ---
  const [organisatie] = await db.insert(organisaties).values({
    naam: 'Stichting Welzijn & Toekomst',
    slug: 'welzijn-toekomst',
    kvkNummer: '61234567',
    contactEmail: 'info@welzijn-toekomst.nl',
    website: 'www.welzijn-toekomst.nl',
    telefoon: '023-1234567',
    status: 'actief',
    bron: 'handmatig',
    wervingStatus: 'aangesloten',
  }).returning()
  console.log(`✓ Organisatie aangemaakt: ${organisatie.naam} (${organisatie.slug})`)

  // --- Demo-inlogaccount voor deze organisatie ---
  const wachtwoordHash = await bcryptjs.hash('Demo1234!', 10)
  await db.insert(users).values({
    naam: 'Demo Beheerder',
    email: 'demo@welzijn-toekomst.nl',
    wachtwoordHash,
    rol: 'asiel',
    organisatieId: organisatie.id,
    profielVoltooid: true,
  })
  console.log('✓ Demo-inlogaccount aangemaakt')

  // --- Dossiers ---
  const [dossierWmo, dossierParticipatie, dossierJeugd] = await db.insert(dossiers).values([
    {
      organisatieId: organisatie.id,
      dossierNummer: '2026-014',
      titel: 'Wmo-begeleiding zelfstandig wonen',
      categorie: 'wmo',
      status: 'actief',
      samenvatting: 'Ambulante Wmo-begeleiding gericht op het aanleren van vaardigheden voor zelfstandig wonen na uitstroom uit beschermd wonen. Wekelijkse huisbezoeken, focus op dagstructuur en financiën.',
      intakeData: { ondersteuningsniveau: 'matig', frequentie: 'wekelijks', startdatum: '2026-01-13' },
      vertrouwelijk: true,
    },
    {
      organisatieId: organisatie.id,
      dossierNummer: '2026-021',
      titel: 'Participatietraject richting werk',
      categorie: 'participatie',
      status: 'in_behandeling',
      samenvatting: 'Traject gericht op arbeidsritme en re-integratie via een leerwerkplek bij een lokale sociale onderneming. Deelnemer doorloopt een 12-weeks programma met wekelijkse coachingsgesprekken.',
      intakeData: { doelgroep: 'participatiewet', leerwerkplek: 'Kringloopwinkel De Kans', duurWeken: 12 },
      vertrouwelijk: true,
    },
    {
      organisatieId: organisatie.id,
      dossierNummer: '2026-033',
      titel: 'Jeugdhulp gezinsondersteuning',
      categorie: 'jeugd',
      status: 'intake',
      samenvatting: 'Aanmelding voor ambulante gezinsondersteuning na signalen van oplopende spanning thuis. Intakegesprek gepland; nog geen hulpverleningsplan vastgesteld.',
      intakeData: { aanmelder: 'huisarts', gezinssamenstelling: 'eenoudergezin, 2 kinderen', urgentie: 'normaal' },
      vertrouwelijk: true,
    },
  ]).returning()
  console.log('✓ 3 dossiers aangemaakt (Wmo, participatie, jeugdhulp)')

  // --- Cliënten ---
  const [clientA, clientB, clientC] = await db.insert(clienten).values([
    {
      organisatieId: organisatie.id,
      voornaam: 'Marloes',
      achternaam: 'de Groot',
      email: 'marloes.degroot@example.nl',
      telefoon: '06-11223344',
      geboortedatum: new Date('1994-05-12'),
      hulpvraagOmschrijving: 'Heeft ondersteuning nodig bij het opbouwen van dagstructuur en het leren omgaan met financiën na uitstroom uit beschermd wonen.',
      profielData: { woonsituatie: 'zelfstandig, net verhuisd', netwerk: 'beperkt' },
      status: 'gematcht',
    },
    {
      organisatieId: organisatie.id,
      voornaam: 'Youssef',
      achternaam: 'El Amrani',
      email: 'youssef.elamrani@example.nl',
      telefoon: '06-22334455',
      geboortedatum: new Date('1988-11-03'),
      hulpvraagOmschrijving: 'Zoekt begeleiding naar betaald werk na langdurige werkloosheid; wil eerst arbeidsritme opbouwen via een leerwerkplek.',
      profielData: { werkervaring: 'logistiek', beschikbaarheid: '32 uur/week' },
      status: 'gematcht',
    },
    {
      organisatieId: organisatie.id,
      voornaam: 'Fatima',
      achternaam: 'Yılmaz',
      email: 'fatima.yilmaz@example.nl',
      telefoon: '06-33445566',
      geboortedatum: new Date('1990-02-27'),
      hulpvraagOmschrijving: 'Alleenstaande moeder met oplopende spanningen thuis; vraagt om ambulante ondersteuning voor het gezin.',
      profielData: { kinderen: 2, verwijzer: 'huisarts' },
      status: 'aangemeld',
    },
  ]).returning()
  console.log('✓ 3 cliënten aangemaakt')

  // --- Begeleidingen (koppeling dossier ↔ cliënt) ---
  await db.insert(begeleidingen).values([
    {
      dossierId: dossierWmo.id,
      clientId: clientA.id,
      organisatieId: organisatie.id,
      startDatum: new Date('2026-01-13'),
      status: 'actief',
      evaluatieNotities: 'Eerste evaluatie na 4 weken: dagstructuur verbetert, financiën blijven aandachtspunt.',
    },
    {
      dossierId: dossierParticipatie.id,
      clientId: clientB.id,
      organisatieId: organisatie.id,
      startDatum: new Date('2026-02-03'),
      status: 'actief',
      evaluatieNotities: 'Deelnemer is gestart op de leerwerkplek, komt aanwezigheidsafspraken goed na.',
    },
  ])
  console.log('✓ 2 begeleidingen aangemaakt')

  // --- AI-rollen activeren voor deze organisatie ---
  await db.insert(aiRollenConfig).values([
    { organisatieId: organisatie.id, rol: 'fundraising', actief: true },
    { organisatieId: organisatie.id, rol: 'rapportage', actief: true },
    { organisatieId: organisatie.id, rol: 'social', actief: true },
    { organisatieId: organisatie.id, rol: 'vrijwilligers', actief: true },
    { organisatieId: organisatie.id, rol: 'chat', actief: true },
  ])
  console.log('✓ 5 AI-rollen geactiveerd (Sam, Mila, Conny, Bram, Samen)')

  // --- Wachtrij-items (human-in-the-loop, status ALTIJD 'pending') ---
  await db.insert(aiContentQueue).values([
    {
      organisatieId: organisatie.id,
      rol: 'fundraising',
      type: 'subsidie',
      titel: 'Concept subsidieaanvraag — Wmo-begeleiding zelfstandig wonen',
      content: `Aan: Gemeente Haarlem, afdeling Sociaal Domein
Betreft: Subsidieaanvraag Wmo-begeleiding zelfstandig wonen 2026

Geachte heer/mevrouw,

Stichting Welzijn & Toekomst vraagt subsidie aan voor de voortzetting van ons traject
"Zelfstandig Wonen", gericht op inwoners die uitstromen uit beschermd wonen.

In het lopende dossier (2026-014) begeleiden wij momenteel 1 deelnemer wekelijks bij het
opbouwen van dagstructuur en financiële zelfredzaamheid. De eerste evaluatie laat een
duidelijke verbetering zien in dagstructuur; financiën blijven een aandachtspunt waarop
wij de begeleiding intensiveren.

Gevraagd bedrag: € 18.500 voor 2026, ter dekking van 0,4 fte ambulant begeleider.

Wij lichten deze aanvraag graag toe in een persoonlijk gesprek.

Met vriendelijke groet,
Stichting Welzijn & Toekomst`,
      status: 'pending',
      metadata: { gemaaktDoor: 'ai', model: 'anthropic/claude-3.5-sonnet', dossierId: dossierWmo.id },
    },
    {
      organisatieId: organisatie.id,
      rol: 'rapportage',
      type: 'rapportage',
      titel: 'Impactverslag Q1 2026',
      content: `IMPACTVERSLAG — Stichting Welzijn & Toekomst — Q1 2026

TRAJECTEN
- 3 actieve dossiers (Wmo: 1, participatie: 1, jeugdhulp: 1 in intake)
- 2 lopende begeleidingen, beide op schema

RESULTATEN
- Wmo-traject: deelnemer toont meetbare vooruitgang in dagstructuur na 4 weken begeleiding
- Participatietraject: deelnemer succesvol gestart op leerwerkplek, komt afspraken na
- Jeugdhulp: intake in behandeling, hulpverleningsplan wordt deze maand vastgesteld

RISICO'S & AANDACHTSPUNTEN
- Financiële zelfredzaamheid blijft aandachtspunt binnen het Wmo-traject
- Capaciteit voor nieuwe aanmeldingen jeugdhulp is beperkt bij verdere instroom

Dit verslag is een concept en wacht op goedkeuring voordat het naar de gemeente gaat.`,
      status: 'pending',
      metadata: { gemaaktDoor: 'ai', model: 'anthropic/claude-3.5-sonnet', periode: '2026-Q1' },
    },
  ])
  console.log("✓ 2 wachtrij-items aangemaakt (status 'pending', wachten op goedkeuring)")

  console.log('\n✅ ImpactOS demo-data succesvol aangemaakt!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Demo account:')
  console.log('   E-mail:     demo@welzijn-toekomst.nl')
  console.log('   Wachtwoord: Demo1234!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`🏢 Organisatie: ${organisatie.naam} (${organisatie.slug})`)
  console.log('📁 3 dossiers (Wmo, participatie, jeugdhulp)')
  console.log('🧑‍🤝‍🧑 3 cliënten')
  console.log('🔗 2 begeleidingen')
  console.log('🤖 5 AI-rollen geactiveerd, 2 items in de goedkeuringswachtrij')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

seed().catch(console.error)
