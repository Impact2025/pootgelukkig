/**
 * Script: organisaties uit de DB ook als CRM-contact toevoegen
 * Zodat je ze direct kunt mailen vanuit /admin/beheer/crm
 *
 * Uitvoeren: tsx --env-file=.env.local src/scripts/crm-asielen.ts
 */
import { db } from '@/lib/db'
import { organisaties, crmContacten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function run() {
  console.log('🔄 Organisaties naar CRM kopiëren...')

  // Haal alle organisaties op
  const alleOrganisaties = await db.select().from(organisaties)

  // Haal bestaande CRM-contacten van type 'asiel' op
  const bestaandeCrm = await db
    .select({ email: crmContacten.email, organisatieId: crmContacten.organisatieId })
    .from(crmContacten)
    .where(eq(crmContacten.type, 'asiel'))

  const bestaandeEmails = new Set(bestaandeCrm.map(c => c.email))
  const bestaandeOrganisatieIds = new Set(bestaandeCrm.map(c => c.organisatieId))

  let nieuw = 0
  let overgeslagen = 0

  for (const o of alleOrganisaties) {
    // Skip organisaties zonder contact-e-mail
    if (!o.contactEmail) {
      overgeslagen++
      continue
    }

    // Skip als al in CRM zit (op organisatieId of email)
    if (bestaandeOrganisatieIds.has(o.id) || bestaandeEmails.has(o.contactEmail)) {
      overgeslagen++
      continue
    }

    await db.insert(crmContacten).values({
      naam: o.naam,
      email: o.contactEmail,
      telefoon: o.telefoon ?? null,
      type: 'asiel',
      bron: 'import-excel',
      organisatieId: o.id,
      eigenaar: 'systeem',
      tags: ['organisatie'],
    })

    nieuw++
  }

  console.log(`✓ ${nieuw} organisaties toegevoegd aan CRM`)
  console.log(`✓ ${overgeslagen} overgeslagen (geen email / al in CRM)`)
  console.log(`📊 Totaal organisaties: ${alleOrganisaties.length}`)
}

run().then(() => process.exit(0)).catch((e) => { console.error('✗ Mislukt:', e); process.exit(1) })
