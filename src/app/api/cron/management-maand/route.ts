import { NextResponse } from 'next/server'
import { getManagementKpis, euro } from '@/lib/beheer/stats'
import { stuurManagementRapport } from '@/lib/email'
import { chatCompletion } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Vercel Cron: 1e van de maand 07:00 — { "path": "/api/cron/management-maand", "schedule": "0 7 1 * *" }
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const nu = new Date()
  const startDezeMaand = new Date(nu.getFullYear(), nu.getMonth(), 1)
  const startVorigeMaand = new Date(nu.getFullYear(), nu.getMonth() - 1, 1)
  const startEervorigeMaand = new Date(nu.getFullYear(), nu.getMonth() - 2, 1)

  const [vorige, eervorige] = await Promise.all([
    getManagementKpis(startVorigeMaand, startDezeMaand),
    getManagementKpis(startEervorigeMaand, startVorigeMaand),
  ])

  const maandNaam = startVorigeMaand.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

  // Trends t.o.v. maand ervoor
  function trend(nu: number, vorig: number): string {
    if (vorig === 0) return nu > 0 ? `${nu} (nieuw)` : '0'
    const pct = Math.round(((nu - vorig) / vorig) * 100)
    return `${nu} (${pct >= 0 ? '+' : ''}${pct}%)`
  }
  const conversie = vorige.nieuweMatches > 0 ? Math.round((vorige.nieuweBegeleidingen / vorige.nieuweMatches) * 100) : 0

  const trends = [
    { label: 'Nieuwe gebruikers', waarde: trend(vorige.nieuweGebruikers, eervorige.nieuweGebruikers) },
    { label: 'Nieuwe matches', waarde: trend(vorige.nieuweMatches, eervorige.nieuweMatches) },
    { label: 'Adopties', waarde: trend(vorige.nieuweBegeleidingen, eervorige.nieuweBegeleidingen) },
    { label: 'AI-kosten', waarde: `${euro(vorige.aiKostenEuro)} (vorige: ${euro(eervorige.aiKostenEuro)})` },
    { label: 'Match → adoptie conversie', waarde: `${conversie}%` },
  ]

  // AI-systeemanalyse
  let samenvatting: string | undefined
  try {
    const prompt = `Je bent de business-analist van PootGelukkig (platform dat asieldieren aan adoptiegezinnen koppelt). Schrijf een beknopte managementsamenvatting (3-5 korte alinea's, Nederlands) op basis van deze maandcijfers (${maandNaam}) versus de maand ervoor.

Deze maand: ${JSON.stringify({
      nieuweGebruikers: vorige.nieuweGebruikers,
      nieuweMatches: vorige.nieuweMatches,
      adopties: vorige.nieuweBegeleidingen,
      verzondenMails: vorige.verzondenMails,
      aiKostenEuro: vorige.aiKostenEuro,
      aiCalls: vorige.aiCalls,
      aiPerActie: vorige.aiPerActie,
      conversiePct: conversie,
    })}
Vorige maand: ${JSON.stringify({
      nieuweGebruikers: eervorige.nieuweGebruikers,
      nieuweMatches: eervorige.nieuweMatches,
      adopties: eervorige.nieuweBegeleidingen,
      aiKostenEuro: eervorige.aiKostenEuro,
    })}

Benoem: 1) wat opvalt, 2) waar de AI-kosten naartoe gaan en of dat gezond is, 3) concrete aanbevelingen. Geen opsomming van alle cijfers, wel scherpe inzichten. Geen markdown-koppen.`
    samenvatting = await chatCompletion([{ role: 'user', content: prompt }], {
      maxTokens: 700,
      meta: { actie: 'mgmt', organisatieId: 'platform' },
    })
  } catch (err) {
    console.error('[Management-maand] AI-analyse mislukt:', err)
  }

  const result = await stuurManagementRapport({
    periode: 'maand',
    periodeLabel: 'Maandrapport',
    periodeTitel: maandNaam.charAt(0).toUpperCase() + maandNaam.slice(1),
    stats: {
      nieuweGebruikers: vorige.nieuweGebruikers,
      nieuweMatches: vorige.nieuweMatches,
      nieuweBegeleidingen: vorige.nieuweBegeleidingen,
      verzondenMails: vorige.verzondenMails,
    },
    aiKosten: euro(vorige.aiKostenEuro),
    aiCalls: vorige.aiCalls,
    aiPerActie: vorige.aiPerActie.map((m) => ({ actie: m.actie, kosten: euro(m.kosten), calls: m.calls })),
    samenvatting,
    trends,
  })

  return NextResponse.json({ ok: result.ok })
}
