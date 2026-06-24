'use client'

import { useState } from 'react'

export type FaqItem = { vraag: string; antwoord: string }

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="divide-y divide-[#33335c]/8 overflow-hidden rounded-3xl border border-[#33335c]/8 bg-white">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.vraag}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-base font-bold text-[#33335c]">{item.vraag}</span>
              <span
                className={`material-symbols-outlined shrink-0 text-[#33335c]/50 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 -mt-1">
                <p className="text-[15px] leading-relaxed text-[#33335c]/65">{item.antwoord}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
