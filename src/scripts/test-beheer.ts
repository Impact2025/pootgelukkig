/**
 * Smoke-tests voor de nieuwe beheer-laag.
 * Uitvoeren: npx tsx --env-file=.env.local src/scripts/test-beheer.ts
 *
 * Test pure logica (SEO, coupon-korting, AI-prijzen) én de echte Drizzle-queries
 * tegen de database (coupon insert/validate/delete + aggregaties). Ruimt zelf op.
 */
import { berekenSeoScore, slugify } from '../lib/blog/seo'
import { berekenKorting, valideerCoupon, registreerInwisseling } from '../lib/coupons'
import { berekenKostenEuro } from '../lib/ai/pricing'
import { getManagementKpis, getGebruikersOverzicht } from '../lib/beheer/stats'
import { db } from '../lib/db'
import { coupons, couponInwisselingen } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

let mislukt = 0
function check(naam: string, voorwaarde: boolean, extra?: unknown) {
  const status = voorwaarde ? '✓' : '✗'
  if (!voorwaarde) mislukt++
  console.log(`  ${status} ${naam}${extra !== undefined && !voorwaarde ? ` → ${JSON.stringify(extra)}` : ''}`)
}

async function run() {
  console.log('\n— Pure logica —')

  // SEO
  const slechteSeo = berekenSeoScore({ titel: 'x', inhoudMd: 'kort' })
  const vulzin = 'Een rustige introductie thuis helpt je nieuwe huisgenoot om vertrouwen op te bouwen en zich veilig te voelen in de eerste periode. '
  const goedeMd = `# Kat adopteren\n\nEen kat adopteren uit het asiel is een prachtige keuze voor wie een trouwe huisgenoot zoekt. ${vulzin.repeat(8)}\n\n## Waarom een kat adopteren uit het asiel\n\n${vulzin.repeat(10)} Bekijk ook onze [beschikbare dieren](/zoeken) en de tips van de [Dierenbescherming](https://dierenbescherming.nl).\n\n## De eerste weken thuis\n\n${vulzin.repeat(10)}\n\n## Kosten en verzorging\n\n${vulzin.repeat(8)}`
  const goedeSeo = berekenSeoScore({
    titel: 'Kat adopteren: de complete gids',
    inhoudMd: goedeMd,
    metaTitle: 'Kat adopteren: de complete gids voor beginners',
    metaDescription: 'Alles over een kat adopteren uit het asiel: waar let je op, kosten en de eerste weken thuis met je nieuwe maatje.',
    focusKeyword: 'kat adopteren',
    interneLinks: [{ tekst: 'zoek', url: '/zoeken' }],
    externeLinks: [{ tekst: 'bron', url: 'https://dierenbescherming.nl' }],
  })
  check('SEO slechte post < 40', slechteSeo.score < 40, slechteSeo.score)
  check('SEO goede post >= 80', goedeSeo.score >= 80, goedeSeo.score)
  check('slugify normaliseert', slugify('Kàt Adoptéren!! 2026') === 'kat-adopteren-2026', slugify('Kàt Adoptéren!! 2026'))

  // Coupon-korting
  check('procent 20% van 50 = 10', berekenKorting('procent', 20, 50) === 10)
  check('vast 15 capped op besteding 10', berekenKorting('vast', 15, 10) === 10)
  check('vast 15 zonder bedrag = 15', berekenKorting('vast', 15) === 15)

  // AI-prijzen
  const kosten = berekenKostenEuro('anthropic/claude-sonnet-4-5', 1_000_000, 1_000_000)
  check('sonnet 1M+1M tokens ≈ €16.56', Math.abs(kosten - (3 + 15) * 0.92) < 0.001, kosten)
  check('echte USD-kosten worden gebruikt', berekenKostenEuro('x', 0, 0, 1) === 0.92)

  console.log('\n— Database queries —')

  // Coupon round-trip
  const testCode = `TESTKORTING-${Date.now().toString(36).toUpperCase().slice(-5)}`
  const [coupon] = await db
    .insert(coupons)
    .values({ code: testCode, type: 'procent', waarde: 25, maxGebruik: 2, perKlantLimiet: 1 })
    .returning()
  check('coupon aangemaakt', !!coupon?.id)

  const v1 = await valideerCoupon(testCode, { bedrag: 40, email: 'test@example.com' })
  check('coupon geldig', v1.geldig === true, v1)
  check('korting 25% van 40 = 10', v1.korting === 10, v1.korting)

  await registreerInwisseling(coupon.id, { email: 'test@example.com', bedragKorting: 10 })
  const v2 = await valideerCoupon(testCode, { bedrag: 40, email: 'test@example.com' })
  check('per-klant-limiet blokkeert 2e gebruik', v2.geldig === false, v2.reden)

  const vOnbekend = await valideerCoupon('BESTAATNIET123')
  check('onbekende code afgewezen', vOnbekend.geldig === false)

  // Opruimen
  await db.delete(couponInwisselingen).where(eq(couponInwisselingen.couponId, coupon.id))
  await db.delete(coupons).where(eq(coupons.id, coupon.id))
  console.log('  ✓ testcoupon opgeruimd')

  // Aggregaties draaien zonder SQL-fouten
  const kpis = await getManagementKpis(new Date(Date.now() - 30 * 864e5))
  check('getManagementKpis draait', typeof kpis.aiKostenEuro === 'number', kpis)
  const overzicht = await getGebruikersOverzicht()
  check('getGebruikersOverzicht draait', Array.isArray(overzicht), overzicht.length)

  console.log(`\n${mislukt === 0 ? '✅ Alle tests geslaagd' : `❌ ${mislukt} test(s) mislukt`}\n`)
  process.exit(mislukt === 0 ? 0 : 1)
}

run().catch((e) => {
  console.error('Testscript fout:', e)
  process.exit(1)
})
