'use client'

import { useState } from 'react'
import AnimalCard from '@/components/animals/AnimalCard'

interface Match {
  id: number
  score: number
  analyseTekst: string | null
  dierId: number
  dierNaam: string
  dierSoort: string
  dierRas: string | null
  dierLeeftijdJaren: number | null
  dierHoofdFotoUrl: string | null
  dierGedragsProfiel: {
    energieNiveau?: string
    tags?: string[]
  } | null
  asielStad: string | null
  asielLat: number | null
  asielLng: number | null
}

type Filter = 'alle' | 'hond' | 'kat' | 'senior' | 'jong'
type KmFilter = 'alle' | 10 | 25 | 50

const FILTERS: { id: Filter; label: string; icon: string }[] = [
  { id: 'alle', label: 'Alle matches', icon: 'filter_alt' },
  { id: 'hond', label: 'Honden', icon: 'pets' },
  { id: 'kat', label: 'Katten', icon: 'cruelty_free' },
  { id: 'jong', label: 'Jong (< 3j)', icon: 'toys' },
  { id: 'senior', label: 'Senior', icon: 'elderly' },
]

const KM_OPTIES: { waarde: KmFilter; label: string }[] = [
  { waarde: 'alle', label: 'Alle afstanden' },
  { waarde: 10, label: '< 10 km' },
  { waarde: 25, label: '< 25 km' },
  { waarde: 50, label: '< 50 km' },
]

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function MatchesGrid({
  matches,
  favorietIds,
  userLat,
  userLng,
}: {
  matches: Match[]
  favorietIds: number[]
  userLat: number | null
  userLng: number | null
}) {
  const [actief, setActief] = useState<Filter>('alle')
  const [kmFilter, setKmFilter] = useState<KmFilter>('alle')
  const favorietSet = new Set(favorietIds)

  const heeftLocatie = userLat !== null && userLng !== null

  // Bereken afstand per match
  const matchesMetAfstand = matches.map((m) => {
    const afstand =
      heeftLocatie && m.asielLat && m.asielLng
        ? Math.round(haversineKm(userLat!, userLng!, m.asielLat, m.asielLng))
        : null
    return { ...m, afstandKm: afstand }
  })

  const gefilterd = matchesMetAfstand.filter((m) => {
    const soorFilter =
      actief === 'alle' ||
      (actief === 'hond' && m.dierSoort === 'hond') ||
      (actief === 'kat' && m.dierSoort === 'kat') ||
      (actief === 'jong' && (m.dierLeeftijdJaren ?? 99) < 3) ||
      (actief === 'senior' && (m.dierLeeftijdJaren ?? 0) >= 7)

    const afstandOk =
      kmFilter === 'alle' || m.afstandKm === null || m.afstandKm <= kmFilter

    return soorFilter && afstandOk
  })

  return (
    <>
      {/* Soort filters */}
      <section className="mb-4">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {FILTERS.map((f) => {
            const isActief = actief === f.id
            const count =
              f.id === 'alle'
                ? matches.length
                : matches.filter((m) => {
                    if (f.id === 'hond') return m.dierSoort === 'hond'
                    if (f.id === 'kat') return m.dierSoort === 'kat'
                    if (f.id === 'jong') return (m.dierLeeftijdJaren ?? 99) < 3
                    if (f.id === 'senior') return (m.dierLeeftijdJaren ?? 0) >= 7
                    return false
                  }).length
            if (count === 0 && f.id !== 'alle') return null
            return (
              <button
                key={f.id}
                onClick={() => setActief(f.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap flex-shrink-0 transition-all ${
                  isActief
                    ? 'bg-primary text-bg-dark shadow-lg shadow-primary/20'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{f.icon}</span>
                {f.label}
                {count > 0 && f.id !== 'alle' && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActief ? 'bg-bg-dark/20' : 'bg-white/10'}`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Km filter — alleen tonen als gebruiker locatie heeft */}
      {heeftLocatie && (
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-white/40 text-sm">near_me</span>
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Afstand</span>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {KM_OPTIES.map((opt) => {
              const isActief = kmFilter === opt.waarde
              return (
                <button
                  key={String(opt.waarde)}
                  onClick={() => setKmFilter(opt.waarde)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                    isActief
                      ? 'bg-primary/20 border border-primary/50 text-primary'
                      : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {opt.waarde !== 'alle' && (
                    <span className="material-symbols-outlined text-xs">location_on</span>
                  )}
                  {opt.label}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Match kaarten */}
      <section className="space-y-5">
        <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest px-1">
          {actief === 'alle' ? 'Aanbevolen voor jou' : FILTERS.find((f) => f.id === actief)?.label}{' '}
          — {gefilterd.length} {gefilterd.length === 1 ? 'match' : 'matches'}
        </h3>

        {gefilterd.length === 0 ? (
          <div className="py-12 text-center">
            <span className="material-symbols-outlined text-white/20 text-5xl block mb-3">
              search_off
            </span>
            <p className="text-white/40 text-sm">Geen matches voor dit filter.</p>
            <button
              onClick={() => { setActief('alle'); setKmFilter('alle') }}
              className="mt-3 text-primary text-sm font-bold border border-primary/30 px-4 py-1.5 rounded-full"
            >
              Toon alles
            </button>
          </div>
        ) : (
          gefilterd.map((match) => (
            <AnimalCard
              key={match.id}
              id={match.dierId}
              naam={match.dierNaam}
              soort={match.dierSoort}
              ras={match.dierRas}
              leeftijdJaren={match.dierLeeftijdJaren}
              hoofdFotoUrl={match.dierHoofdFotoUrl}
              score={match.score}
              analyseTekst={match.analyseTekst}
              energieNiveau={match.dierGedragsProfiel?.energieNiveau}
              gedragTags={match.dierGedragsProfiel?.tags}
              isGefavoriet={favorietSet.has(match.dierId)}
              afstandKm={match.afstandKm}
              asielStad={match.asielStad}
            />
          ))
        )}
      </section>
    </>
  )
}
