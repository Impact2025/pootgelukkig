export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dossiers, begeleidingen } from '@/lib/db/schema'
import { and, eq, gte, lt, count, sql } from 'drizzle-orm'
import { PageHeader, StatCard, Card } from '@/components/admin/ui'
import RapportageDownload from './RapportageDownload'

const CATEGORIE_LABELS: Record<string, string> = {
  wmo: 'Wmo',
  participatie: 'Participatie',
  jeugd: 'Jeugd',
  reintegratie: 'Re-integratie',
  overig: 'Overig',
}

export default async function RapportagePage({
  searchParams,
}: {
  searchParams: Promise<{ jaar?: string }>
}) {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  const sp = await searchParams
  const huidigJaar = new Date().getFullYear()
  const jaar = parseInt(sp.jaar ?? String(huidigJaar))
  const geldigJaar = isNaN(jaar) ? huidigJaar : jaar

  const startJaar = new Date(`${geldigJaar}-01-01T00:00:00Z`)
  const eindJaar = new Date(`${geldigJaar + 1}-01-01T00:00:00Z`)

  const nieuwePerCategorie = await db
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

  const afgerondPerCategorie = await db
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

  const [doorlooptijdResult] = await db
    .select({
      gemDagen: sql<number>`COALESCE(AVG(EXTRACT(DAY FROM (${begeleidingen.updatedAt} - ${begeleidingen.startDatum}))), 0)`,
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

  const [openResult] = await db
    .select({ aantal: count() })
    .from(dossiers)
    .where(
      and(
        sql`${dossiers.status} != 'afgerond'`,
        ...(organisatieId ? [eq(dossiers.organisatieId, organisatieId)] : [])
      )
    )

  const categorieen = ['wmo', 'participatie', 'jeugd', 'reintegratie', 'overig']
  const statsPerCategorie = categorieen.map((categorie) => {
    const nieuw = Number(nieuwePerCategorie.find((r) => r.categorie === categorie)?.aantal ?? 0)
    const afg = Number(afgerondPerCategorie.find((r) => r.categorie === categorie)?.aantal ?? 0)
    return { categorie, nieuw, afgerond: afg, afrondingsgraad: nieuw > 0 ? Math.round((afg / nieuw) * 100) : 0 }
  })

  const totaalNieuw = statsPerCategorie.reduce((s, r) => s + r.nieuw, 0)
  const totaalAfgerond = statsPerCategorie.reduce((s, r) => s + r.afgerond, 0)
  const gemDoorlooptijd = Math.round(Number(doorlooptijdResult?.gemDagen ?? 0))
  const open = Number(openResult?.aantal ?? 0)
  const afrondingsgraad = totaalNieuw > 0 ? Math.round((totaalAfgerond / totaalNieuw) * 100) : 0

  const jaren = Array.from({ length: 5 }, (_, i) => huidigJaar - i)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Rapportage"
        icon="bar_chart"
        description="Jaaroverzicht voor gemeente & interne evaluatie"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {jaren.map((j) => (
                <a
                  key={j}
                  href={`/management/rapportage?jaar=${j}`}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    j === geldigJaar
                      ? 'bg-[#1E293B] text-white'
                      : 'bg-white border border-[#1E293B]/15 text-[#1E293B]/60 hover:text-[#1E293B]'
                  }`}
                >
                  {j}
                </a>
              ))}
            </div>
            <RapportageDownload jaar={geldigJaar} />
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label={`Nieuwe dossiers ${geldigJaar}`} value={totaalNieuw} icon="folder_open" tone="info" />
        <StatCard label={`Afgeronde begeleidingen ${geldigJaar}`} value={totaalAfgerond} icon="favorite" tone="success" />
        <StatCard label="Gem. doorlooptijd" value={`${gemDoorlooptijd}d`} icon="calendar_month" tone="warning" hint="tot afronding" />
        <StatCard label="Open dossiers nu" value={open} icon="folder" tone="neutral" hint="totaal" />
      </div>

      <Card>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#1E293B]/40 mb-1">
              Afrondingsgraad {geldigJaar}
            </p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-extrabold text-[#1E293B]">{afrondingsgraad}%</p>
              <p className="text-[#1E293B]/40 text-sm pb-1">
                {totaalAfgerond} van {totaalNieuw} dossiers
              </p>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ width: `${afrondingsgraad}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-[#1E293B]/5">
          <h2 className="font-bold text-[#1E293B]">Statistieken per categorie</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1E293B]/5 bg-gray-50/60">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Categorie</th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Nieuw</th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Afgerond</th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Afrondingsgraad</th>
              <th className="px-5 py-3.5">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {statsPerCategorie
              .filter((r) => r.nieuw > 0 || r.afgerond > 0)
              .map((r, i, arr) => (
                <tr key={r.categorie} className={`${i < arr.length - 1 ? 'border-b border-[#1E293B]/5' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#1E293B]">
                      <span className="material-symbols-outlined text-sm text-[#1E293B]/50">folder</span>
                      {CATEGORIE_LABELS[r.categorie] ?? r.categorie}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#1E293B]">{r.nieuw}</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-600">{r.afgerond}</td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        r.afrondingsgraad >= 75 ? 'bg-emerald-50 text-emerald-700' : r.afrondingsgraad >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {r.afrondingsgraad}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-24">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${r.afrondingsgraad}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            {statsPerCategorie.every((r) => r.nieuw === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#1E293B]/30 text-sm">
                  Geen gegevens voor {geldigJaar}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="bg-gray-50 border border-[#1E293B]/10 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#1E293B]/40 text-xl flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-xs font-bold text-[#1E293B]/60 mb-1">Gemeente-rapportage</p>
            <p className="text-xs text-[#1E293B]/40 leading-relaxed">
              Deze rapportage is bedoeld voor intern gebruik en als basis voor de jaarlijkse verantwoording
              richting gemeente en financiers. Exporteer de CSV als bijlage. Controleer altijd de gegevens
              voor definitieve indiening.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
