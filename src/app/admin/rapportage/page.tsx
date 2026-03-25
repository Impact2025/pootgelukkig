export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { dieren, adopties } from '@/lib/db/schema'
import { and, eq, gte, lt, count, ne, sql } from 'drizzle-orm'
import RapportageDownload from './RapportageDownload'

const soortEmoji: Record<string, string> = {
  hond: '🐕',
  kat: '🐈',
  vogel: '🦜',
  konijn: '🐇',
  cavia: '🐹',
  hamster: '🐹',
  overig: '🐾',
}

const soortLabel: Record<string, string> = {
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
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const sp = await searchParams
  const huidigJaar = new Date().getFullYear()
  const jaar = parseInt(sp.jaar ?? String(huidigJaar))
  const geldigJaar = isNaN(jaar) ? huidigJaar : jaar

  const asielId = session.user.asielId
  const startJaar = new Date(`${geldigJaar}-01-01T00:00:00Z`)
  const eindJaar = new Date(`${geldigJaar + 1}-01-01T00:00:00Z`)

  // Ingenomen per soort
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

  // Geadopteerd per soort
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

  // Gemiddelde verblijfsduur
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

  // In opvang nu
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
    return {
      soort,
      ingenomen: ing,
      geadopteerd: geo,
      adoptiegraad: ing > 0 ? Math.round((geo / ing) * 100) : 0,
    }
  })

  const totaalIngenomen = statsPerSoort.reduce((s, r) => s + r.ingenomen, 0)
  const totaalGeadopteerd = statsPerSoort.reduce((s, r) => s + r.geadopteerd, 0)
  const gemVerblijf = Math.round(Number(verblijfResult?.gemDagen ?? 0))
  const inOpvang = Number(inOpvangResult?.aantal ?? 0)
  const adoptiegraad = totaalIngenomen > 0 ? Math.round((totaalGeadopteerd / totaalIngenomen) * 100) : 0

  const jaren = Array.from({ length: 5 }, (_, i) => huidigJaar - i)

  const kpiKaarten = [
    {
      label: 'Ingenomen',
      waarde: totaalIngenomen,
      sub: `in ${geldigJaar}`,
      icon: 'input',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconKleur: '#2563eb',
    },
    {
      label: 'Geadopteerd',
      waarde: totaalGeadopteerd,
      sub: `in ${geldigJaar}`,
      icon: 'favorite',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconKleur: '#059669',
    },
    {
      label: 'Gem. verblijf',
      waarde: `${gemVerblijf}d`,
      sub: 'voor adoptie',
      icon: 'calendar_month',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconKleur: '#d97706',
    },
    {
      label: 'In opvang nu',
      waarde: inOpvang,
      sub: 'dieren totaal',
      icon: 'home',
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      iconKleur: '#7c3aed',
    },
  ]

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Rapportage</h1>
          <p className="text-sm text-[#33335c]/50 mt-1">Jaaroverzicht voor LNV &amp; interne evaluatie</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Jaar selector */}
          <div className="flex gap-1">
            {jaren.map((j) => (
              <a
                key={j}
                href={`/admin/rapportage?jaar=${j}`}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                  j === geldigJaar
                    ? 'bg-[#33335c] text-white'
                    : 'bg-white border border-gray-200 text-[#33335c]/60 hover:text-[#33335c]'
                }`}
              >
                {j}
              </a>
            ))}
          </div>
          <RapportageDownload jaar={geldigJaar} />
        </div>
      </div>

      {/* KPI kaarten */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpiKaarten.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-black/[0.04]`}>
            <div className={`size-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
              <span
                className="material-symbols-outlined text-xl"
                style={{ color: stat.iconKleur, fontVariationSettings: "'FILL' 1" }}
              >
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[#33335c] tabular-nums">{stat.waarde}</p>
            <p className="text-[#33335c]/60 text-xs font-bold mt-1 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className="text-[#33335c]/30 text-[10px] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Adoptiegraad */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex items-center gap-6">
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

      {/* Tabel per soort */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-[#33335c]">Statistieken per diersoort</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/60">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Soort
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ingenomen
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Geadopteerd
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                Adoptiegraad
              </th>
              <th className="px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody>
            {statsPerSoort
              .filter((r) => r.ingenomen > 0 || r.geadopteerd > 0)
              .map((r, i, arr) => (
                <tr
                  key={r.soort}
                  className={`${i < arr.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}
                >
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[#33335c]">
                      <span className="text-base">{soortEmoji[r.soort] ?? '🐾'}</span>
                      {soortLabel[r.soort] ?? r.soort}
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
      </div>

      {/* LNV disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-gray-400 text-xl flex-shrink-0 mt-0.5">
            info
          </span>
          <div>
            <p className="text-xs font-bold text-[#33335c]/60 mb-1">LNV Rapportage</p>
            <p className="text-xs text-[#33335c]/40 leading-relaxed">
              Deze rapportage is bedoeld voor intern gebruik en als basis voor de jaarlijkse LNV
              (Ministerie van Landbouw, Natuur en Voedselkwaliteit) verantwoording. Exporteer de CSV
              voor het invullen van het officiële LNV-formulier. Controleer altijd de gegevens voor
              definitieve indiening.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
