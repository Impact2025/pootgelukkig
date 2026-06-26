/**
 * Script: voeg "Asiel Proef" toe aan asielen + CRM en verstuur testmail
 */
import { db } from '@/lib/db'
import { asielen, crmContacten } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verstuurMail } from '@/lib/email'

const TEST_NAAM = 'Asiel Proef'
const TEST_EMAIL = 'v.munster@weareimpact.nl'

async function run() {
  console.log('🧪 Asiel Proef toevoegen...')

  // Check of al bestaat
  const bestaand = await db
    .select()
    .from(asielen)
    .where(eq(asielen.naam, TEST_NAAM))
    .limit(1)

  let asielId: number
  if (bestaand.length > 0) {
    asielId = bestaand[0].id
    console.log('  → Bestond al in asielen (id=' + asielId + ')')
  } else {
    const [asiel] = await db.insert(asielen).values({
      naam: TEST_NAAM,
      stad: 'Test',
      regio: 'Test',
      email: TEST_EMAIL,
      actief: true,
      bron: 'handmatig',
      wervingStatus: 'aangesloten',
    }).returning({ id: asielen.id })
    asielId = asiel.id
    console.log('  → Toegevoegd aan asielen (id=' + asielId + ')')
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
      stad: 'Test',
      asielId: asielId,
      eigenaar: 'systeem',
      tags: ['test'],
    })
    console.log('  → Toegevoegd aan CRM')
  }

  // Testmail versturen
  console.log('\n📧 Testmail versturen naar ' + TEST_EMAIL + '...')
  const result = await verstuurMail({
    naar: TEST_EMAIL,
    onderwerp: '🧪 Testmail — PootGelukkig CRM is actief!',
    html: `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebebf0">
        <div style="background:linear-gradient(135deg,#33335c,#1a1a3e);padding:28px 32px">
          <p style="margin:0;font-size:20px;font-weight:800;color:#fff">🐾 PootGelukkig</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px">CRM is live! 🎉</h2>
          <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">
            Hallo Vincent,<br/><br/>
            Dit is een testmail vanuit het <strong>PootGelukkig CRM</strong>.<br/><br/>
            Het CRM bevat nu <strong>160 asielen</strong> met emailadres, <br/>
            klaar om uitnodigingen en nieuwsbrieven te versturen.<br/><br/>
            🐾 Groet,<br/>
            Het PootGelukkig systeem
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
