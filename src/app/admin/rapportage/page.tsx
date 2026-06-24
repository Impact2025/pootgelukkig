export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren, adopties } from '@/lib/db/schema'
import { and, eq, gte, lt, count, ne, sql } from 'drizzle-orm'
import { PageHeader, StatCard, Card } from '@/components/admin/ui'
import RapportageDownload from './RapportageDownload'

const SOORT_LABELS: Record<string, string> = {
  hond: 'Hond',
  kat: 'Kat',
  vogel: 'Vogel',
  konijn: 'Konijn',
  cavia: 'Cavia',
  hamster: 'Hamster',
  overig: 'Overig',
}

export default async function RapportagePage({
  searchParams,
}: {
  searchParams: Promise<{ jaar?: string }>
}) {
  const session = await auth()
  const asielId = session?.user?.asielId

  const sp = await searchParams
  const huidigJaar = new Date().getFullYear()
  const jaar = parseInt(sp.jaar ?? String(huidigJaar))
  const geldigJaar = isNaN(jaar) ? huidigJaar : jaar

  const startJaar = new Date(`${geldigJaar}-01-01T00:00:00Z`)
  const eindJaar = new Date(`${geldigJaar + 1}-01-01T00:00:00Z`)

  const ingenomenPerSoort = await db
    .select({ soort: dieren.soort, aantal: count() })
    .from(dieren)
    .where(
      and(
        gte(dieren.binnengekomentOp, startJaar),
        lt(dieren.binnengekomentOp, eindJaar),
        ...(asielId ? [eq(dieren.asielId, asielId)] : [])
      )
    )
    .groupBy(dieren.soort)

  const geadopteerdPerSoort = await db
    .select({ soort: dieren.soort, aantal: count() })
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

  const [verblijfResult] = await db
    .select({
      gemDagen: sql<number>`COALESCE(AVG(EXTRACT(DAY FROM (${adopties.adoptieDatum} - ${dieren.binnengekomentOp}))), 0)`,
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

  const [inOpvangResult] = await db
    .select({ aantal: count() })
    .from(dieren)
    .where(
      and(
        ne(dieren.status, 'geadopteerd'),
        ...(asielId ? [eq(dieren.asielId, asielId)] : [])
      )
    )

  const soorten = ['hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig']
  const statsPerSoort = soorten.map((soort) => {
    const ing = Number(ingenomenPerSoort.find((r) => r.soort === soort)?.aantal ?? 0)
    const geo = Number(geadopteerdPerSoort.find((r) => r.soort === soort)?.aantal ?? 0)
    return { soort, ingenomen: ing, geadopteerd: geo, adoptiegraad: ing > 0 ? Math.round((geo / ing) * 100) : 0 }
  })

  const totaalIngenomen = statsPerSoort.reduce((s, r) => s + r.ingenomen, 0)
  const totaalGeadopteerd = statsPerSoort.reduce((s, r) => s + r.geadopteerd, 0)
  const gemVerblijf = Math.round(Number(verblijfResult?.gemDagen ?? 0))
  const inOpvang = Number(inOpvangResult?.aantal ?? 0)
  const adoptiegraad = totaalIngenomen > 0 ? Math.round((totaalGeadopteerd / totaalIngenomen) * 100) : 0

  const jaren = Array.from({ length: 5 }, (_, i) => huidigJaar - i)

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Rapportage"
        icon="bar_chart"
        description={`Jaaroverzicht voor LNV & interne evaluatie`}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {jaren.map((j) => (
                <a
                  key={j}
                  href={`/admin/rapportage?jaar=${j}`}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    j === geldigJaar
                      ? 'bg-[#33335c] text-white'
                      : 'bg-white border border-[#33335c]/15 text-[#33335c]/60 hover:text-[#33335c]'
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
        <StatCard label={`Ingenomen in ${geldigJaar}`} value={totaalIngenomen} icon="input" tone="info" />
        <StatCard label={`Geadopteerd in ${geldigJaar}`} value={totaalGeadopteerd} icon="favorite" tone="success" />
        <StatCard label="Gem. verblijf" value={`${gemVerblijf}d`} icon="calendar_month" tone="warning" hint="voor adoptie" />
        <StatCard label="In opvang nu" value={inOpvang} icon="home" tone="neutral" hint="dieren totaal" />
      </div>

      <Card>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#33335c]/40 mb-1">
              Totale adoptiegraad {geldigJaar}
            </p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-extrabold text-[#33335c]">{adoptiegraad}%</p>
              <p className="text-[#33335c]/40 text-sm pb-1">
                {totaalGeadopteerd} van {totaalIngenomen} dieren
              </p>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f8aa25] rounded-full transition-all duration-500"
                style={{ width: `${adoptiegraad}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card padding={false}>
        <div className="px-5 py-4 border-b border-[#33335c]/5">
          <h2 className="font-bold text-[#33335c]">Statistieken per diersoort</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#33335c]/5 bg-gray-50/60">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                Soort
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                Ingenomen
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                Geadopteerd
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                Adoptiegraad
              </th>
              <th className="px-5 py-3.5">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {statsPerSoort
              .filter((r) => r.ingenomen > 0 || r.geadopteerd > 0)
              .map((r, i, arr) => (
                <tr
                  key={r.soort}
                  className={`${i < arr.length - 1 ? 'border-b border-[#33335c]/5' : ''} hover:bg-gray-50/50 transition-colors`}
                >
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#33335c]">
                      <span className="material-symbols-outlined text-sm text-[#33335c]/50">pets</span>
                      {SOORT_LABELS[r.soort] ?? r.soort}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-[#33335c]">{r.ingenomen}</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-600">{r.geadopteerd}</td>
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        r.adoptiegraad >= 75
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.adoptiegraad >= 50
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {r.adoptiegraad}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="w-24">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#f8aa25] rounded-full"
                          style={{ width: `${r.adoptiegraad}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            {statsPerSoort.every((r) => r.ingenomen === 0) && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-[#33335c]/30 text-sm">
                  Geen gegevens voor {geldigJaar}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="bg-gray-50 border border-[#33335c]/10 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#33335c]/40 text-xl flex-shrink-0 mt-0.5">info</span>
          <div>
            <p className="text-xs font-bold text-[#33335c]/60 mb-1">LNV Rapportage</p>
            <p className="text-xs text-[#33335c]/40 leading-relaxed">
              Deze rapportage is bedoeld voor intern gebruik en als basis voor de jaarlijkse LNV
              (Ministerie van Landbouw, Natuur en Voedselkwaliteit) verantwoording. Exporteer de CSV voor
              het invullen van het officiële LNV-formulier. Controleer altijd de gegevens voor definitieve
              indiening.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
