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
  aangemaaktOp: timestamp('aangemaakt_op').defaultNow().notNull(),
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
