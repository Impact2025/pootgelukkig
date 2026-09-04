import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dossiers, begeleidingen } from '@/lib/db/schema'
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

  const organisatieId = session.user.organisatieId
  const startJaar = new Date(`${jaar}-01-01T00:00:00Z`)
  const eindJaar = new Date(`${jaar + 1}-01-01T00:00:00Z`)

  // Nieuwe dossiers per categorie
  const nieuweDossiersQuery = db
    .select({ categorie: dossiers.categorie, aantal: count() })
    .from(dossiers)
    .where(
      and(
        gte(dossiers.createdAt, startJaar),
        lt(dossiers.createdAt, eindJaar),
        ...(organisatieId ? [eq(dossiers.organisatieId, organisatieId)] : [])
      )
    )
    .groupBy(dossiers.categorie)

  // Afgeronde begeleidingen per dossier-categorie
  const afgerondQuery = db
    .select({ categorie: dossiers.categorie, aantal: count() })
    .from(begeleidingen)
    .innerJoin(dossiers, eq(begeleidingen.dossierId, dossiers.id))
    .where(
      and(
        eq(begeleidingen.status, 'afgerond'),
        gte(begeleidingen.updatedAt, startJaar),
        lt(begeleidingen.updatedAt, eindJaar),
        ...(organisatieId ? [eq(begeleidingen.organisatieId, organisatieId)] : [])
      )
    )
    .groupBy(dossiers.categorie)

  // Gemiddelde doorlooptijd (dagen) van afgeronde begeleidingen
  const doorlooptijdQuery = db
    .select({
      gemDagen: sql<number>`AVG(EXTRACT(DAY FROM (${begeleidingen.updatedAt} - ${begeleidingen.startDatum})))`,
    })
    .from(begeleidingen)
    .where(
      and(
        eq(begeleidingen.status, 'afgerond'),
        gte(begeleidingen.updatedAt, startJaar),
        lt(begeleidingen.updatedAt, eindJaar),
        ...(organisatieId ? [eq(begeleidingen.organisatieId, organisatieId)] : [])
      )
    )

  // Totaal momenteel open (niet-afgerond)
  const openQuery = db
    .select({ aantal: count() })
    .from(dossiers)
    .where(
      and(
        sql`${dossiers.status} != 'afgerond'`,
        ...(organisatieId ? [eq(dossiers.organisatieId, organisatieId)] : [])
      )
    )

  const [nieuweDossiers, afgerond, doorlooptijd, open] = await Promise.all([
    nieuweDossiersQuery,
    afgerondQuery,
    doorlooptijdQuery,
    openQuery,
  ])

  const categorieen = ['wmo', 'participatie', 'jeugd', 'reintegratie', 'overig']

  const statsPerCategorie = categorieen.map((categorie) => {
    const nieuw = nieuweDossiers.find((r) => r.categorie === categorie)?.aantal ?? 0
    const afg = afgerond.find((r) => r.categorie === categorie)?.aantal ?? 0
    return {
      categorie,
      nieuweDossiers: Number(nieuw),
      afgerondeBegeleidingen: Number(afg),
    }
  })

  const totaalNieuw = statsPerCategorie.reduce((s, r) => s + r.nieuweDossiers, 0)
  const totaalAfgerond = statsPerCategorie.reduce((s, r) => s + r.afgerondeBegeleidingen, 0)
  const gemDoorlooptijd = Math.round(Number(doorlooptijd[0]?.gemDagen ?? 0))

  // Geef CSV terug als format=csv
  const format = searchParams.get('format')
  if (format === 'csv') {
    const header = 'Categorie,Nieuwe dossiers,Afgeronde begeleidingen\n'
    const rows = statsPerCategorie
      .map((r) => `${r.categorie},${r.nieuweDossiers},${r.afgerondeBegeleidingen}`)
      .join('\n')
    const totaal = `Totaal,${totaalNieuw},${totaalAfgerond}`
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
      totaalNieuweDossiers: totaalNieuw,
      totaalAfgerondeBegeleidingen: totaalAfgerond,
      gemDoorlooptijdDagen: gemDoorlooptijd,
      open: Number(open[0]?.aantal ?? 0),
      perCategorie: statsPerCategorie,
    },
  })
}
