'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/admin/Toast'

interface Afspraak {
  id: number
  status: string
  type: string
  voorkeurDatum: string
  voorkeurTijdslot: string
  bevestigdeDatum: string | null
  bevestigdTijdstip: string | null
  notitieAdoptant: string | null
  notitieAsiel: string | null
  aangemaaktOp: string
  dierNaam: string
  dierSoort: string
  dierFotoUrl: string | null
  dierId: number
  adoptantNaam: string
  adoptantEmail: string
}

interface Props {
  afspraak: Afspraak
  dierId: number
}

export default function AfspraakBeheer({ afspraak }: Props) {
  const router = useRouter()
  const { showToast } = useToast()
  const [bezig, setBezig] = useState(false)
  const [actieOpen, setActieOpen] = useState<'bevestig' | 'annuleer' | null>(null)

  // Bevestig form state
  const [datum, setDatum] = useState(afspraak.voorkeurDatum.slice(0, 10))
  const [tijdstip, setTijdstip] = useState('10:00')
  const [notitie, setNotitie] = useState('')

  async function stuurActie(actie: 'bevestig' | 'afgerond' | 'annuleer') {
    setBezig(true)
    try {
      const body: Record<string, unknown> = { actie }
      if (actie === 'bevestig') {
        body.bevestigdeDatum = datum
        body.bevestigdTijdstip = tijdstip
        body.notitieAsiel = notitie || undefined
      } else if (actie === 'annuleer' || actie === 'afgerond') {
        body.notitieAsiel = notitie || undefined
      }

      const res = await fetch(`/api/admin/afspraken/${afspraak.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}))
        showToast(error ?? 'Er ging iets mis. Probeer het opnieuw.', 'error')
        return
      }

      const labels: Record<string, string> = {
        bevestig: 'Afspraak bevestigd',
        afgerond: 'Bezoek afgerond',
        annuleer: 'Afspraak geannuleerd',
      }
      showToast(labels[actie] ?? 'Opgeslagen', actie === 'annuleer' ? 'info' : 'success')
      setActieOpen(null)
      router.refresh()
    } finally {
      setBezig(false)
    }
  }

  if (afspraak.status === 'aangevraagd') {
    return (
      <div className="border-t border-gray-100">
        {actieOpen === 'bevestig' ? (
          <div className="p-4 bg-blue-50/60 space-y-3">
            <p className="text-xs font-bold text-[#33335c]/60 uppercase tracking-wider">
              Bevestig afspraak
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#33335c]/50 uppercase tracking-wider mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  value={datum}
                  onChange={(e) => setDatum(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#33335c]/50 uppercase tracking-wider mb-1">
                  Tijdstip
                </label>
                <input
                  type="time"
                  value={tijdstip}
                  onChange={(e) => setTijdstip(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#33335c]/50 uppercase tracking-wider mb-1">
                Bericht aan adoptant (optioneel)
              </label>
              <textarea
                value={notitie}
                onChange={(e) => setNotitie(e.target.value)}
                placeholder="Bijv. aanmelden bij de receptie, parkeren achter het gebouw…"
                rows={2}
                maxLength={500}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => stuurActie('bevestig')}
                disabled={bezig || !datum || !tijdstip}
                className="flex-1 bg-blue-600 text-white text-sm font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bezig ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">event_available</span>
                )}
                Bevestig afspraak
              </button>
              <button
                onClick={() => setActieOpen(null)}
                className="px-4 py-2 text-[#33335c]/50 hover:text-[#33335c] text-sm font-semibold transition-colors"
              >
                Annuleer
              </button>
            </div>
          </div>
        ) : actieOpen === 'annuleer' ? (
          <div className="p-4 bg-red-50/60 space-y-3">
            <p className="text-xs font-bold text-[#33335c]/60 uppercase tracking-wider">
              Afspraak annuleren
            </p>
            <textarea
              value={notitie}
              onChange={(e) => setNotitie(e.target.value)}
              placeholder="Reden voor annulering (optioneel)…"
              rows={2}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] bg-white focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => stuurActie('annuleer')}
                disabled={bezig}
                className="flex-1 bg-red-500 text-white text-sm font-bold py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bezig ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">cancel</span>
                )}
                Annuleer afspraak
              </button>
              <button
                onClick={() => setActieOpen(null)}
                className="px-4 py-2 text-[#33335c]/50 hover:text-[#33335c] text-sm font-semibold transition-colors"
              >
                Terug
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 p-4 pt-3">
            <button
              onClick={() => { setActieOpen('bevestig'); setNotitie('') }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <span className="material-symbols-outlined text-base">event_available</span>
              Bevestigen
            </button>
            <button
              onClick={() => { setActieOpen('annuleer'); setNotitie('') }}
              className="flex items-center justify-center gap-2 border border-gray-200 text-[#33335c]/60 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              Annuleer
            </button>
          </div>
        )}
      </div>
    )
  }

  if (afspraak.status === 'bevestigd') {
    return (
      <div className="border-t border-gray-100">
        {actieOpen === 'annuleer' ? (
          <div className="p-4 bg-red-50/60 space-y-3">
            <p className="text-xs font-bold text-[#33335c]/60 uppercase tracking-wider">
              Bevestigde afspraak annuleren
            </p>
            <textarea
              value={notitie}
              onChange={(e) => setNotitie(e.target.value)}
              placeholder="Reden voor annulering (optioneel)…"
              rows={2}
              maxLength={500}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] bg-white focus:outline-none focus:ring-2 focus:ring-red-200 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => stuurActie('annuleer')}
                disabled={bezig}
                className="flex-1 bg-red-500 text-white text-sm font-bold py-2 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bezig ? (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-base">cancel</span>
                )}
                Bevestig annulering
              </button>
              <button
                onClick={() => setActieOpen(null)}
                className="px-4 py-2 text-[#33335c]/50 hover:text-[#33335c] text-sm font-semibold transition-colors"
              >
                Terug
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 p-4 pt-3">
            <button
              onClick={() => stuurActie('afgerond')}
              disabled={bezig}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {bezig ? (
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-base">check_circle</span>
              )}
              Bezoek afgerond
            </button>
            <button
              onClick={() => { setActieOpen('annuleer'); setNotitie('') }}
              className="flex items-center justify-center gap-2 border border-gray-200 text-[#33335c]/60 hover:text-red-500 hover:border-red-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-base">cancel</span>
              Annuleer
            </button>
          </div>
        )}
      </div>
    )
  }

  return null
}
