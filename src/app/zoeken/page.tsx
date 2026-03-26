export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { dieren, asielen, favorieten } from '@/lib/db/schema'
import { and, eq, lte } from 'drizzle-orm'
import BottomNav from '@/components/layout/BottomNav'
import ZoekenFilters from './ZoekenFilters'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import FavorietKnop from '@/components/animals/FavorietKnop'

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

  // Optioneel ingelogd — voor favoriet-knoppen
  const session = await auth()
  const userId = session?.user ? parseInt(session.user.id) : null
  const userFavorieten = userId
    ? await db.select({ dierId: favorieten.dierId }).from(favorieten).where(eq(favorieten.userId, userId))
    : []
  const favorietIds = new Set(userFavorieten.map((f) => f.dierId))

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
          <div className="space-y-5">
            {resultaten.map((dier) => (
              <Link key={dier.id} href={`/animals/${dier.id}`}>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative hover:border-white/25 hover:shadow-xl hover:shadow-black/20 transition-all duration-200 group">
                  {/* Favoriet knop */}
                  {userId && (
                    <FavorietKnop dierId={dier.id} isGefavoriet={favorietIds.has(dier.id)} />
                  )}

                  {/* Foto */}
                  <div className="h-52 w-full bg-white/10 relative overflow-hidden">
                    {dier.hoofdFotoUrl ? (
                      <Image
                        src={dier.hoofdFotoUrl}
                        alt={dier.naam}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20 text-6xl">pets</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12122a]/80 via-transparent to-transparent" />

                    {/* Energie badge */}
                    {dier.gedragsProfiel?.energieNiveau && (
                      <div className="absolute top-4 left-4">
                        <span className="flex items-center gap-1 text-[10px] bg-primary text-bg-dark px-2.5 py-1 rounded-full font-extrabold shadow-lg">
                          <span className="material-symbols-outlined text-[10px]">bolt</span>
                          {energieLabel[dier.gedragsProfiel.energieNiveau] ?? dier.gedragsProfiel.energieNiveau}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-extrabold text-white leading-none">{dier.naam}</h3>
                        <p className="text-white/50 text-sm mt-1.5">
                          {[dier.ras ?? dier.soort, dier.leeftijdJaren ? `${dier.leeftijdJaren} jaar` : null, dier.geslacht]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>

                    {/* Behavior tags */}
                    {(dier.gedragsProfiel?.tags?.length ?? 0) > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(dier.gedragsProfiel?.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] bg-white/8 text-white/50 px-2.5 py-1 rounded-full">
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Asiel + cta */}
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-white/30 text-xs flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">home_work</span>
                        {dier.asielNaam} · {dier.asielStad}
                      </p>
                      <div className="flex items-center gap-1 text-primary/80 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Bekijk
                      </div>
                    </div>
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
