'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Asiel {
  id: string
  naam: string
  email: string | null
  website: string | null
}

export default function WervingClient({ asielen }: { asielen: Asiel[] }) {
  const router = useRouter()
  const [geselecteerd, setGeselecteerd] = useState<Set<string>>(new Set())
  const [bezig, setBezig] = useState(false)
  const [melding, setMelding] = useState<string | null>(null)

  function toggle(id: string) {
    setGeselecteerd((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const metEmail = asielen.filter((a) => a.email)
  const allesGeselecteerd = metEmail.length > 0 && metEmail.every((a) => geselecteerd.has(a.id))

  function toggleAlles() {
    if (allesGeselecteerd) setGeselecteerd(new Set())
    else setGeselecteerd(new Set(metEmail.map((a) => a.id)))
  }

  async function verstuur(actie: 'uitnodigen' | 'overslaan') {
    if (bezig || geselecteerd.size === 0) return
    if (
      actie === 'uitnodigen' &&
      !confirm(`Uitnodigingsmail versturen naar ${geselecteerd.size} asiel(en)?`)
    )
      return
    setBezig(true)
    setMelding(null)
    try {
      const res = await fetch('/api/admin/asielen-werving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...geselecteerd], actie }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMelding(data.error ?? 'Er ging iets mis')
      } else if (actie === 'uitnodigen') {
        const mislukt = (data.mislukt ?? []).length
        setMelding(
          `${data.verzonden} uitnodiging(en) verstuurd${mislukt ? `, ${mislukt} mislukt` : ''}.`
        )
      } else {
        setMelding(`${data.overgeslagen} asiel(en) overgeslagen.`)
      }
      setGeselecteerd(new Set())
      router.refresh()
    } finally {
      setBezig(false)
    }
  }

  if (asielen.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
        <span
          className="material-symbols-outlined text-5xl text-gray-200 mb-3 block"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          domain_add
        </span>
        <p className="text-[#33335c]/40 font-semibold">Geen nieuwe asielen</p>
        <p className="text-[#33335c]/30 text-sm mt-1">
          De maandelijkse import vult deze lijst automatisch aan.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Actiebalk */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-[#33335c]/60">
          {geselecteerd.size > 0
            ? `${geselecteerd.size} geselecteerd`
            : `${asielen.length} nieuw gevonden`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => verstuur('overslaan')}
            disabled={bezig || geselecteerd.size === 0}
            className="flex items-center gap-1.5 bg-gray-50 text-[#33335c]/60 hover:bg-gray-100 transition-colors text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-base">block</span>
            Overslaan
          </button>
          <button
            onClick={() => verstuur('uitnodigen')}
            disabled={bezig || geselecteerd.size === 0}
            className="flex items-center gap-1.5 bg-[#f8aa25] text-[#33335c] hover:bg-[#f8aa25]/90 transition-colors text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40 shadow-sm shadow-[#f8aa25]/30"
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              send
            </span>
            Stuur uitnodiging
          </button>
        </div>
      </div>

      {melding && (
        <div className="mb-4 bg-[#33335c]/5 border border-[#33335c]/10 rounded-xl px-4 py-3 text-sm font-semibold text-[#33335c]">
          {melding}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/60">
              <th className="px-5 py-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allesGeselecteerd}
                  onChange={toggleAlles}
                  className="accent-[#f8aa25] size-4 cursor-pointer"
                />
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Organisatie</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">E-mail</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Website</th>
            </tr>
          </thead>
          <tbody>
            {asielen.map((a, i) => {
              const heeftEmail = !!a.email
              return (
                <tr
                  key={a.id}
                  className={`${i < asielen.length - 1 ? 'border-b border-gray-50' : ''} ${
                    geselecteerd.has(a.id) ? 'bg-[#f8aa25]/5' : 'hover:bg-gray-50/50'
                  } transition-colors`}
                >
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={geselecteerd.has(a.id)}
                      onChange={() => toggle(a.id)}
                      disabled={!heeftEmail}
                      className="accent-[#f8aa25] size-4 cursor-pointer disabled:opacity-30"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#33335c] text-sm">{a.naam}</p>
                  </td>
                  <td className="px-5 py-4">
                    {heeftEmail ? (
                      <a href={`mailto:${a.email}`} className="text-sm text-[#33335c]/70 hover:text-[#33335c]">
                        {a.email}
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                        Geen e-mail
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {a.website ? (
                      <a
                        href={a.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#33335c]/50 hover:text-[#f8aa25] underline"
                      >
                        bekijk
                      </a>
                    ) : (
                      <span className="text-[#33335c]/30 text-sm">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#33335c]/40 mt-4 leading-relaxed">
        💡 Asielen zonder e-mailadres kun je niet aanschrijven. Vul het adres aan via de
        database of sla het asiel over. Elke uitnodiging gaat maximaal één keer per asiel uit.
      </p>
    </>
  )
}
