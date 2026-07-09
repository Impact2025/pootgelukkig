import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  json,
  serial,
  pgEnum,
  real,
  varchar,
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// =================== ENUMS ===================

export const animalSpeciesEnum = pgEnum('animal_species', [
  'hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig'
])

export const animalStatusEnum = pgEnum('animal_status', [
  'beschikbaar', 'in_behandeling', 'geadopteerd', 'niet_beschikbaar'
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

export const adoptieStatusEnum = pgEnum('adoptie_status', [
  'aangevraagd', 'goedgekeurd', 'afgerond', 'afgewezen', 'geannuleerd'
])

export const medischStatusEnum = pgEnum('medisch_status', [
  'aankomend', 'voltooid', 'gemist', 'geannuleerd'
])

export const afspraakTypeEnum = pgEnum('afspraak_type', ['kennismaking', 'thuischeck'])

export const afspraakStatusEnum = pgEnum('afspraak_status', [
  'aangevraagd', 'bevestigd', 'afgerond', 'geannuleerd'
])

// Wervingsstatus voor geïmporteerde asielen (cold-outreach flow)
export const wervingStatusEnum = pgEnum('werving_status', [
  'nieuw',        // gevonden door import, nog niet benaderd
  'uitgenodigd',  // uitnodigingsmail verstuurd
  'overgeslagen', // handmatig overgeslagen, niet mailen
  'aangesloten',  // asiel heeft zich aangemeld op het platform
])

// Status van een verzonden e-mail (mail_log)
export const mailStatusEnum = pgEnum('mail_status', ['verzonden', 'gefaald', 'geopend', 'gebounced'])

// CRM
export const crmContactTypeEnum = pgEnum('crm_contact_type', ['lead', 'asiel', 'adoptant', 'partner', 'overig'])
export const crmDealFaseEnum = pgEnum('crm_deal_fase', ['nieuw', 'contact', 'onderhandeling', 'gewonnen', 'verloren'])
export const crmActiviteitTypeEnum = pgEnum('crm_activiteit_type', ['notitie', 'mail', 'bel', 'taak', 'afspraak'])

// Blog
export const blogStatusEnum = pgEnum('blog_status', ['concept', 'gepubliceerd', 'gearchiveerd'])

// Coupons (marketingcodes)
export const couponTypeEnum = pgEnum('coupon_type', ['procent', 'vast'])

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
  asielId: integer('asiel_id'), // alleen gevuld voor rol 'asiel'
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

// =================== SHELTERS (Asielen) ===================

export const asielen = pgTable('asielen', {
  id: serial('id').primaryKey(),
  naam: varchar('naam', { length: 255 }).notNull(),
  stad: varchar('stad', { length: 100 }).notNull(),
  regio: varchar('regio', { length: 100 }).notNull(), // "Noord-Holland", etc.
  adres: text('adres'),
  postcode: varchar('postcode', { length: 10 }),
  lat: real('lat'),
  lng: real('lng'),
  telefoon: varchar('telefoon', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 255 }),
  logoUrl: text('logo_url'),
  beschrijving: text('beschrijving'),
  actief: boolean('actief').default(true).notNull(),

  // Werving / herkomst — gevuld door de asielen-import cron
  bron: varchar('bron', { length: 50 }).default('handmatig').notNull(), // 'handmatig' | 'import'
  wervingStatus: wervingStatusEnum('werving_status').default('aangesloten').notNull(),
  uitnodigingVerstuurdOp: timestamp('uitnodiging_verstuurd_op'),

  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),

  // Openingstijden per dag
  openingstijden: json('openingstijden').$type<{
    ma: { open: boolean; van: string; tot: string }
    di: { open: boolean; van: string; tot: string }
    wo: { open: boolean; van: string; tot: string }
    do: { open: boolean; van: string; tot: string }
    vr: { open: boolean; van: string; tot: string }
    za: { open: boolean; van: string; tot: string }
    zo: { open: boolean; van: string; tot: string }
    notitie?: string
  }>(),

  // Social media
  socialMedia: json('social_media').$type<{
    instagram?: string
    facebook?: string
    tiktok?: string
    youtube?: string
  }>(),

  // Overige configuratie
  asielConfig: json('asiel_config').$type<{
    spoedTelefoon?: string
    kvkNummer?: string
    anbiStatus?: boolean
    iban?: string
    maxCapaciteit?: number
    specialisaties?: string[]
    notificaties?: {
      emailBijAanvraag?: boolean
      emailBijBericht?: boolean
      dagelijkseDigest?: boolean
    }
    adoptieProcedure?: {
      minimumLeeftijdAdoptant?: number
      tuinVereist?: boolean
      huisbezoekVereist?: boolean
      wachttijdDagen?: number
      vereisten?: string
    }
  }>(),
})

// =================== ANIMALS ===================

export const dieren = pgTable('dieren', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id),
  naam: varchar('naam', { length: 100 }).notNull(),
  soort: animalSpeciesEnum('soort').notNull(),
  ras: varchar('ras', { length: 100 }),
  leeftijdJaren: integer('leeftijd_jaren'),
  leeftijdMaanden: integer('leeftijd_maanden'),
  geslacht: varchar('geslacht', { length: 10 }), // "reu", "teef", "man", "vrouw"
  gewichtKg: real('gewicht_kg'),
  kleur: varchar('kleur', { length: 100 }),
  verhaal: text('verhaal'), // Het persoonlijke verhaal van het dier
  status: animalStatusEnum('status').default('beschikbaar').notNull(),
  
  // Foto's
  hoofdFotoUrl: text('hoofd_foto_url'),
  fotoUrls: json('foto_urls').$type<string[]>().default([]),
  
  // Gedragsprofiel (voor AI matching)
  gedragsProfiel: json('gedragsrofiel').$type<{
    energieNiveau: 'laag' | 'normaal' | 'hoog' | 'zeer_hoog'
    kindvriendelijk: boolean
    katVriendelijk: boolean
    hondenVriendelijk: boolean
    alleenThuis: 'goed' | 'matig' | 'slecht'
    trainbaarheid: 'laag' | 'normaal' | 'hoog'
    blaffen: 'weinig' | 'normaal' | 'veel'
    speelsheid: 'laag' | 'normaal' | 'hoog'
    tags: string[] // ["kindvriendelijk", "sociaal", "leergierig"]
  }>(),
  
  // Medisch paspoort (samenvatting)
  medischPaspoort: json('medisch_paspoort').$type<{
    gevaccineerd: boolean
    gecastreerd: boolean
    gechippt: boolean
    chipNummer: string | null
    allergieën: string[]
  }>(),
  
  vasteVerzorgerId: integer('vaste_verzorger_id').references(() => users.id),
  binnengekomentOp: timestamp('binnengekomen_op').defaultNow().notNull(),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== MATCHES ===================

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dierId: integer('dier_id').notNull().references(() => dieren.id),
  score: integer('score').notNull(), // 0-100
  analyseTekst: text('analyse_tekst'), // AI motivatie
  woningScore: integer('woning_score'), // Sub-scores
  energieScore: integer('energie_score'),
  gezinScore: integer('gezin_score'),
  ervaringScore: integer('ervaring_score'),
  alleenThuisScore: integer('alleen_thuis_score'),
  budgetScore: integer('budget_score'),
  isAanbevolen: boolean('is_aanbevolen').default(false),
  // Feedback loop: uitkomst registreren na contact/adoptie
  uitkomst: varchar('uitkomst', { length: 50 }), // 'geinteresseerd' | 'afspraak' | 'geadopteerd' | 'niet_geschikt'
  uitkomstOp: timestamp('uitkomst_op'),
  berekendOp: timestamp('berekend_op').defaultNow().notNull(),
})

// =================== CONVERSATIONS ===================

export const gesprekken = pgTable('gesprekken', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  dierId: integer('dier_id').notNull().references(() => dieren.id),
  asielId: integer('asiel_id').notNull().references(() => asielen.id),
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

// =================== ADOPTIONS ===================

export const adopties = pgTable('adopties', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  dierId: integer('dier_id').notNull().references(() => dieren.id),
  asielId: integer('asiel_id').notNull().references(() => asielen.id),
  status: adoptieStatusEnum('status').default('aangevraagd').notNull(),
  adoptieDatum: timestamp('adoptie_datum'),
  
  // Documenten
  overeenkomstUrl: text('overeenkomst_url'),
  irRegistratieUrl: text('ir_registratie_url'),
  
  // Verzekering
  verzekeringMaatschappij: varchar('verzekering_maatschappij', { length: 100 }),
  verzekeringPolisnummer: varchar('verzekering_polisnummer', { length: 100 }),
  
  aangevraagdOp: timestamp('aangevraagd_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== MEDICAL RECORDS ===================

export const medischeRecords = pgTable('medische_records', {
  id: serial('id').primaryKey(),
  dierId: integer('dier_id').notNull().references(() => dieren.id),
  type: varchar('type', { length: 100 }).notNull(), // "vaccinatie", "ontworming", "check-up", etc.
  titel: varchar('titel', { length: 255 }).notNull(),
  beschrijving: text('beschrijving'),
  datum: timestamp('datum').notNull(),
  status: medischStatusEnum('status').default('voltooid').notNull(),
  uitvoerder: varchar('uitvoerder', { length: 100 }), // naam dierenarts/asiel
  rapportUrl: text('rapport_url'),
  notities: text('notities'),
  volgendeDatum: timestamp('volgende_datum'),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== AFTERCARE ===================

export const nazorgDagen = pgTable('nazorg_dagen', {
  id: serial('id').primaryKey(),
  adoptieId: integer('adoptie_id').notNull().references(() => adopties.id),
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
  dierId: integer('dier_id').notNull().references(() => dieren.id, { onDelete: 'cascade' }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

// =================== AFSPRAKEN ===================

export const afspraken = pgTable('afspraken', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dierId: integer('dier_id').notNull().references(() => dieren.id),
  asielId: integer('asiel_id').notNull().references(() => asielen.id),
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
  dierId: integer('dier_id').notNull().references(() => dieren.id, { onDelete: 'cascade' }),
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
  asielId: integer('asiel_id').references(() => asielen.id),
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
  dierId: integer('dier_id').notNull().references(() => dieren.id),
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

// =================== AI-GEBRUIK (kostentracking) ===================

export const aiGebruik = pgTable('ai_gebruik', {
  id: serial('id').primaryKey(),
  module: varchar('module', { length: 50 }).notNull(), // 'matching' | 'copilot' | 'blog' | ...
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  asielId: integer('asiel_id'),
  model: varchar('model', { length: 100 }).notNull(),
  promptTokens: integer('prompt_tokens').default(0).notNull(),
  completionTokens: integer('completion_tokens').default(0).notNull(),
  totaalTokens: integer('totaal_tokens').default(0).notNull(),
  kostenEuro: real('kosten_euro').default(0).notNull(),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
})

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
  asielId: integer('asiel_id'),
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
  asielId: integer('asiel_id'),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

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
})

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
// Welke gespecialiseerde AI-rollen zijn geactiveerd per asiel

export const aiRolEnum = pgEnum('ai_rol', [
  'social', 'fundraising', 'vrijwilligers', 'evenementen',
  'medisch', 'foto', 'rapportage', 'chat',
])

export const aiRollenConfig = pgTable('ai_rollen_config', {
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  rol: aiRolEnum('rol').notNull(),
  actief: boolean('actief').default(true).notNull(),
  instellingen: json('instellingen').$type<Record<string, unknown>>().default({}),
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
}, (t) => ({ pk: primaryKey({ columns: [t.asielId, t.rol] }) }))

// =================== VRIJWILLIGERS ===================

export const vrijwilligerStatusEnum = pgEnum('vrijwilliger_status', ['kandidaat', 'actief', 'inactief'])
export const vrijwilligers = pgTable('vrijwilligers', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
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
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
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
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
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
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
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
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
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

// =================== AI CONTENT QUEUE (social / nieuwsbrieven / verhalen) ===================

export const contentStatusEnum = pgEnum('content_status', ['concept', 'voorgesteld', 'gepland', 'gepubliceerd', 'afgewezen'])
export const aiContentQueue = pgTable('ai_content_queue', {
  id: serial('id').primaryKey(),
  asielId: integer('asiel_id').notNull().references(() => asielen.id, { onDelete: 'cascade' }),
  rol: aiRolEnum('rol').notNull(),
  type: varchar('type', { length: 40 }).notNull(),
  platform: varchar('platform', { length: 40 }),
  titel: varchar('titel', { length: 255 }),
  inhoud: text('inhoud').notNull(),
  status: contentStatusEnum('status').default('concept').notNull(),
  geplandVoor: timestamp('gepland_voor'),
  gepubliceerdOp: timestamp('gepubliceerd_op'),
  engagement: json('engagement').$type<{ bereik?: number; likes?: number; deelActies?: number; klikken?: number }>().default({}),
  gemaaktDoor: varchar('gemaakt_door', { length: 60 }).default('ai'),
  bijgewerktOp: timestamp('bijgewerkt_op').defaultNow().notNull(),
})

// =================== RELATIONS ===================

export const usersRelations = relations(users, ({ one, many }) => ({
  profiel: one(adopterProfielen, { fields: [users.id], references: [adopterProfielen.userId] }),
  matches: many(matches),
  gesprekken: many(gesprekken),
  adopties: many(adopties),
}))

export const dierenRelations = relations(dieren, ({ one, many }) => ({
  asiel: one(asielen, { fields: [dieren.asielId], references: [asielen.id] }),
  matches: many(matches),
  medischeRecords: many(medischeRecords),
}))

export const asielenRelations = relations(asielen, ({ many }) => ({
  dieren: many(dieren),
  gesprekken: many(gesprekken),
  vrijwilligers: many(vrijwilligers),
  donoren: many(donoren),
  campagnes: many(fondsenwervingCampagnes),
  evenementen: many(evenementen),
  content: many(aiContentQueue),
  rollen: many(aiRollenConfig),
}))

export const gesprekkenRelations = relations(gesprekken, ({ one, many }) => ({
  user: one(users, { fields: [gesprekken.userId], references: [users.id] }),
  dier: one(dieren, { fields: [gesprekken.dierId], references: [dieren.id] }),
  asiel: one(asielen, { fields: [gesprekken.asielId], references: [asielen.id] }),
  berichten: many(berichten),
}))

export const adoptiesRelations = relations(adopties, ({ one, many }) => ({
  user: one(users, { fields: [adopties.userId], references: [users.id] }),
  dier: one(dieren, { fields: [adopties.dierId], references: [dieren.id] }),
  asiel: one(asielen, { fields: [adopties.asielId], references: [asielen.id] }),
  nazorgDagen: many(nazorgDagen),
}))
