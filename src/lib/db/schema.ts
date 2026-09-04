import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  json,
  jsonb,
  serial,
  pgEnum,
  real,
  numeric,
  varchar,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =================== ENUMS ===================

export const animalSpeciesEnum = pgEnum('animal_species', [
  'hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig'
])

export const woningTypeEnum = pgEnum('woning_type', [
  'appartement', 'huis_zonder_tuin', 'huis_met_tuin', 'boerderij'
])

export const activiteitNiveauEnum = pgEnum('activiteit_niveau', [
  'laag', 'normaal', 'hoog', 'zeer_hoog'
])

export const berichtVerzenderEnum = pgEnum('bericht_verzender', [
  'adoptant', 'asiel', 'systeem'
])

export const medischStatusEnum = pgEnum('medisch_status', [
  'aankomend', 'voltooid', 'gemist', 'geannuleerd'
])

export const afspraakTypeEnum = pgEnum('afspraak_type', ['kennismaking', 'thuischeck'])

export const afspraakStatusEnum = pgEnum('afspraak_status', [
  'aangevraagd', 'bevestigd', 'afgerond', 'geannuleerd'
])

// Wervingsstatus voor geïmporteerde organisaties (cold-outreach flow)
export const wervingStatusEnum = pgEnum('werving_status', [
  'nieuw',        // gevonden door import, nog niet benaderd
  'uitgenodigd',  // uitnodigingsmail verstuurd
  'overgeslagen', // handmatig overgeslagen, niet mailen
  'aangesloten',  // organisatie heeft zich aangemeld op het platform
])

// Status van een verzonden e-mail (mail_log)
export const mailStatusEnum = pgEnum('mail_status', ['verzonden', 'gefaald', 'geopend', 'gebounced'])

// CRM
export const crmContactTypeEnum = pgEnum('crm_contact_type', [
  'lead', 'asiel', 'adoptant', 'partner', 'overig',
  // Organisatie-CRM (/admin/crm): relaties van een organisatie zelf met haar omgeving.
  'gemeente', 'fondsenverstrekker', 'zorgpartner',
])
export const crmDealFaseEnum = pgEnum('crm_deal_fase', ['nieuw', 'contact', 'onderhandeling', 'gewonnen', 'verloren'])
export const crmActiviteitTypeEnum = pgEnum('crm_activiteit_type', ['notitie', 'mail', 'bel', 'taak', 'afspraak'])

// Blog
export const blogStatusEnum = pgEnum('blog_status', ['concept', 'gepubliceerd', 'gearchiveerd'])

// Helpdesk (organisatie-inbox voor contactformulieren / web-intakes)
export const helpdeskBronEnum = pgEnum('helpdesk_bron', ['contactformulier', 'webintake', 'widget'])
export const helpdeskStatusEnum = pgEnum('helpdesk_status', ['open', 'concept_klaar', 'beantwoord', 'gesloten'])

// Coupons (marketingcodes)
export const couponTypeEnum = pgEnum('coupon_type', ['procent', 'vast'])

// --- Multi-tenant kernentiteiten (organisaties / dossiers / clienten / begeleidingen) ---

export const organisatieStatusEnum = pgEnum('organisatie_status', ['proef', 'actief', 'gearchiveerd'])

// Voortgang van de chat-onboarding (intake + systeeminrichting bij aanmelding)
export const onboardingStatusEnum = pgEnum('onboarding_status', [
  'niet_gestart', 'bezig', 'afgerond', 'overgeslagen',
])

// Wie een onboarding-bericht heeft verstuurd
export const onboardingAfzenderEnum = pgEnum('onboarding_afzender', ['gebruiker', 'assistent'])

export const dossierCategorieEnum = pgEnum('dossier_categorie', [
  'wmo', 'participatie', 'jeugd', 'reintegratie', 'overig',
])

export const dossierStatusEnum = pgEnum('dossier_status', [
  'intake', 'actief', 'in_behandeling', 'afgerond',
])

export const clientStatusEnum = pgEnum('client_status', ['aangemeld', 'gematcht', 'afgerond'])

export const begeleidingStatusEnum = pgEnum('begeleiding_status', [
  'gepland', 'actief', 'afgerond', 'gestopt',
])

// =================== USERS (Adoptanten) ===================

export const userRolEnum = pgEnum('user_rol', ['adoptant', 'asiel', 'admin'])

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  wachtwoordHash: text('wachtwoord_hash'),
  avatarUrl: text('avatar_url'),
  stad: varchar('stad', { length: 100 }),
  postcode: varchar('postcode', { length: 10 }),
  lat: real('lat'),
  lng: real('lng'),
  rol: userRolEnum('rol').default('adoptant').notNull(),
  organisatieId: text('organisatie_id'), // alleen gevuld voor rol 'asiel'/'admin' binnen een organisatie
  profielVoltooid: boolean('profiel_voltooid').default(false).notNull(),
  aangemeldOp: timestamp('aangemeld_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== ADOPTER PROFILES ===================

export const adopterProfielen = pgTable('adopter_profielen', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  woningType: woningTypeEnum('woning_type'),
  heeftTuin: boolean('heeft_tuin').default(false),
  tuinOppervlakte: varchar('tuin_oppervlakte', { length: 50 }), // "klein", "normaal", "groot"
  activiteitNiveau: activiteitNiveauEnum('activiteit_niveau'),
  aantalVolwassenen: integer('aantal_volwassenen').default(1),
  aantalKinderen: integer('aantal_kinderen').default(0),
  jongsteKindLeeftijd: integer('jongste_kind_leeftijd'), // in jaren
  andereDieren: json('andere_dieren').$type<string[]>().default([]),
  werkUrenPerDag: integer('werk_uren_per_dag').default(8),
  ervaringNiveau: varchar('ervaring_niveau', { length: 50 }), // "geen", "beetje", "veel"
  budgetDierenarts: varchar('budget_dierenarts', { length: 50 }), // "beperkt", "normaal", "ruim"
  allergieën: json('allergieën').$type<string[]>().default([]),
  diersoortVoorkeur: json('diersoort_voorkeur').$type<string[]>().default([]),
  leeftijdVoorkeur: varchar('leeftijd_voorkeur', { length: 50 }), // "pup", "jong", "volwassen", "senior", "maakt_niet_uit"
  extraWensen: text('extra_wensen'),
  // Hash van de intake-antwoorden — detecteert of profiel echt veranderd is
  profielHash: varchar('profiel_hash', { length: 24 }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== ORGANISATIES (B2B tenants, voorheen 'asielen') ===================

export const organisaties = pgTable('organisaties', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  naam: varchar('naam', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 160 }).notNull().unique(), // voor routing/subdomeinen
  kvkNummer: varchar('kvk_nummer', { length: 20 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  telefoon: varchar('telefoon', { length: 20 }),
  status: organisatieStatusEnum('status').default('proef').notNull(),

  // Werving / herkomst — gevuld door de organisaties-import cron
  bron: varchar('bron', { length: 50 }).default('handmatig').notNull(), // 'handmatig' | 'import'
  wervingStatus: wervingStatusEnum('werving_status').default('aangesloten').notNull(),
  uitnodigingVerstuurdOp: timestamp('uitnodiging_verstuurd_op'),

  // Organisatieprofiel — opgehaald tijdens de chat-onboarding (src/lib/ai/onboarding.ts).
  // Elk veld wordt los, direct na het antwoord, weggeschreven — nooit pas aan het eind —
  // zodat een afgebroken gesprek geen dataverlies geeft en de AI-collega's er meteen mee kunnen werken.
  rechtsvorm: varchar('rechtsvorm', { length: 120 }),
  werkveldCategorieen: jsonb('werkveld_categorieen').$type<string[]>().default([]),
  gemeenten: jsonb('gemeenten').$type<string[]>().default([]),
  teamgrootte: integer('teamgrootte'),
  vrijwilligersAantal: integer('vrijwilligers_aantal'),
  grootsteKnelpunt: text('grootste_knelpunt'),
  toneOfVoice: varchar('tone_of_voice', { length: 60 }),
  onboardingStatus: onboardingStatusEnum('onboarding_status').default('niet_gestart').notNull(),
  onboardingAfgerondOp: timestamp('onboarding_afgerond_op'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// =================== ONBOARDING BERICHTEN (chat-transcript, resumable) ===================
// Elk bericht wordt meteen bij verzending/ontvangst opgeslagen — het gesprek kan altijd
// hervat worden vanaf het laatst bewaarde punt, ook na een paginaherlaad of sessiewissel.

export const onboardingBerichten = pgTable('onboarding_berichten', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  afzender: onboardingAfzenderEnum('afzender').notNull(),
  inhoud: text('inhoud').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('onboarding_berichten_organisatie_id_idx').on(t.organisatieId),
}))

// =================== DOSSIERS (zorg-/hulpverleningstrajecten, voorheen 'dieren') ===================

export const dossiers = pgTable('dossiers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  dossierNummer: varchar('dossier_nummer', { length: 60 }).notNull(),
  titel: varchar('titel', { length: 255 }).notNull(),
  categorie: dossierCategorieEnum('categorie').default('overig').notNull(),
  status: dossierStatusEnum('status').default('intake').notNull(),
  samenvatting: text('samenvatting'),
  intakeData: jsonb('intake_data').$type<Record<string, unknown>>().default({}),
  vertrouwelijk: boolean('vertrouwelijk').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('dossiers_organisatie_id_idx').on(t.organisatieId),
}))

// =================== CLIENTEN (hulpvragers / deelnemers, voorheen 'adoptanten') ===================

export const clienten = pgTable('clienten', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  voornaam: varchar('voornaam', { length: 120 }).notNull(),
  achternaam: varchar('achternaam', { length: 120 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 30 }),
  geboortedatum: timestamp('geboortedatum'),
  hulpvraagOmschrijving: text('hulpvraag_omschrijving'),
  profielData: jsonb('profiel_data').$type<Record<string, unknown>>().default({}),
  status: clientStatusEnum('status').default('aangemeld').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('clienten_organisatie_id_idx').on(t.organisatieId),
}))

// =================== BEGELEIDINGEN (trajectkoppelingen, voorheen 'adopties') ===================

export const begeleidingen = pgTable('begeleidingen', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id, { onDelete: 'cascade' }),
  clientId: text('client_id').notNull().references(() => clienten.id, { onDelete: 'cascade' }),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  startDatum: timestamp('start_datum'),
  status: begeleidingStatusEnum('status').default('gepland').notNull(),
  evaluatieNotities: text('evaluatie_notities'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('begeleidingen_organisatie_id_idx').on(t.organisatieId),
}))

// =================== MATCHES ===================

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id),
  score: integer('score').notNull(), // 0-100
  analyseTekst: text('analyse_tekst'), // AI motivatie
  woningScore: integer('woning_score'), // Sub-scores
  energieScore: integer('energie_score'),
  gezinScore: integer('gezin_score'),
  ervaringScore: integer('ervaring_score'),
  alleenThuisScore: integer('alleen_thuis_score'),
  budgetScore: integer('budget_score'),
  isAanbevolen: boolean('is_aanbevolen').default(false),
  // Feedback loop: uitkomst registreren na contact/begeleiding
  uitkomst: varchar('uitkomst', { length: 50 }), // 'geinteresseerd' | 'afspraak' | 'gestart' | 'niet_geschikt'
  uitkomstOp: timestamp('uitkomst_op'),
  berekendOp: timestamp('berekend_op').defaultNow().notNull(),
})

// =================== CONVERSATIONS ===================

export const gesprekken = pgTable('gesprekken', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id),
  afspraakDatum: timestamp('afspraak_datum'),
  afspraakBevestigd: boolean('afspraak_bevestigd').default(false),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  laasteBerichtOp: timestamp('laatste_bericht_op').defaultNow().notNull(),
})

export const berichten = pgTable('berichten', {
  id: serial('id').primaryKey(),
  gesprekId: integer('gesprek_id').notNull().references(() => gesprekken.id, { onDelete: 'cascade' }),
  verzenderType: berichtVerzenderEnum('verzender_type').notNull(),
  verzenderId: integer('verzender_id').notNull(),
  inhoud: text('inhoud').notNull(),
  gelezen: boolean('gelezen').default(false),
  verstuurdOp: timestamp('verstuurd_op').defaultNow().notNull(),
})

// =================== MEDICAL RECORDS ===================

export const medischeRecords = pgTable('medische_records', {
  id: serial('id').primaryKey(),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id),
  type: varchar('type', { length: 100 }).notNull(), // "vaccinatie", "ontworming", "check-up", etc.
  titel: varchar('titel', { length: 255 }).notNull(),
  beschrijving: text('beschrijving'),
  datum: timestamp('datum').notNull(),
  status: medischStatusEnum('status').default('voltooid').notNull(),
  uitvoerder: varchar('uitvoerder', { length: 100 }), // naam behandelaar/organisatie
  rapportUrl: text('rapport_url'),
  notities: text('notities'),
  volgendeDatum: timestamp('volgende_datum'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== AFTERCARE ===================

export const nazorgDagen = pgTable('nazorg_dagen', {
  id: serial('id').primaryKey(),
  begeleidingId: text('begeleiding_id').notNull().references(() => begeleidingen.id),
  dagNummer: integer('dag_nummer').notNull(), // 1 t/m 100
  focusOnderwerp: varchar('focus_onderwerp', { length: 100 }),
  beschrijving: text('beschrijving'),
  tips: json('tips').$type<string[]>().default([]),
  checklist: json('checklist').$type<{
    item: string
    voltooid: boolean
  }[]>().default([]),
  checklistVoltooid: boolean('checklist_voltooid').default(false),
  aantekeningenGebruiker: text('aantekeningen_gebruiker'),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== FAVORIETEN ===================

export const favorieten = pgTable('favorieten', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id, { onDelete: 'cascade' }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== AFSPRAKEN ===================

export const afspraken = pgTable('afspraken', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id),
  type: afspraakTypeEnum('type').notNull().default('kennismaking'),
  status: afspraakStatusEnum('status').notNull().default('aangevraagd'),
  voorkeurDatum: timestamp('voorkeur_datum').notNull(),
  voorkeurTijdslot: varchar('voorkeur_tijdslot', { length: 20 }).notNull(), // 'ochtend' | 'middag' | 'avond'
  bevestigdeDatum: timestamp('bevestigde_datum'),
  bevestigdTijdstip: varchar('bevestigd_tijdstip', { length: 10 }), // "10:30"
  notitieAdoptant: text('notitie_adoptant'),
  notitieAsiel: text('notitie_asiel'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== HELPDESK (contactformulieren & web-intakes per organisatie) ===================

export const helpdeskTickets = pgTable('helpdesk_tickets', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  onderwerp: varchar('onderwerp', { length: 255 }).notNull(),
  bericht: text('bericht').notNull(),
  bron: helpdeskBronEnum('bron').default('webintake').notNull(),
  status: helpdeskStatusEnum('status').default('open').notNull(),
  // Verwijst naar het bijbehorende concept-antwoord van 'Samen' in ai_content_queue (indien gegenereerd).
  conceptQueueId: integer('concept_queue_id'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  beantwoordOp: timestamp('beantwoord_op'),
}, (t) => ({
  organisatieIdx: index('helpdesk_tickets_organisatie_id_idx').on(t.organisatieId),
}))

// =================== WACHTLIJST ===================
export const wachtlijst = pgTable('wachtlijst', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  soort: animalSpeciesEnum('soort').notNull(),
  ras: varchar('ras', { length: 100 }),
  leeftijdVoorkeur: varchar('leeftijd_voorkeur', { length: 50 }),
  notities: text('notities'),
  actief: boolean('actief').default(true).notNull(),
  aangemeldOp: timestamp('aangemeld_op').defaultNow().notNull(),
})

// =================== WELZIJN LOGS ===================
export const welzijnLogs = pgTable('welzijn_logs', {
  id: serial('id').primaryKey(),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id, { onDelete: 'cascade' }),
  medewerkerId: integer('medewerker_id').references(() => users.id),
  voeding: varchar('voeding', { length: 20 }).notNull(),
  gedrag: varchar('gedrag', { length: 20 }).notNull(),
  gezondheid: varchar('gezondheid', { length: 20 }).notNull(),
  notitie: text('notitie'),
  gelogdOp: timestamp('gelogd_op').defaultNow().notNull(),
})

// =================== PLEEGGEZINNEN ===================
export const pleeggezinnen = pgTable('pleeggezinnen', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').references(() => organisaties.id),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 20 }),
  adres: text('adres'),
  stad: varchar('stad', { length: 100 }),
  soortVoorkeur: json('soort_voorkeur').$type<string[]>().default([]),
  maxDieren: integer('max_dieren').default(1),
  ervaringNiveau: varchar('ervaring_niveau', { length: 50 }).default('geen'),
  notities: text('notities'),
  actief: boolean('actief').default(true).notNull(),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== PLEEGPLAATSINGEN ===================
export const pleegplaatsingen = pgTable('pleegplaatsingen', {
  id: serial('id').primaryKey(),
  dossierId: text('dossier_id').notNull().references(() => dossiers.id),
  pleeggezinId: integer('pleeggezin_id').notNull().references(() => pleeggezinnen.id),
  startdatum: timestamp('startdatum').notNull(),
  einddatum: timestamp('einddatum'),
  notities: text('notities'),
  actief: boolean('actief').default(true).notNull(),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== WACHTWOORD RESETS ===================
export const wachtwoordResets = pgTable('wachtwoord_resets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // SHA-256 hash van het reset-token (de ruwe token zit alleen in de e-maillink)
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  verlooptOp: timestamp('verloopt_op').notNull(),
  gebruiktOp: timestamp('gebruikt_op'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== AI-GEBRUIK (token- en kostentracking per organisatie) ===================

export const aiGebruik = pgTable('ai_gebruik', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  model: varchar('model', { length: 100 }).notNull(),
  tokensIn: integer('tokens_in').default(0).notNull(),
  tokensOut: integer('tokens_out').default(0).notNull(),
  kostenEuro: numeric('kosten_euro', { precision: 10, scale: 4 }).default('0').notNull(),
  actie: varchar('actie', { length: 80 }).notNull(), // 'matching' | 'copilot' | 'blog' | ...
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('ai_gebruik_organisatie_id_idx').on(t.organisatieId),
}))

// =================== MAIL LOG (verzendgeschiedenis) ===================

export const mailLog = pgTable('mail_log', {
  id: serial('id').primaryKey(),
  naar: varchar('naar', { length: 255 }).notNull(),
  van: varchar('van', { length: 255 }),
  onderwerp: text('onderwerp').notNull(),
  template: varchar('template', { length: 80 }), // welke stuur*-functie / template
  status: mailStatusEnum('status').default('verzonden').notNull(),
  resendId: varchar('resend_id', { length: 100 }),
  contactId: integer('contact_id'),
  organisatieId: text('organisatie_id'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  fout: text('fout'),
  verzondenOp: timestamp('verzonden_op').defaultNow().notNull(),
})

// =================== APP INSTELLINGEN (key/value) ===================

export const appInstellingen = pgTable('app_instellingen', {
  sleutel: varchar('sleutel', { length: 100 }).primaryKey(),
  waarde: json('waarde'),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== CRM ===================

export const crmContacten = pgTable('crm_contacten', {
  id: serial('id').primaryKey(),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 30 }),
  bedrijf: varchar('bedrijf', { length: 255 }),
  type: crmContactTypeEnum('type').default('lead').notNull(),
  bron: varchar('bron', { length: 80 }).default('handmatig').notNull(),
  stad: varchar('stad', { length: 100 }),
  eigenaar: varchar('eigenaar', { length: 120 }), // beheerder die het contact bezit
  tags: json('tags').$type<string[]>().default([]),
  notitie: text('notitie'),
  organisatieId: text('organisatie_id'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('crm_contacten_organisatie_id_idx').on(t.organisatieId),
}))

export const crmDeals = pgTable('crm_deals', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id').notNull().references(() => crmContacten.id, { onDelete: 'cascade' }),
  titel: varchar('titel', { length: 255 }).notNull(),
  fase: crmDealFaseEnum('fase').default('nieuw').notNull(),
  waarde: real('waarde').default(0),
  eigenaar: varchar('eigenaar', { length: 120 }),
  sluitingsdatum: timestamp('sluitingsdatum'),
  volgorde: integer('volgorde').default(0).notNull(), // positie binnen kolom
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

export const crmActiviteiten = pgTable('crm_activiteiten', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id').notNull().references(() => crmContacten.id, { onDelete: 'cascade' }),
  dealId: integer('deal_id').references(() => crmDeals.id, { onDelete: 'set null' }),
  type: crmActiviteitTypeEnum('type').default('notitie').notNull(),
  inhoud: text('inhoud').notNull(),
  auteur: varchar('auteur', { length: 120 }),
  voltooid: boolean('voltooid').default(false).notNull(),
  deadline: timestamp('deadline'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== BLOG ===================

export const blogCategorieen = pgTable('blog_categorieen', {
  id: serial('id').primaryKey(),
  naam: varchar('naam', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 140 }).notNull().unique(),
})

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  titel: varchar('titel', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 280 }).notNull().unique(),
  inhoudMd: text('inhoud_md').notNull(),
  excerpt: text('excerpt'),
  coverUrl: text('cover_url'),
  categorieId: integer('categorie_id').references(() => blogCategorieen.id, { onDelete: 'set null' }),
  // Nullable: leeg = platformblog (WeAreImpact/ImpactOS-marketingsite, beheerd via /management/blog).
  // Gevuld = artikel van een organisatie zelf, beheerd via /admin/blog.
  organisatieId: text('organisatie_id').references(() => organisaties.id, { onDelete: 'cascade' }),
  status: blogStatusEnum('status').default('concept').notNull(),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: varchar('meta_description', { length: 320 }),
  leestijd: integer('leestijd').default(0).notNull(), // in minuten
  focusKeyword: varchar('focus_keyword', { length: 120 }),
  seoScore: integer('seo_score').default(0).notNull(),
  interneLinks: json('interne_links').$type<{ tekst: string; url: string }[]>().default([]),
  externeLinks: json('externe_links').$type<{ tekst: string; url: string }[]>().default([]),
  auteurId: integer('auteur_id').references(() => users.id, { onDelete: 'set null' }),
  gepubliceerdOp: timestamp('gepubliceerd_op'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('blog_posts_organisatie_id_idx').on(t.organisatieId),
}))

// =================== COUPONS (marketingcodes) ===================

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 60 }).notNull().unique(),
  omschrijving: varchar('omschrijving', { length: 255 }),
  type: couponTypeEnum('type').default('procent').notNull(),
  waarde: real('waarde').notNull(), // procent (0-100) of vast bedrag in euro
  maxGebruik: integer('max_gebruik'), // null = ongelimiteerd
  gebruiktAantal: integer('gebruikt_aantal').default(0).notNull(),
  perKlantLimiet: integer('per_klant_limiet'),
  minBesteding: real('min_besteding'),
  campagne: varchar('campagne', { length: 120 }),
  actief: boolean('actief').default(true).notNull(),
  startOp: timestamp('start_op'),
  vervalOp: timestamp('verval_op'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

export const couponInwisselingen = pgTable('coupon_inwisselingen', {
  id: serial('id').primaryKey(),
  couponId: integer('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  email: varchar('email', { length: 255 }),
  bedragKorting: real('bedrag_korting').default(0).notNull(),
  ingewisseldOp: timestamp('ingewisseld_op').defaultNow().notNull(),
})

// =================== AI-ROLLEN CONFIG ===================
// Welke gespecialiseerde AI-rollen zijn geactiveerd per organisatie, incl. optionele
// custom system-prompt waarmee een organisatie het gedrag van een rol kan overschrijven.

export const aiRolEnum = pgEnum('ai_rol', [
  'social', 'fundraising', 'vrijwilligers', 'evenementen',
  'medisch', 'foto', 'rapportage', 'chat',
])

export const aiRollenConfig = pgTable('ai_rollen_config', {
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  rol: aiRolEnum('rol').notNull(),
  actief: boolean('actief').default(true).notNull(),
  systemPrompt: text('system_prompt'), // optionele custom system-prompt per organisatie
  instellingen: json('instellingen').$type<Record<string, unknown>>().default({}),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.organisatieId, t.rol] }) }))

// =================== KENNISKLUIS (brondocumenten voor AI-context) ===================
// PDF's/tekstdocumenten die een organisatie uploadt (beleidsplan, Wmo-kader, goedgekeurde
// fondsaanvragen). De geëxtraheerde tekst wordt als extra context meegegeven aan Sam, Mila
// en Conny — zie src/lib/ai/rollen/context.ts → haalKenniskluisContext().

export const kenniskluisStatusEnum = pgEnum('kenniskluis_status', ['verwerkt', 'mislukt'])

export const kenniskluisDocumenten = pgTable('kenniskluis_documenten', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  bestandsnaam: varchar('bestandsnaam', { length: 255 }).notNull(),
  blobUrl: text('blob_url').notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  grootteBytes: integer('grootte_bytes').notNull(),
  tekstInhoud: text('tekst_inhoud'), // geëxtraheerde tekst, ingekort voor contextgebruik
  status: kenniskluisStatusEnum('status').default('verwerkt').notNull(),
  foutmelding: text('foutmelding'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('kenniskluis_documenten_organisatie_id_idx').on(t.organisatieId),
}))

// =================== TEAMUITNODIGINGEN (teamleden per organisatie uitnodigen) ===================
// Zelfde patroon als wachtwoord_resets: alleen een SHA-256 hash van het token wordt
// opgeslagen, de ruwe token zit uitsluitend in de uitnodigingsmail.

export const teamUitnodigingStatusEnum = pgEnum('team_uitnodiging_status', ['open', 'geaccepteerd', 'ingetrokken'])

export const teamUitnodigingen = pgTable('team_uitnodigingen', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  uitgenodigdDoor: integer('uitgenodigd_door').references(() => users.id, { onDelete: 'set null' }),
  status: teamUitnodigingStatusEnum('status').default('open').notNull(),
  verlooptOp: timestamp('verloopt_op').notNull(),
  geaccepteerdOp: timestamp('geaccepteerd_op'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('team_uitnodigingen_organisatie_id_idx').on(t.organisatieId),
}))

// =================== VRIJWILLIGERS ===================

// =================== EXTERNE KOPPELINGEN (agenda-sync: Outlook/Google) ===================
// OAuth-tokens voor per-organisatie agenda-koppelingen. Tokens staan versleuteld
// (AES-256-GCM, zie src/lib/integraties/crypto.ts) — nooit in platte tekst opgeslagen.

export const integratieProviderEnum = pgEnum('integratie_provider', ['microsoft', 'google'])

export const externeKoppelingen = pgTable('externe_koppelingen', {
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  provider: integratieProviderEnum('provider').notNull(),
  accountEmail: varchar('account_email', { length: 255 }),
  accessTokenVersleuteld: text('access_token_versleuteld').notNull(),
  refreshTokenVersleuteld: text('refresh_token_versleuteld').notNull(),
  verlooptOp: timestamp('verloopt_op').notNull(),
  gekoppeldOp: timestamp('gekoppeld_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.organisatieId, t.provider] }) }))

export const vrijwilligerStatusEnum = pgEnum('vrijwilliger_status', ['kandidaat', 'actief', 'inactief'])
export const vrijwilligers = pgTable('vrijwilligers', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 30 }),
  functie: varchar('functie', { length: 120 }).default('algemene ondersteuning'),
  status: vrijwilligerStatusEnum('status').default('kandidaat').notNull(),
  urenPerWeek: integer('uren_per_week').default(0),
  beschikbaarheid: json('beschikbaarheid').$type<Record<string, string[]>>().default({}),
  tags: json('tags').$type<string[]>().default([]),
  notities: text('notities'),
  aangemeldOp: timestamp('aangemeld_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// Sollicitaties (basis-screening door AI)
export const sollicitatieStatusEnum = pgEnum('sollicitatie_status', ['nieuw', 'gescreend', 'uitgenodigd', 'afgewezen'])
export const sollicitaties = pgTable('sollicitaties', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  telefoon: varchar('telefoon', { length: 30 }),
  functie: varchar('functie', { length: 120 }),
  motivatie: text('motivatie'),
  ervaring: text('ervaring'),
  status: sollicitatieStatusEnum('status').default('nieuw').notNull(),
  aiScore: integer('ai_score'),
  aiScreenNotitie: text('ai_screen_notitie'),
  vrijwilligerId: integer('vrijwilliger_id').references(() => vrijwilligers.id, { onDelete: 'set null' }),
  aangemeldOp: timestamp('aangemeld_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== FUNDRAISING & DONOREN ===================

export const donorTypeEnum = pgEnum('donor_type', ['eenmalig', 'structureel', 'bedrijf'])
export const donorSegmentEnum = pgEnum('donor_segment', ['nieuw', 'regulier', 'major', 'laps', 'actief'])
export const donoren = pgTable('donoren', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefoon: varchar('telefoon', { length: 30 }),
  bedrijf: varchar('bedrijf', { length: 255 }),
  type: donorTypeEnum('type').default('eenmalig').notNull(),
  segment: donorSegmentEnum('segment').default('nieuw').notNull(),
  totaalGedoneerd: real('totaal_gedoneerd').default(0).notNull(),
  eersteDonatieOp: timestamp('eerste_donatie_op'),
  laatsteDonatieOp: timestamp('laatste_donatie_op'),
  tags: json('tags').$type<string[]>().default([]),
  notities: text('notities'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

export const campagneTypeEnum = pgEnum('campagne_type', ['donatie', 'grant', 'sponsor', 'evenement'])
export const campagneStatusEnum = pgEnum('campagne_status', ['concept', 'actief', 'afgerond', 'gepauzeerd'])
export const fondsenwervingCampagnes = pgTable('fondsenwerving_campagnes', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  naam: varchar('naam', { length: 255 }).notNull(),
  type: campagneTypeEnum('type').default('donatie').notNull(),
  status: campagneStatusEnum('status').default('concept').notNull(),
  doelBedrag: real('doel_bedrag').default(0),
  opgehaaldBedrag: real('opgehaald_bedrag').default(0).notNull(),
  startOp: timestamp('start_op'),
  eindOp: timestamp('eind_op'),
  notities: text('notities'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== EVENEMENTEN ===================

export const evenementTypeEnum = pgEnum('evenement_type', ['adoptiedag', 'opendag', 'fundraising', 'andere'])
export const evenementStatusEnum = pgEnum('evenement_status', ['concept', 'gepland', 'afgerond', 'geannuleerd'])
export const evenementen = pgTable('evenementen', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  titel: varchar('titel', { length: 255 }).notNull(),
  type: evenementTypeEnum('type').default('adoptiedag').notNull(),
  beschrijving: text('beschrijving'),
  locatie: varchar('locatie', { length: 255 }),
  startOp: timestamp('start_op').notNull(),
  eindOp: timestamp('eind_op'),
  capaciteit: integer('capaciteit'),
  status: evenementStatusEnum('status').default('concept').notNull(),
  promoConceptId: integer('promo_concept_id'),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

export const shiftStatusEnum = pgEnum('shift_status', ['open', 'ingevuld', 'geannuleerd'])
export const evenementShiften = pgTable('evenement_shiften', {
  id: serial('id').primaryKey(),
  evenementId: integer('evenement_id').notNull().references(() => evenementen.id, { onDelete: 'cascade' }),
  taak: varchar('taak', { length: 160 }).notNull(),
  startOp: timestamp('start_op').notNull(),
  eindOp: timestamp('eind_op'),
  vrijwilligerId: integer('vrijwilliger_id').references(() => vrijwilligers.id, { onDelete: 'set null' }),
  status: shiftStatusEnum('shift_status').default('open').notNull(),
  notities: text('notities'),
})

// =================== AI CONTENT QUEUE (voorstellen door AI-rollen, wachtend op goedkeuring) ===================

export const aiContentTypeEnum = pgEnum('ai_content_type', [
  'subsidie', 'rapportage', 'social_post', 'briefing', 'email',
])

export const aiContentStatusEnum = pgEnum('ai_content_status', ['pending', 'approved', 'rejected'])

export const aiContentQueue = pgTable('ai_content_queue', {
  id: serial('id').primaryKey(),
  organisatieId: text('organisatie_id').notNull().references(() => organisaties.id, { onDelete: 'cascade' }),
  rol: aiRolEnum('rol').notNull(),
  type: aiContentTypeEnum('type').notNull(),
  titel: varchar('titel', { length: 255 }),
  content: text('content').notNull(),
  status: aiContentStatusEnum('status').default('pending').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  beoordeeldOp: timestamp('beoordeeld_op'),
  beoordeeldDoor: varchar('beoordeeld_door', { length: 120 }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({
  organisatieIdx: index('ai_content_queue_organisatie_id_idx').on(t.organisatieId),
}))

// =================== RELATIONS ===================

export const usersRelations = relations(users, ({ one, many }) => ({
  profiel: one(adopterProfielen, { fields: [users.id], references: [adopterProfielen.userId] }),
  matches: many(matches),
  gesprekken: many(gesprekken),
}))

export const dossiersRelations = relations(dossiers, ({ one, many }) => ({
  organisatie: one(organisaties, { fields: [dossiers.organisatieId], references: [organisaties.id] }),
  matches: many(matches),
  medischeRecords: many(medischeRecords),
  begeleidingen: many(begeleidingen),
}))

export const organisatiesRelations = relations(organisaties, ({ many }) => ({
  dossiers: many(dossiers),
  clienten: many(clienten),
  begeleidingen: many(begeleidingen),
  gesprekken: many(gesprekken),
  vrijwilligers: many(vrijwilligers),
  donoren: many(donoren),
  campagnes: many(fondsenwervingCampagnes),
  evenementen: many(evenementen),
  content: many(aiContentQueue),
  rollen: many(aiRollenConfig),
  aiGebruik: many(aiGebruik),
  kenniskluisDocumenten: many(kenniskluisDocumenten),
  externeKoppelingen: many(externeKoppelingen),
  onboardingBerichten: many(onboardingBerichten),
  teamUitnodigingen: many(teamUitnodigingen),
}))

export const clientenRelations = relations(clienten, ({ one, many }) => ({
  organisatie: one(organisaties, { fields: [clienten.organisatieId], references: [organisaties.id] }),
  begeleidingen: many(begeleidingen),
}))

export const begeleidingenRelations = relations(begeleidingen, ({ one, many }) => ({
  dossier: one(dossiers, { fields: [begeleidingen.dossierId], references: [dossiers.id] }),
  client: one(clienten, { fields: [begeleidingen.clientId], references: [clienten.id] }),
  organisatie: one(organisaties, { fields: [begeleidingen.organisatieId], references: [organisaties.id] }),
  nazorgDagen: many(nazorgDagen),
}))

export const gesprekkenRelations = relations(gesprekken, ({ one, many }) => ({
  user: one(users, { fields: [gesprekken.userId], references: [users.id] }),
  dossier: one(dossiers, { fields: [gesprekken.dossierId], references: [dossiers.id] }),
  organisatie: one(organisaties, { fields: [gesprekken.organisatieId], references: [organisaties.id] }),
  berichten: many(berichten),
}))

// =================== TIJDELIJKE TYPE-ALIASSEN (compat tijdens migratie) ===================
// Deze aliassen voorkomen een lawine van onnodige compile-fouten in de UI terwijl losse
// routes/componenten stap voor stap overgezet worden naar de nieuwe organisatie/dossier/
// client/begeleiding-namen (Sprint 3). Nieuwe code moet de nieuwe namen gebruiken.

export type Organisatie = typeof organisaties.$inferSelect
export type NewOrganisatie = typeof organisaties.$inferInsert
export type Dossier = typeof dossiers.$inferSelect
export type NewDossier = typeof dossiers.$inferInsert
export type Client = typeof clienten.$inferSelect
export type NewClient = typeof clienten.$inferInsert
export type Begeleiding = typeof begeleidingen.$inferSelect
export type NewBegeleiding = typeof begeleidingen.$inferInsert
export type AiQueueItem = typeof aiContentQueue.$inferSelect
export type NewAiQueueItem = typeof aiContentQueue.$inferInsert

/** @deprecated gebruik `Organisatie` */
export type Asiel = Organisatie
/** @deprecated gebruik `NewOrganisatie` */
export type NewAsiel = NewOrganisatie
/** @deprecated gebruik `Dossier` */
export type Dier = Dossier
/** @deprecated gebruik `NewDossier` */
export type NewDier = NewDossier
/** @deprecated gebruik `Client` */
export type Adoptant = Client
/** @deprecated gebruik `Begeleiding` */
export type Adoptie = Begeleiding
/** @deprecated gebruik `NewBegeleiding` */
export type NewAdoptie = NewBegeleiding
