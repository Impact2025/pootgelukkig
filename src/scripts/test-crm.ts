/**
 * Script: voeg "Organisatie Proef" toe aan organisaties + CRM en verstuur testmail
 */
import { db } from '@/lib/db'
import { organisaties, crmContacten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verstuurMail } from '@/lib/email'

const TEST_NAAM = 'Organisatie Proef'
const TEST_EMAIL = 'v.munster@weareimpact.nl'

async function run() {
  console.log('🧪 Organisatie Proef toevoegen...')

  // Check of al bestaat
  const bestaand = await db
    .select()
    .from(organisaties)
    .where(eq(organisaties.naam, TEST_NAAM))
    .limit(1)

  let organisatieId: string
  if (bestaand.length > 0) {
    organisatieId = bestaand[0].id
    console.log('  → Bestond al in organisaties (id=' + organisatieId + ')')
  } else {
    const [organisatie] = await db.insert(organisaties).values({
      naam: TEST_NAAM,
      slug: 'organisatie-proef',
      contactEmail: TEST_EMAIL,
      status: 'proef',
      bron: 'handmatig',
      wervingStatus: 'aangesloten',
    }).returning({ id: organisaties.id })
    organisatieId = organisatie.id
    console.log('  → Toegevoegd aan organisaties (id=' + organisatieId + ')')
  }

  // Check CRM
  const crmBestaand = await db
    .select()
    .from(crmContacten)
    .where(eq(crmContacten.email, TEST_EMAIL))
    .limit(1)

  if (crmBestaand.length > 0) {
    console.log('  → Bestond al in CRM (id=' + crmBestaand[0].id + ')')
  } else {
    await db.insert(crmContacten).values({
      naam: TEST_NAAM,
      email: TEST_EMAIL,
      type: 'asiel',
      bron: 'handmatig',
      organisatieId,
      eigenaar: 'systeem',
      tags: ['test'],
    })
    console.log('  → Toegevoegd aan CRM')
  }

  // Testmail versturen
  console.log('\n📧 Testmail versturen naar ' + TEST_EMAIL + '...')
  const result = await verstuurMail({
    naar: TEST_EMAIL,
    onderwerp: '🧪 Testmail — ImpactOS CRM is actief!',
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebebf0">
        <div style="background:linear-gradient(135deg,#0F172A,#1E293B);padding:28px 32px">
          <p style="margin:0;font-size:20px;font-weight:800;color:#fff">ImpactOS</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px">CRM is live! 🎉</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">
            Hallo Vincent,<br/><br/>
            Dit is een testmail vanuit het <strong>ImpactOS CRM</strong>.<br/><br/>
            Klaar om uitnodigingen en nieuwsbrieven te versturen naar aangesloten organisaties.<br/><br/>
            Groet,<br/>
            Het ImpactOS systeem
          </p>
        </div>
      </div>`,
    meta: { template: 'crm-handmatig' },
  })

  if (result.ok) {
    console.log('✅ Testmail verzonden! (Resend ID: ' + result.id + ')')
  } else {
    console.log('❌ Testmail NIET verzonden — controleer RESEND_API_KEY')
  }
}

run().then(() => process.exit(0)).catch((e) => { console.error('✗ Mislukt:', e); process.exit(1) })
