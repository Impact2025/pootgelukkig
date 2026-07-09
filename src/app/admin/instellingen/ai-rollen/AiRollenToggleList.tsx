'use client'

import { useState } from 'react'

type Rol = {
  id: string
  naam: string
  titel: string
  icoon: string
  kleur: string
  beschrijving: string
  actief: boolean
}

export default function AiRollenToggleList({ rollen }: { rollen: Rol[] }) {
  const [state, setState] = useState<Rol[]>(rollen)
  const [busy, setBusy] = useState<string | null>(null)
  const [fout, setFout] = useState<string | null>(null)

  async function toggle(r: Rol) {
    setBusy(r.id)
    setFout(null)
    const nieuwActief = !r.actief
    // optimistisch
    setState((prev) => prev.map((x) => (x.id === r.id ? { ...x, actief: nieuwActief } : x)))
    try {
      const res = await fetch('/api/admin/ai-rollen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: r.id, actief: nieuwActief }),
      })
      if (!res.ok) throw new Error('Opslaan mislukt')
    } catch {
      // rollback
      setState((prev) => prev.map((x) => (x.id === r.id ? { ...x, actief: !nieuwActief } : x)))
      setFout('Kon de wijziging niet opslaan. Probeer opnieuw.')
    } finally {
      setBusy(null)
    }
  }

  const actieveCount = state.filter((r) => r.actief).length

  return (
    <div className="space-y-3">
      {fout && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">{fout}</div>
      )}

      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-extrabold text-[#33335c]/50 uppercase tracking-wider">
          {actieveCount} van {state.length} actief
        </p>
      </div>

      {state.map((r) => (
        <div
          key={r.id}
          className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
            r.actief ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/60'
          }`}
        >
          <div
            className="size-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${r.kleur}1a`, color: r.kleur }}
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {r.icoon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-[#33335c] text-sm">{r.naam}</p>
              <span className="text-xs text-[#33335c]/40">— {r.titel}</span>
            </div>
            <p className="text-[#33335c]/60 text-xs leading-relaxed mt-0.5">{r.beschrijving}</p>
          </div>

          <button
            onClick={() => toggle(r)}
            disabled={busy === r.id}
            role="switch"
            aria-checked={r.actief}
            aria-label={`${r.naam} ${r.actief ? 'uitzetten' : 'activeren'}`}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 disabled:opacity-50 ${
              r.actief ? '' : 'bg-gray-300'
            }`}
            style={r.actief ? { backgroundColor: r.kleur } : undefined}
          >
            <span
              className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${
                r.actief ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )
}
