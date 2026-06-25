'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { zoekKennisbank } from '@/lib/kennisbank/content'
import type { KennisArtikel, KennisCategorie } from '@/lib/kennisbank/content'

type ZoekResultaat = {
  artikel: KennisArtikel
  categorie: KennisCategorie
  score: number
}

export default function KennisbankSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ZoekResultaat[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim().length >= 2) {
        setResults(zoekKennisbank(query))
        setIsOpen(true)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }, 150)
    return () => clearTimeout(handler)
  }, [query])

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#33335c]/35">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Zoeken in de kennisbank..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
          className="w-full rounded-2xl border border-[#33335c]/12 bg-white py-3 pl-11 pr-4 text-sm text-[#33335c] placeholder:text-[#33335c]/30 focus:border-[#ee5b2b]/40 focus:outline-none focus:ring-2 focus:ring-[#ee5b2b]/12"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); inputRef.current?.focus() }}
            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-base text-[#33335c]/25 hover:text-[#33335c]/50"
          >
            close
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#33335c]/8 bg-white shadow-xl">
          {results.length === 0 && query.trim().length >= 2 ? (
            <div className="px-5 py-8 text-center text-sm text-[#33335c]/40">
              Geen artikelen gevonden voor "<span className="font-medium text-[#33335c]/60">{query}</span>"
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-[#33335c]/6">
              {results.map((r) => (
                <li key={r.artikel.categorieSlug + '/' + r.artikel.slug}>
                  <Link
                    href={`/kennisbank/${r.artikel.categorieSlug}/${r.artikel.slug}`}
                    onClick={() => { setIsOpen(false); setQuery('') }}
                    className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-[#33335c]/4"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#f8aa25]/12 text-xs text-[#e39207]">
                      <span className="material-symbols-outlined text-sm">{r.categorie.icon}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#33335c]">{r.artikel.titel}</p>
                      <p className="mt-0.5 truncate text-xs text-[#33335c]/40">
                        {r.categorie.naam}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  )
}
