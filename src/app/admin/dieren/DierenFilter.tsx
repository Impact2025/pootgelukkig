'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { cx } from '@/components/admin/ui'

const STATUSSEN = [
  { value: '', label: 'Alle statussen' },
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'in_behandeling', label: 'In behandeling' },
  { value: 'geadopteerd', label: 'Geadopteerd' },
  { value: 'niet_beschikbaar', label: 'Niet beschikbaar' },
]

export default function DierenFilter({ totaal }: { totaal: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const q = params.get('q') ?? ''
  const status = params.get('status') ?? ''

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) {
        next.set(key, value)
      } else {
        next.delete(key)
      }
      next.delete('pagina')
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`, { scroll: false })
      })
    },
    [params, pathname, router]
  )

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Zoekbalk */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <span
          className={cx(
            'material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none',
            pending ? 'text-[#f8aa25] animate-pulse' : 'text-[#33335c]/30'
          )}
        >
          search
        </span>
        <input
          type="search"
          placeholder="Zoek op naam of ras…"
          defaultValue={q}
          onChange={(e) => update('q', e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#33335c]/10 rounded-xl text-sm text-[#33335c] placeholder:text-[#33335c]/30 focus:outline-none focus:ring-2 focus:ring-[#33335c]/15 focus:border-[#33335c]/20"
        />
      </div>

      {/* Status filter */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none text-[#33335c]/30">
          filter_list
        </span>
        <select
          value={status}
          onChange={(e) => update('status', e.target.value)}
          className="pl-9 pr-8 py-2.5 bg-white border border-[#33335c]/10 rounded-xl text-sm text-[#33335c] focus:outline-none focus:ring-2 focus:ring-[#33335c]/15 focus:border-[#33335c]/20 appearance-none cursor-pointer"
        >
          {STATUSSEN.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-[#33335c]/30">
          expand_more
        </span>
      </div>

      {/* Actieve filter teller */}
      {(q || status) && (
        <button
          onClick={() => {
            startTransition(() => {
              router.push(pathname, { scroll: false })
            })
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-[#33335c]/50 hover:text-[#33335c] transition-colors"
        >
          <span className="material-symbols-outlined text-sm">close</span>
          Wis filters
        </button>
      )}

      <span className="text-xs font-medium text-[#33335c]/30 ml-auto">
        {totaal} {totaal === 1 ? 'dier' : 'dieren'}
      </span>
    </div>
  )
}
