/**
 * Import-runner: zoekt alle Nederlandse asielen uit de samengestelde bron op en
 * zet nieuwe asielen in de database (status 'nieuw'). Idempotent — dedupliceert
 * op naam + stad, dus herhaald draaien is veilig.
 *
 * Uitvoeren: npm run db:import-asielen
 *
 * In productie draait dezelfde logica via de maandelijkse cron
 * (/api/cron/asielen-import). Er gaat GEEN mail uit; dat gebeurt pas na
 * handmatige goedkeuring in /admin/asielen-werving.
 */
import { importeerAsielen } from '../lib/asielen-import'

async function run() {
  console.log('🔎 Asielen importeren uit samengestelde bron...')
  const r = await importeerAsielen()
  console.log(`   Gevonden in bron : ${r.gevonden}`)
  console.log(`   Nieuw toegevoegd : ${r.nieuw}`)
  console.log(`   Al aanwezig      : ${r.overgeslagen}`)
  if (r.toegevoegd.length > 0) {
    console.log('   Nieuwe asielen:')
    for (const a of r.toegevoegd) console.log(`     • ${a.naam} (${a.stad})`)
  }
  console.log('✓ Klaar')
}

run().then(() => process.exit(0)).catch((e) => { console.error('✗ Import mislukt:', e); process.exit(1) })
