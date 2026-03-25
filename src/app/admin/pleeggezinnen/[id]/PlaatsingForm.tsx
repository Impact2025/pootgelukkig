'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Dier {
  id: number
  naam: string
  soort: string
}

interface Props {
  pleeggezinId: number
  beschikbareDieren: Dier[]
}

const SOORT_EMOJI: Record<string, string> = {
  hond: '🐕',
  kat: '🐈',
  vogel: '🦜',
  konijn: '🐇',
  cavia: '🐹',
  hamster: '🐹',
  overig: '🐾',
}

export default function PlaatsingForm({ pleeggezinId, beschikbareDieren }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [dierId, setDierId] = useState('')
  const [startdatum, setStartdatum] = useState(new Date().toISOString().split('T')[0])
  const [notities, setNotities] = useState('')
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  async function opslaan(e: React.FormEvent) {
    e.preventDefault()
    if (!dierId || !startdatum) {
      setFout('Kies een dier en startdatum')
      return
    }
    setBezig(true)
    setFout('')
    try {
      const res = await fetch('/api/admin/pleegplaatsingen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dierId: parseInt(dierId),
          pleeggezinId,
          startdatum,
          notities: notities || undefined,
        }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setFout(json.error ?? 'Er is een fout opgetreden')
        return
      }
      setOpen(false)
      setDierId('')
      setNotities('')
      router.refresh()
    } catch {
      setFout('Verbindingsfout. Probeer opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-[#33335c] text-[#f8aa25] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Dier plaatsen
      </button>
    )
  }

  return (
    <form
      onSubmit={opslaan}
      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4"
    >
      <h3 className="font-bold text-[#33335c] text-sm">Nieuw dier plaatsen</h3>

      {fout && (
        <p className="text-red-600 text-xs font-medium bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
          {fout}
        </p>
      )}

      <div>
        <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
          Dier *
        </label>
        <select
          value={dierId}
          onChange={(e) => setDierId(e.target.value)}
          required
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
        >
          <option value="">Kies een dier...</option>
          {beschikbareDieren.map((dier) => (
            <option key={dier.id} value={dier.id}>
              {SOORT_EMOJI[dier.soort] ?? '🐾'} {dier.naam} ({dier.soort})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
          Startdatum *
        </label>
        <input
          type="date"
          value={startdatum}
          onChange={(e) => setStartdatum(e.target.value)}
          required
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
          Notities
        </label>
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          rows={2}
          placeholder="Bijzonderheden over de plaatsing..."
          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={bezig}
          className="flex-1 bg-[#33335c] text-[#f8aa25] font-bold py-2.5 rounded-xl text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {bezig ? (
            <span className="size-4 border-2 border-[#f8aa25]/30 border-t-[#f8aa25] rounded-full animate-spin" />
          ) : (
            'Plaatsen bevestigen'
          )}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2.5 bg-white border border-gray-200 text-[#33335c]/60 font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          Annuleren
        </button>
      </div>
    </form>
  )
}
