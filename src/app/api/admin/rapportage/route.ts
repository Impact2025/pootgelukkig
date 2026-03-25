import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dieren, adopties } from '@/lib/db/schema'
import { and, eq, gte, lt, count, sql } from 'drizzle-orm'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const jaar = parseInt(searchParams.get('jaar') ?? String(new Date().getFullYear()))

  if (isNaN(jaar) || jaar < 2000 || jaar > 2100) {
    return NextResponse.json({ error: 'Ongeldig jaar' }, { status: 400 })
  }

  const asielId = session.user.asielId
  const startJaar = new Date(`${jaar}-01-01T00:00:00Z`)
  const eindJaar = new Date(`${jaar + 1}-01-01T00:00:00Z`)

  // Ingenomen per soort
  const ingenomenQuery = db
    .select({
      soort: dieren.soort,
      aantal: count(),
    })
    .from(dieren)
    .where(
      and(
        gte(dieren.binnengekomentOp, startJaar),
        lt(dieren.binnengekomentOp, eindJaar),
        ...(asielId ? [eq(dieren.asielId, asielId)] : [])
      )
    )
    .groupBy(dieren.soort)

  // Geadopteerd per soort
  const geadopteerdQuery = db
    .select({
      soort: dieren.soort,
      aantal: count(),
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .where(
      and(
        eq(adopties.status, 'afgerond'),
        gte(adopties.adoptieDatum, startJaar),
        lt(adopties.adoptieDatum, eindJaar),
        ...(asielId ? [eq(adopties.asielId, asielId)] : [])
      )
    )
    .groupBy(dieren.soort)

  // Gemiddelde verblijfsduur
  const verblijfsduurQuery = db
    .select({
      gemDagen: sql<number>`AVG(EXTRACT(DAY FROM (${adopties.adoptieDatum} - ${dieren.binnengekomentOp})))`,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .where(
      and(
        eq(adopties.status, 'afgerond'),
        gte(adopties.adoptieDatum, startJaar),
        lt(adopties.adoptieDatum, eindJaar),
        ...(asielId ? [eq(adopties.asielId, asielId)] : [])
      )
    )

  // Totaal momenteel in opvang
  const inOpvangQuery = db
    .select({ aantal: count() })
    .from(dieren)
    .where(
      and(
        ...(asielId ? [eq(dieren.asielId, asielId)] : [])
      )
    )

  const [ingenomen, geadopteerd, verblijfsduur, inOpvang] = await Promise.all([
    ingenomenQuery,
    geadopteerdQuery,
    verblijfsduurQuery,
    inOpvangQuery,
  ])

  const soorten = ['hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig']

  const statsPerSoort = soorten.map((soort) => {
    const ing = ingenomen.find((r) => r.soort === soort)?.aantal ?? 0
    const geo = geadopteerd.find((r) => r.soort === soort)?.aantal ?? 0
    return {
      soort,
      ingenomen: Number(ing),
      geadopteerd: Number(geo),
      adoptiegraat: ing > 0 ? Math.round((Number(geo) / Number(ing)) * 100) : 0,
    }
  })

  const totaalIngenomen = statsPerSoort.reduce((s, r) => s + r.ingenomen, 0)
  const totaalGeadopteerd = statsPerSoort.reduce((s, r) => s + r.geadopteerd, 0)
  const gemVerblijf = Math.round(Number(verblijfsduur[0]?.gemDagen ?? 0))

  // Geef CSV terug als format=csv
  const format = searchParams.get('format')
  if (format === 'csv') {
    const header = 'Soort,Ingenomen,Geadopteerd,Adoptiegraad (%)\n'
    const rows = statsPerSoort
      .map((r) => `${r.soort},${r.ingenomen},${r.geadopteerd},${r.adoptiegraat}`)
      .join('\n')
    const totaal = `Totaal,${totaalIngenomen},${totaalGeadopteerd},${totaalIngenomen > 0 ? Math.round((totaalGeadopteerd / totaalIngenomen) * 100) : 0}`
    const csv = header + rows + '\n' + totaal

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rapportage-${jaar}.csv"`,
      },
    })
  }

  return NextResponse.json({
    data: {
      jaar,
      totaalIngenomen,
      totaalGeadopteerd,
      gemVerblijfsdagen: gemVerblijf,
      inOpvang: Number(inOpvang[0]?.aantal ?? 0),
      perSoort: statsPerSoort,
    },
  })
}
