export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { favorieten, dieren, matches } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BottomNav from '@/components/layout/BottomNav'
import FavorietKnop from '@/components/animals/FavorietKnop'

export default async function FavorietenPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)

  const lijst = await db
    .select({
      dierId: dieren.id,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierRas: dieren.ras,
      dierLeeftijdJaren: dieren.leeftijdJaren,
      dierFoto: dieren.hoofdFotoUrl,
      dierStatus: dieren.status,
      aangemeldOp: favorieten.aangemaaktOp,
    })
    .from(favorieten)
    .innerJoin(dieren, eq(favorieten.dierId, dieren.id))
    .where(eq(favorieten.userId, userId))
    .orderBy(desc(favorieten.aangemaaktOp))

  // Match scores ophalen
  const matchScores = await db
    .select({ dierId: matches.dierId, score: matches.score })
    .from(matches)
    .where(eq(matches.userId, userId))

  const scoreMap = new Map(matchScores.map((m) => [m.dierId, m.score]))

  return (
    <div className="mobile-container bg-bg-dark">
      {/* Navigatie */}
      <nav className="sticky top-0 z-50 ios-blur border-b border-white/10 px-4 py-4 flex items-center justify-between bg-bg-dark/80">
        <div>
          <h1 className="text-lg font-extrabold text-white">Bewaard</h1>
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">
            {lijst.length} dier{lijst.length !== 1 ? 'en' : ''} opgeslagen
          </p>
        </div>
        <Link href="/zoeken">
          <button className="text-primary text-xs font-bold border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors">
            Meer ontdekken
          </button>
        </Link>
      </nav>

      <main className="px-4 pb-32 pt-6">
        {lijst.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-white/20 text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                favorite
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nog geen favorieten</h2>
              <p className="text-white/40 text-sm mt-1">
                Tik op het hartje op een dierkaart om op te slaan.
              </p>
            </div>
            <Link href="/dashboard">
              <button className="btn-primary">
                <span className="material-symbols-outlined">pets</span>
                Bekijk matches
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {lijst.map((item) => (
              <Link key={item.dierId} href={`/animals/${item.dierId}`}>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative hover:border-white/20 transition-colors">
                  {/* Favoriet knop */}
                  <FavorietKnop dierId={item.dierId} isGefavoriet={true} />

                  {/* Match badge */}
                  {scoreMap.has(item.dierId) && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="match-badge shadow-xl">
                        <span className="material-symbols-outlined text-[12px]">bolt</span>
                        {scoreMap.get(item.dierId)}% Match
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 p-4">
                    <div className="size-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative">
                      {item.dierFoto ? (
                        <Image
                          src={item.dierFoto}
                          alt={item.dierNaam}
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
                    <div className="flex-1 pt-1">
                      <h3 className="text-xl font-bold text-white">{item.dierNaam}</h3>
                      <p className="text-white/50 text-sm">
                        {[
                          item.dierRas ?? item.dierSoort,
                          item.dierLeeftijdJaren ? `${item.dierLeeftijdJaren} jaar` : null,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.dierStatus === 'beschikbaar'
                              ? 'bg-primary/20 text-primary'
                              : item.dierStatus === 'in_behandeling'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {item.dierStatus === 'beschikbaar'
                            ? 'Beschikbaar'
                            : item.dierStatus === 'in_behandeling'
                              ? 'In behandeling'
                              : 'Geadopteerd'}
                        </span>
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
