export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren, asielen } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminDierenPage() {
  const session = await auth()
  const asielId = session?.user?.asielId

  const alleDieren = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      geslacht: dieren.geslacht,
      status: dieren.status,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      binnengekomentOp: dieren.binnengekomentOp,
      gedragsProfiel: dieren.gedragsProfiel,
      asielNaam: asielen.naam,
      asielStad: asielen.stad,
    })
    .from(dieren)
    .leftJoin(asielen, eq(dieren.asielId, asielen.id))
    .where(asielId ? eq(dieren.asielId, asielId) : undefined)
    .orderBy(desc(dieren.binnengekomentOp))

  // Status counts
  const statusCounts = alleDieren.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
    beschikbaar: {
      label: 'Beschikbaar',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200',
    },
    in_behandeling: {
      label: 'In behandeling',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      border: 'border-amber-200',
    },
    geadopteerd: {
      label: 'Geadopteerd',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200',
    },
    niet_beschikbaar: {
      label: 'Niet beschikbaar',
      bg: 'bg-gray-50',
      text: 'text-gray-500',
      dot: 'bg-gray-400',
      border: 'border-gray-200',
    },
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#33335c]">Alle dieren</h1>
          <p className="text-[#33335c]/40 mt-1 text-sm font-medium">{alleDieren.length} dieren in totaal</p>
        </div>
        <Link href="/admin/dieren/nieuw">
          <button className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-5 py-3 rounded-2xl hover:bg-[#33335c]/90 transition-colors text-sm shadow-lg shadow-[#33335c]/20">
            <span className="material-symbols-outlined text-base">add</span>
            Dier toevoegen
          </button>
        </Link>
      </div>

      {/* Status summary */}
      {alleDieren.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {Object.entries(statusConfig).map(([key, cfg]) => {
            const n = statusCounts[key] ?? 0
            if (n === 0) return null
            return (
              <div
                key={key}
                className={`flex items-center gap-2 ${cfg.bg} border ${cfg.border} rounded-xl px-4 py-2.5`}
              >
                <span className={`size-2 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                <span className={`text-xs font-extrabold ${cfg.text} opacity-70`}>{n}</span>
              </div>
            )
          })}
        </div>
      )}

      {alleDieren.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <span className="material-symbols-outlined text-gray-200 text-6xl block mb-4">pets</span>
          <p className="text-gray-500 font-semibold text-base mb-1">Nog geen dieren in het systeem</p>
          <p className="text-gray-400 text-sm mb-6">Voeg je eerste dier toe om te beginnen</p>
          <Link href="/admin/dieren/nieuw">
            <button className="bg-[#33335c] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#33335c]/90 transition-colors shadow-lg shadow-[#33335c]/20">
              Eerste dier toevoegen
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alleDieren.map((dier) => {
            const cfg = statusConfig[dier.status] ?? statusConfig.niet_beschikbaar
            return (
              <div
                key={dier.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all group"
              >
                <Link href={`/animals/${dier.id}`} className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                  {/* Foto */}
                  <div className="size-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {dier.hoofdFotoUrl ? (
                      <Image
                        src={dier.hoofdFotoUrl}
                        alt={dier.naam}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-300 text-2xl">pets</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-extrabold text-[#33335c]">{dier.naam}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {[dier.ras ?? dier.soort, dier.leeftijdJaren ? `${dier.leeftijdJaren} jaar` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 flex-shrink-0 ${cfg.bg} border ${cfg.border} px-2.5 py-1 rounded-full`}
                      >
                        <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                        <span className={`text-[10px] font-bold ${cfg.text}`}>{cfg.label}</span>
                      </div>
                    </div>

                    {dier.asielNaam && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="material-symbols-outlined text-gray-300 text-sm">home_work</span>
                        <span className="text-gray-400 text-xs">
                          {dier.asielNaam}
                          {dier.asielStad ? `, ${dier.asielStad}` : ''}
                        </span>
                      </div>
                    )}

                    {dier.gedragsProfiel?.tags && dier.gedragsProfiel.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {dier.gedragsProfiel.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>

                <div className="border-t border-gray-50 px-4 py-3 flex items-center justify-between bg-gray-50/30">
                  <span className="text-gray-400 text-xs">
                    Binnengekomen{' '}
                    {new Date(dier.binnengekomentOp).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/dieren/${dier.id}`}
                      className="flex items-center gap-1 text-[#33335c]/50 text-xs font-bold hover:text-[#33335c] transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      Bewerken
                    </Link>
                    <Link
                      href={`/animals/${dier.id}`}
                      target="_blank"
                      className="flex items-center gap-1 bg-[#33335c] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#33335c]/90 transition-colors"
                    >
                      Bekijk profiel
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
