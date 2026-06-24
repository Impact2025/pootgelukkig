/**
 * Admin-account check/aanmaken.
 * Uitvoeren: npx tsx --env-file=.env.local src/scripts/admin-setup.ts [email] [wachtwoord]
 *
 * - Zonder argumenten: toont bestaande admins.
 * - Met email (+ optioneel wachtwoord): maakt admin aan of promoveert bestaande
 *   gebruiker naar admin en zet (indien opgegeven) een nieuw wachtwoord.
 */
import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function run() {
  const email = process.argv[2]?.trim().toLowerCase()
  const wachtwoord = process.argv[3]?.trim()

  const admins = await db.select({ id: users.id, naam: users.naam, email: users.email }).from(users).where(eq(users.rol, 'admin'))
  console.log(`\nBestaande admins (${admins.length}):`)
  admins.forEach((a) => console.log(`  • ${a.naam} <${a.email}> (id ${a.id})`))

  if (!email) {
    console.log('\nGeen email opgegeven — niets gewijzigd. Geef een email mee om een admin te maken/promoveren.\n')
    process.exit(0)
  }

  const [bestaand] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  const hash = wachtwoord ? await bcrypt.hash(wachtwoord, 10) : undefined

  if (bestaand) {
    await db
      .update(users)
      .set({ rol: 'admin', ...(hash ? { wachtwoordHash: hash } : {}), bijgewerktOp: new Date() })
      .where(eq(users.id, bestaand.id))
    console.log(`\n✓ ${email} is nu admin${hash ? ' (wachtwoord bijgewerkt)' : ''}.`)
  } else {
    if (!hash) {
      console.log('\n✗ Gebruiker bestaat niet en geen wachtwoord opgegeven. Geef ook een wachtwoord mee.\n')
      process.exit(1)
    }
    const [nieuw] = await db
      .insert(users)
      .values({ naam: 'Beheerder', email, wachtwoordHash: hash, rol: 'admin', profielVoltooid: true })
      .returning()
    console.log(`\n✓ Admin aangemaakt: ${nieuw.email} (id ${nieuw.id})`)
  }

  console.log(`\nInloggen kan op /auth/login met:\n  email:      ${email}${wachtwoord ? `\n  wachtwoord: ${wachtwoord}` : ''}\n`)
  process.exit(0)
}

run().catch((e) => {
  console.error('Fout:', e)
  process.exit(1)
})
