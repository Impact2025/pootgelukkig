import { NextResponse } from 'next/server'
import { getManagementKpis, euro } from '@/lib/beheer/stats'
import { stuurManagementRapport } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Vercel Cron: elke dag 07:00 — { "path": "/api/cron/management-dag", "schedule": "0 7 * * *" }
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sinds = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const kpis = await getManagementKpis(sinds)

  const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })

  const result = await stuurManagementRapport({
    periode: 'dag',
    periodeLabel: 'Dagrapport',
    periodeTitel: datum,
    stats: {
      nieuweGebruikers: kpis.nieuweGebruikers,
      nieuweMatches: kpis.nieuweMatches,
      nieuweAdopties: kpis.nieuweAdopties,
      verzondenMails: kpis.verzondenMails,
    },
    aiKosten: euro(kpis.aiKostenEuro),
    aiCalls: kpis.aiCalls,
    aiPerModule: kpis.aiPerModule.map((m) => ({ module: m.module, kosten: euro(m.kosten), calls: m.calls })),
  })

  return NextResponse.json({ ok: result.ok, kpis })
}
