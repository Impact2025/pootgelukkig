'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { buildCommandItems, filterCommandItems } from '@/components/admin/nav'
import { cx } from '@/components/admin/ui'

export default function CommandPalette({
  open,
  onClose,
  isAdmin,
}: {
  open: boolean
  onClose: () => void
  isAdmin: boolean
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const items = useMemo(() => buildCommandItems(isAdmin), [isAdmin])
  const resultaten = useMemo(() => filterCommandItems(query, items), [query, items])

  // Reset bij openen + focus.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [query])

  if (!open) return null

  function kies(index: number) {
    const item = resultaten[index]
    if (!item) return
    onClose()
    router.push(item.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, resultaten.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      kies(active)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Snel zoeken">
      <button type="button" aria-hidden className="absolute inset-0 cursor-default bg-[#1E293B]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#1E293B]/10 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4">
          <span className="material-symbols-outlined text-[#1E293B]/40">search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Zoek een pagina of actie…"
            className="w-full bg-transparent py-4 text-[15px] text-[#1E293B] outline-none placeholder:text-[#1E293B]/35"
          />
          <kbd className="rounded border border-[#1E293B]/15 bg-[#f6f8f6] px-1.5 py-0.5 text-[10px] font-bold text-[#1E293B]/40">esc</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {resultaten.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[#1E293B]/40">Geen resultaten voor &ldquo;{query}&rdquo;</p>
          ) : (
            <ul>
              {resultaten.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseMove={() => setActive(i)}
                    onClick={() => kies(i)}
                    className={cx(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      i === active ? 'bg-[#1E293B] text-white' : 'text-[#1E293B]/80 hover:bg-gray-50'
                    )}
                  >
                    <span className={cx('material-symbols-outlined text-[1.25rem]', i === active ? 'text-[#1D4ED8]' : 'text-[#1E293B]/40')}>
                      {item.icon}
                    </span>
                    <span className="flex-1 font-semibold">{item.label}</span>
                    {item.hint && (
                      <span className={cx('text-xs', i === active ? 'text-white/60' : 'text-[#1E293B]/35')}>{item.hint}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
