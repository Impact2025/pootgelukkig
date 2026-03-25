import { neon } from '@neondatabase/serverless'

const sql = neon("postgresql://neondb_owner:npg_KZhyCYi4aQR2@ep-weathered-glade-ag5svfoq-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require")

await sql`
CREATE TABLE IF NOT EXISTS wachtlijst (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  naam VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  soort animal_species NOT NULL,
  ras VARCHAR(100),
  leeftijd_voorkeur VARCHAR(50),
  notities TEXT,
  actief BOOLEAN DEFAULT true NOT NULL,
  aangemeld_op TIMESTAMP DEFAULT NOW() NOT NULL
)`

await sql`
CREATE TABLE IF NOT EXISTS welzijn_logs (
  id SERIAL PRIMARY KEY,
  dier_id INTEGER NOT NULL REFERENCES dieren(id) ON DELETE CASCADE,
  medewerker_id INTEGER REFERENCES users(id),
  voeding VARCHAR(20) NOT NULL,
  gedrag VARCHAR(20) NOT NULL,
  gezondheid VARCHAR(20) NOT NULL,
  notitie TEXT,
  gelogd_op TIMESTAMP DEFAULT NOW() NOT NULL
)`

await sql`
CREATE TABLE IF NOT EXISTS pleeggezinnen (
  id SERIAL PRIMARY KEY,
  asiel_id INTEGER REFERENCES asielen(id),
  naam VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefoon VARCHAR(20),
  adres TEXT,
  stad VARCHAR(100),
  soort_voorkeur JSON DEFAULT '[]',
  max_dieren INTEGER DEFAULT 1,
  ervaring_niveau VARCHAR(50) DEFAULT 'geen',
  notities TEXT,
  actief BOOLEAN DEFAULT true NOT NULL,
  aangemaakt_op TIMESTAMP DEFAULT NOW() NOT NULL
)`

await sql`
CREATE TABLE IF NOT EXISTS pleegplaatsingen (
  id SERIAL PRIMARY KEY,
  dier_id INTEGER NOT NULL REFERENCES dieren(id),
  pleeggezin_id INTEGER NOT NULL REFERENCES pleeggezinnen(id),
  startdatum TIMESTAMP NOT NULL,
  einddatum TIMESTAMP,
  notities TEXT,
  actief BOOLEAN DEFAULT true NOT NULL,
  aangemaakt_op TIMESTAMP DEFAULT NOW() NOT NULL
)`

await sql`ALTER TABLE dieren ADD COLUMN IF NOT EXISTS vaste_verzorger_id INTEGER REFERENCES users(id)`

console.log('Alle tabellen aangemaakt')
