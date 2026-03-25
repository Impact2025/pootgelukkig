import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon("postgresql://neondb_owner:npg_KZhyCYi4aQR2@ep-weathered-glade-ag5svfoq-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require")

const email = 'v.munster@weareimpact.nl'
const wachtwoord = 'pootgelukkig123'
const naam = 'Maya van Munster'
const rol = 'admin'

const hash = await bcrypt.hash(wachtwoord, 10)

// Controleer of gebruiker al bestaat
const bestaand = await sql`SELECT id FROM users WHERE email = ${email}`

if (bestaand.length > 0) {
  // Update wachtwoord
  await sql`UPDATE users SET wachtwoord_hash = ${hash} WHERE email = ${email}`
  console.log(`✅ Wachtwoord bijgewerkt voor ${email}`)
} else {
  // Maak nieuwe gebruiker
  await sql`
    INSERT INTO users (naam, email, wachtwoord_hash, rol, profiel_voltooid)
    VALUES (${naam}, ${email}, ${hash}, ${rol}, true)
  `
  console.log(`✅ Gebruiker aangemaakt: ${email}`)
}

console.log(`📧 E-mail:     ${email}`)
console.log(`🔑 Wachtwoord: ${wachtwoord}`)
