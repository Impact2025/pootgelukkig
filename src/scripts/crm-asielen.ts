/**
 * Script: asielen uit de DB ook als CRM-contact toevoegen
 * Zodat je ze direct kunt mailen vanuit /admin/beheer/crm
 *
 * Uitvoeren: tsx --env-file=.env.local src/scripts/crm-asielen.ts
 */
import { db } from '@/lib/db'
import { asielen, crmContacten } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'

async function run() {
  console.log('🔄 Asielen naar CRM kopiëren...')

  // Haal alle asielen op
  const alleAsielen = await db.select().from(asielen)

  // Haal bestaande CRM-contacten van type 'asiel' op
  const bestaandeCrm = await db
    .select({ email: crmContacten.email, asielId: crmContacten.asielId })
    .from(crmContacten)
    .where(eq(crmContacten.type, 'asiel'))

  const bestaandeEmails = new Set(bestaandeCrm.map(c => c.email))
  const bestaandeAsielIds = new Set(bestaandeCrm.map(c => c.asielId))

  let nieuw = 0
  let overgeslagen = 0

  for (const a of alleAsielen) {
    // Skip asielen zonder email
    if (!a.email) {
      overgeslagen++
      continue
    }

    // Skip als al in CRM zit (op asielId of email)
    if (bestaandeAsielIds.has(a.id) || bestaandeEmails.has(a.email)) {
      overgeslagen++
      continue
    }

    await db.insert(crmContacten).values({
      naam: a.naam,
      email: a.email,
      telefoon: a.telefoon ?? null,
      type: 'asiel',
      bron: 'import-excel',
      stad: a.stad ?? null,
      asielId: a.id,
      eigenaar: 'systeem',
      tags: ['asiel', a.regio ?? ''],
    })

    nieuw++
  }

  console.log(`✓ ${nieuw} asielen toegevoegd aan CRM`)
  console.log(`✓ ${overgeslagen} overgeslagen (geen email / al in CRM)`)
  console.log(`📊 Totaal asielen: ${alleAsielen.length}`)
}

run().then(() => process.exit(0)).catch((e) => { console.error('✗ Mislukt:', e); process.exit(1) })
