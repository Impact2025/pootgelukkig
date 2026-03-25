export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { dieren, asielen } from '@/lib/db/schema'
import { and, eq, lte, ilike, or } from 'drizzle-orm'
import BottomNav from '@/components/layout/BottomNav'
import ZoekenFilters from './ZoekenFilters'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  searchParams: Promise<{
    q?: string
    soort?: string
    leeftijdMax?: string
    energie?: string
    regio?: string
  }>
}

export default async function ZoekenPage({ searchParams }: Props) {
  const params = await searchParams
  const { q, soort, leeftijdMax, energie, regio } = params

  const filters = [eq(dieren.status, 'beschikbaar')]

  if (soort && soort !== 'alles') {
    filters.push(eq(dieren.soort, soort as 'hond' | 'kat' | 'vogel' | 'konijn' | 'cavia' | 'hamster' | 'overig'))
  }

  if (leeftijdMax) {
    filters.push(lte(dieren.leeftijdJaren, parseInt(leeftijdMax)))
  }

  if (regio && regio !== 'alles') {
    filters.push(eq(asielen.regio, regio))
  }

  let resultaten = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      geslacht: dieren.geslacht,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      gedragsProfiel: dieren.gedragsProfiel,
      asielNaam: asielen.naam,
      asielStad: asielen.stad,
      asielRegio: asielen.regio,
      asielId: dieren.asielId,
    })
    .from(dieren)
    .innerJoin(asielen, eq(dieren.asielId, asielen.id))
    .where(and(...filters))
    .limit(50)

  // Zoekterm filter (naam of ras)
  if (q) {
    const term = q.toLowerCase()
    resultaten = resultaten.filter(
      (d) =>
        d.naam.toLowerCase().includes(term) ||
        (d.ras ?? '').toLowerCase().includes(term) ||
        d.soort.toLowerCase().includes(term)
    )
  }

  // Energie filter (JSON veld — post-filter)
  if (energie && energie !== 'alles') {
    resultaten = resultaten.filter((d) => d.gedragsProfiel?.energieNiveau === energie)
  }

  // Unieke regio's voor filter
  const regios = await db
    .select({ regio: asielen.regio })
    .from(asielen)
    .groupBy(asielen.regio)

  const energieLabel: Record<string, string> = {
    laag: 'Rustig',
    normaal: 'Normaal',
    hoog: 'Actief',
    zeer_hoog: 'Heel actief',
  }

  return (
    <div className="mobile-container bg-bg-dark">
      {/* Header */}
      <nav className="sticky top-0 z-50 ios-blur border-b border-white/10 px-4 pt-4 pb-3 bg-bg-dark/80">
        <h1 className="text-lg font-extrabold text-white mb-3">Zoeken</h1>
        <ZoekenFilters
          initQ={q ?? ''}
          initSoort={soort ?? 'alles'}
          initLeeftijdMax={leeftijdMax ?? ''}
          initEnergie={energie ?? 'alles'}
          initRegio={regio ?? 'alles'}
          regios={regios.map((r) => r.regio)}
        />
      </nav>

      <main className="px-4 pb-32 pt-4">
        {/* Resultaatteller */}
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">
          {resultaten.length} dier{resultaten.length !== 1 ? 'en' : ''} gevonden
        </p>

        {resultaten.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <span className="material-symbols-outlined text-white/20 text-5xl">search_off</span>
            <p className="text-white/40 text-sm">Geen dieren gevonden met deze filters.</p>
            <Link href="/zoeken">
              <button className="text-primary text-sm font-bold border border-primary/30 px-4 py-2 rounded-full">
                Wis filters
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {resultaten.map((dier) => (
              <Link key={dier.id} href={`/animals/${dier.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex gap-0 hover:border-white/20 transition-colors">
                  {/* Foto */}
                  <div className="w-28 h-28 bg-white/10 flex-shrink-0 relative">
                    {dier.hoofdFotoUrl ? (
                      <Image
                        src={dier.hoofdFotoUrl}
                        alt={dier.naam}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-3xl">
                          pets
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">{dier.naam}</h3>
                        <p className="text-white/50 text-xs mt-0.5">
                          {[dier.ras ?? dier.soort, dier.leeftijdJaren ? `${dier.leeftijdJaren}j` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-white/20 text-base flex-shrink-0">
                        arrow_forward_ios
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {dier.gedragsProfiel?.energieNiveau && (
                        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-bold">
                          {energieLabel[dier.gedragsProfiel.energieNiveau]}
                        </span>
                      )}
                      {dier.gedragsProfiel?.kindvriendelijk && (
                        <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                          Kindvriendelijk
                        </span>
                      )}
                      {dier.gedragsProfiel?.tags?.slice(0, 1).map((tag) => (
                        <span key={tag} className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Asiel */}
                    <p className="text-white/30 text-[10px] mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">home_work</span>
                      {dier.asielNaam} · {dier.asielStad}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
