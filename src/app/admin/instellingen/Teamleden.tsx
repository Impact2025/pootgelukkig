'use client'

import { useEffect, useState, useCallback } from 'react'
import { Skeleton } from '@/components/admin/ui'

interface Teamlid {
  id: number
  naam: string
  email: string
  aangemeldOp: string
}

interface Uitnodiging {
  id: number
  email: string
  aangemaaktOp: string
  verlooptOp: string
}

export default function Teamleden() {
  const [teamleden, setTeamleden] = useState<Teamlid[]>([])
  const [uitnodigingen, setUitnodigingen] = useState<Uitnodiging[]>([])
  const [huidigeGebruikerId, setHuidigeGebruikerId] = useState<number | null>(null)
  const [laden, setLaden] = useState(true)
  const [email, setEmail] = useState('')
  const [uitnodigen, setUitnodigen] = useState(false)
  const [bezigId, setBezigId] = useState<number | null>(null)
  const [fout, setFout] = useState<string | null>(null)
  const [succes, setSucces] = useState<string | null>(null)

  const laad = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/teamleden')
      const data = await res.json()
      setTeamleden(data.teamleden ?? [])
      setUitnodigingen(data.uitnodigingen ?? [])
      setHuidigeGebruikerId(data.huidigeGebruikerId ?? null)
    } catch {
      setFout('Kon teamleden niet laden.')
    } finally {
      setLaden(false)
    }
  }, [])

  useEffect(() => {
    laad()
  }, [laad])

  async function nodigUit(e: React.FormEvent) {
    e.preventDefault()
    setUitnodigen(true)
    setFout(null)
    setSucces(null)
    try {
      const res = await fetch('/api/admin/teamleden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.fout ?? 'Uitnodigen mislukt')
        return
      }
      setSucces(`Uitnodiging verstuurd naar ${email}.`)
      setEmail('')
      await laad()
    } catch {
      setFout('Uitnodigen mislukt. Probeer opnieuw.')
    } finally {
      setUitnodigen(false)
    }
  }

  async function verwijderTeamlid(id: number) {
    if (!confirm('Dit teamlid verliest toegang tot ImpactOS. Doorgaan?')) return
    setBezigId(id)
    setFout(null)
    try {
      const res = await fetch(`/api/admin/teamleden/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.fout ?? 'Verwijderen mislukt')
        return
      }
      setTeamleden((prev) => prev.filter((t) => t.id !== id))
    } finally {
      setBezigId(null)
    }
  }

  async function trekIn(id: number) {
    setBezigId(id)
    try {
      const res = await fetch(`/api/admin/teamuitnodigingen/${id}`, { method: 'DELETE' })
      if (res.ok) setUitnodigingen((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setBezigId(null)
    }
  }

  if (laden) return <Skeleton className="h-40 rounded-2xl" />

  return (
    <div className="space-y-5">
      <form onSubmit={nodigUit} className="flex items-center gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="collega@organisatie.nl"
          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
        />
        <button
          type="submit"
          disabled={uitnodigen}
          className="bg-[#2563EB] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {uitnodigen ? 'Bezig…' : 'Uitnodigen'}
        </button>
      </form>

      {fout && <p className="text-sm font-semibold text-red-600">{fout}</p>}
      {succes && <p className="text-sm font-semibold text-emerald-600">{succes}</p>}

      <div className="space-y-2">
        {teamleden.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl border border-[#1E293B]/8 bg-gray-50 px-4 py-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#1E293B] text-white text-xs font-bold flex-shrink-0">
              {t.naam.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1E293B] truncate">
                {t.naam}
                {t.id === huidigeGebruikerId && <span className="ml-1.5 text-xs font-normal text-[#1E293B]/40">(jij)</span>}
              </p>
              <p className="text-xs text-[#1E293B]/40 truncate">{t.email}</p>
            </div>
            <button
              onClick={() => verwijderTeamlid(t.id)}
              disabled={bezigId === t.id || teamleden.length <= 1}
              title={teamleden.length <= 1 ? 'Laatste teamlid kan niet worden verwijderd' : 'Verwijderen'}
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        ))}
      </div>

      {uitnodigingen.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[#1E293B]/40">Openstaande uitnodigingen</p>
          {uitnodigingen.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <span className="material-symbols-outlined text-amber-500 text-sm">schedule_send</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1E293B] truncate">{u.email}</p>
                <p className="text-xs text-amber-700">
                  Verloopt op {new Date(u.verlooptOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <button
                onClick={() => trekIn(u.id)}
                disabled={bezigId === u.id}
                className="text-xs font-bold text-[#1E293B]/50 hover:text-[#1E293B] disabled:opacity-50"
              >
                Intrekken
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
