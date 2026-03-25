'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'

interface Props {
  initQ: string
  initSoort: string
  initLeeftijdMax: string
  initEnergie: string
  initRegio: string
  regios: string[]
}

const SOORTEN = [
  { waarde: 'alles', label: 'Alle dieren', icon: 'pets' },
  { waarde: 'hond', label: 'Hond', icon: 'pets' },
  { waarde: 'kat', label: 'Kat', icon: 'cruelty_free' },
  { waarde: 'konijn', label: 'Konijn', icon: 'cruelty_free' },
  { waarde: 'overig', label: 'Overig', icon: 'more_horiz' },
]

const ENERGIE = [
  { waarde: 'alles', label: 'Alle energie' },
  { waarde: 'laag', label: 'Rustig' },
  { waarde: 'normaal', label: 'Normaal' },
  { waarde: 'hoog', label: 'Actief' },
  { waarde: 'zeer_hoog', label: 'Heel actief' },
]

export default function ZoekenFilters({
  initQ,
  initSoort,
  initLeeftijdMax,
  initEnergie,
  initRegio,
  regios,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(initQ)
  const [soort, setSoort] = useState(initSoort)
  const [leeftijdMax, setLeeftijdMax] = useState(initLeeftijdMax)
  const [energie, setEnergie] = useState(initEnergie)
  const [regio, setRegio] = useState(initRegio)
  const [toonGeavanceerd, setToonGeavanceerd] = useState(!!(initLeeftijdMax || initEnergie !== 'alles' || initRegio !== 'alles'))

  const zoek = useCallback(
    (overrides: Partial<{ q: string; soort: string; leeftijdMax: string; energie: string; regio: string }> = {}) => {
      const huidig = { q, soort, leeftijdMax, energie, regio, ...overrides }
      const params = new URLSearchParams()
      if (huidig.q) params.set('q', huidig.q)
      if (huidig.soort !== 'alles') params.set('soort', huidig.soort)
      if (huidig.leeftijdMax) params.set('leeftijdMax', huidig.leeftijdMax)
      if (huidig.energie !== 'alles') params.set('energie', huidig.energie)
      if (huidig.regio !== 'alles') params.set('regio', huidig.regio)
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [q, soort, leeftijdMax, energie, regio, router, pathname]
  )

  return (
    <div className="space-y-3">
      {/* Zoekbalk */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/30 text-xl">
          search
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && zoek({ q })}
          placeholder="Zoek op naam, ras of soort..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
        {isPending && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 size-4 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
        )}
      </div>

      {/* Soort chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {SOORTEN.map((s) => (
          <button
            key={s.waarde}
            onClick={() => {
              setSoort(s.waarde)
              zoek({ soort: s.waarde })
            }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              soort === s.waarde
                ? 'bg-primary text-bg-dark border-primary'
                : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => setToonGeavanceerd((v) => !v)}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border bg-white/5 text-white/60 border-white/10 hover:border-white/20 transition-all"
        >
          <span className="material-symbols-outlined text-xs">tune</span>
          Filters
          {toonGeavanceerd && (
            <span className="size-1.5 rounded-full bg-primary ml-0.5" />
          )}
        </button>
      </div>

      {/* Geavanceerde filters */}
      {toonGeavanceerd && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Energie */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">
                Energieniveau
              </label>
              <select
                value={energie}
                onChange={(e) => {
                  setEnergie(e.target.value)
                  zoek({ energie: e.target.value })
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                {ENERGIE.map((e) => (
                  <option key={e.waarde} value={e.waarde} className="bg-[#33335c]">
                    {e.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max leeftijd */}
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">
                Max leeftijd
              </label>
              <select
                value={leeftijdMax}
                onChange={(e) => {
                  setLeeftijdMax(e.target.value)
                  zoek({ leeftijdMax: e.target.value })
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="" className="bg-[#33335c]">Alle leeftijden</option>
                <option value="1" className="bg-[#33335c]">Jonger dan 1 jaar</option>
                <option value="3" className="bg-[#33335c]">Jonger dan 3 jaar</option>
                <option value="7" className="bg-[#33335c]">Jonger dan 7 jaar</option>
                <option value="10" className="bg-[#33335c]">Jonger dan 10 jaar</option>
              </select>
            </div>
          </div>

          {/* Regio */}
          {regios.length > 0 && (
            <div>
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mb-1.5">
                Regio
              </label>
              <select
                value={regio}
                onChange={(e) => {
                  setRegio(e.target.value)
                  zoek({ regio: e.target.value })
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="alles" className="bg-[#33335c]">Heel Nederland</option>
                {regios.map((r) => (
                  <option key={r} value={r} className="bg-[#33335c]">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
