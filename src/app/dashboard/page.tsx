export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { matches, dieren, adopterProfielen, favorieten, asielen, users } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import MatchesGrid from './MatchesGrid'
import WelkomTour from '@/components/onboarding/WelkomTour'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)
  const voornaam = session.user.name?.split(' ')[0] ?? 'daar'

  // Gebruiker locatie ophalen
  const [gebruiker] = await db
    .select({ lat: users.lat, lng: users.lng })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const userLat = gebruiker?.lat ?? null
  const userLng = gebruiker?.lng ?? null

  // Check of profiel bestaat
  const [profiel] = await db
    .select()
    .from(adopterProfielen)
    .where(eq(adopterProfielen.userId, userId))
    .limit(1)

  // Matches ophalen (inclusief asiel-coördinaten voor km-filter)
  const userMatches = profiel
    ? await db
        .select({
          id: matches.id,
          score: matches.score,
          analyseTekst: matches.analyseTekst,
          dierId: dieren.id,
          dierNaam: dieren.naam,
          dierSoort: dieren.soort,
          dierRas: dieren.ras,
          dierLeeftijdJaren: dieren.leeftijdJaren,
          dierHoofdFotoUrl: dieren.hoofdFotoUrl,
          dierGedragsProfiel: dieren.gedragsProfiel,
          asielStad: asielen.stad,
          asielLat: asielen.lat,
          asielLng: asielen.lng,
        })
        .from(matches)
        .innerJoin(dieren, eq(matches.dierId, dieren.id))
        .leftJoin(asielen, eq(dieren.asielId, asielen.id))
        .where(eq(matches.userId, userId))
        .orderBy(desc(matches.score))
        .limit(10)
    : []

  // Beschikbare dieren (voor lege staat)
  const beschikbareDieren =
    userMatches.length === 0
      ? await db
          .select({
            id: dieren.id,
            naam: dieren.naam,
            soort: dieren.soort,
            ras: dieren.ras,
            hoofdFotoUrl: dieren.hoofdFotoUrl,
          })
          .from(dieren)
          .where(eq(dieren.status, 'beschikbaar'))
          .limit(4)
      : []

  // Favorieten ophalen
  const userFavorieten = profiel
    ? await db
        .select({ dierId: favorieten.dierId })
        .from(favorieten)
        .where(eq(favorieten.userId, userId))
    : []
  const favorietIds = new Set(userFavorieten.map((f) => f.dierId))

  const topScore = userMatches[0]?.score ?? 0

  return (
    <div className="mobile-container bg-bg-dark">
      <WelkomTour naam={session.user.name ?? 'daar'} rol={session.user.rol} />

      {/* Navigatie */}
      <nav className="sticky top-0 z-50 ios-blur border-b border-white/10 px-4 py-4 flex items-center justify-between bg-bg-dark/80">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.35rem' }}
            >
              pets
            </span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight tracking-tight text-white">
              PootGelukkig
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
              AI Dashboard
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/profiel">
            <div className="size-10 rounded-full bg-white/10 overflow-hidden border border-white/20 flex items-center justify-center hover:bg-white/15 transition-colors">
              <span className="material-symbols-outlined text-white/60">person</span>
            </div>
          </Link>
        </div>
      </nav>

      <main className="px-4 pb-32">
        {/* Welkom header */}
        <header className="pt-8 pb-6">
          <h2 className="text-3xl font-extrabold text-white">Hoi {voornaam}! 👋</h2>
          <p className="text-white/60 mt-2 text-base">
            {userMatches.length > 0 ? (
              <>
                Onze AI heeft{' '}
                <span className="text-primary font-semibold">{userMatches.length} matches</span>{' '}
                voor je klaargezet.
              </>
            ) : (
              'Doe de intake en ontdek jouw perfecte match.'
            )}
          </p>
        </header>

        {/* Match profiel widget */}
        {profiel && userMatches.length > 0 && (
          <section className="mb-6">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-primary/80 text-xs font-bold uppercase tracking-wider">
                  Jouw Match Profiel
                </p>
                <p className="text-white text-xl font-bold mt-1">
                  {topScore >= 90
                    ? 'Uitstekende'
                    : topScore >= 75
                      ? 'Hoge'
                      : 'Goede'}{' '}
                  compatibiliteit
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                  <span className="text-white/60 text-sm">Profiel voltooid</span>
                </div>
              </div>
              {/* Circulaire score */}
              <div className="relative size-16 flex items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-primary"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray={`${topScore}, 100`}
                    strokeLinecap="round"
                    strokeWidth="3"
                  />
                </svg>
                <span className="absolute text-white font-bold text-sm">{topScore}%</span>
              </div>
            </div>
          </section>
        )}

        {/* Profiel klaar maar nog geen matches */}
        {profiel && userMatches.length === 0 && (
          <section className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <div>
              <p className="font-bold text-white text-sm">AI is aan het matchen...</p>
              <p className="text-white/50 text-xs mt-0.5">Jouw matches worden zo berekend. Ververs de pagina.</p>
            </div>
          </section>
        )}

        {/* Matches of Intake CTA */}
        {userMatches.length > 0 ? (
          <>
            <MatchesGrid
              matches={userMatches}
              favorietIds={[...favorietIds]}
              userLat={userLat}
              userLng={userLng}
            />

            {/* Opnieuw intake CTA */}
            <section className="mt-8">
              <Link href="/intake">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/8 transition-colors">
                  <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">refresh</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">Intake bijwerken</p>
                    <p className="text-white/50 text-xs mt-0.5">
                      Verander je situatie? Herbereken je matches
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-white/30 ml-auto">
                    arrow_forward_ios
                  </span>
                </div>
              </Link>
            </section>
          </>
        ) : (
          /* Lege staat: intake CTA */
          <section className="space-y-6 mt-2">
            <div className="bg-primary/5 border border-primary/15 rounded-3xl p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="text-5xl">🐾</div>
                <h3 className="text-xl font-bold text-white">Klaar voor jouw perfecte match?</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Beantwoord een paar vragen en onze AI vindt het ideale asieldier voor jou.
                </p>
              </div>

              {/* Stappen */}
              <div className="space-y-3">
                {[
                  { icon: 'quiz', stap: '1', tekst: 'Beantwoord 7 vragen over je levensstijl' },
                  { icon: 'auto_awesome', stap: '2', tekst: 'AI berekent jouw persoonlijke matches' },
                  { icon: 'favorite', stap: '3', tekst: 'Ontmoet jouw perfecte dier' },
                ].map((item) => (
                  <div key={item.stap} className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-black text-xs">{item.stap}</span>
                    </div>
                    <p className="text-white/70 text-sm">{item.tekst}</p>
                  </div>
                ))}
              </div>

              <Link href="/intake">
                <button className="btn-primary w-full">
                  <span className="material-symbols-outlined">quiz</span>
                  Start de intake — 2 minuten
                </button>
              </Link>
            </div>

            {/* Dieren in het asiel preview */}
            {beschikbareDieren.length > 0 && (
              <div>
                <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
                  Wachten op een thuis
                </h3>
                <div className="space-y-3">
                  {beschikbareDieren.map((dier) => (
                    <Link key={dier.id} href={`/animals/${dier.id}`}>
                      <div className="flex items-center gap-3 p-3.5 bg-white/5 border border-white/8 rounded-2xl hover:bg-white/8 transition-colors">
                        <div className="size-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative">
                          {dier.hoofdFotoUrl ? (
                            <Image
                              src={dier.hoofdFotoUrl}
                              alt={dier.naam}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-white/20 text-xl">
                                pets
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{dier.naam}</p>
                          <p className="text-white/40 text-xs">{dier.ras ?? dier.soort}</p>
                        </div>
                        <span className="ml-auto text-white/20 text-xs">
                          <span className="material-symbols-outlined text-sm">
                            arrow_forward_ios
                          </span>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
