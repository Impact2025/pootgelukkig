'use client'

import { useEffect, useState, useCallback } from 'react'

type Provider = 'microsoft' | 'google'

interface AgendaItem {
  titel: string
  start: string
  eind: string
  locatie: string | null
}

interface KoppelingData {
  gekoppeld: boolean
  geconfigureerd: boolean
  accountEmail: string | null
  gekoppeldOp: string | null
  agendaItems: AgendaItem[]
  agendaFout?: string
}

const PROVIDERS: { id: Provider; label: string; icoon: string }[] = [
  { id: 'microsoft', label: 'Outlook / Microsoft 365', icoon: 'mail' },
  { id: 'google', label: 'Google Agenda', icoon: 'calendar_month' },
]

export default function AgendaKoppelingen() {
  const [data, setData] = useState<Record<Provider, KoppelingData | null>>({ microsoft: null, google: null })
  const [laden, setLaden] = useState(true)
  const [bezig, setBezig] = useState<Provider | null>(null)

  const laad = useCallback(async () => {
    const [ms, gg] = await Promise.all([
      fetch('/api/integraties/microsoft').then((r) => r.json()).catch(() => null),
      fetch('/api/integraties/google').then((r) => r.json()).catch(() => null),
    ])
    setData({ microsoft: ms, google: gg })
    setLaden(false)
  }, [])

  useEffect(() => {
    laad()
  }, [laad])

  async function koppelLos(provider: Provider) {
    setBezig(provider)
    try {
      const res = await fetch(`/api/integraties/${provider}`, { method: 'DELETE' })
      if (res.ok) await laad()
    } finally {
      setBezig(null)
    }
  }

  return (
    <div className="space-y-4">
      {PROVIDERS.map((p) => {
        const status = data[p.id]
        return (
          <div key={p.id} className="rounded-xl border border-[#1E293B]/8 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white border border-[#1E293B]/10 text-[#1E293B]/60">
                  <span className="material-symbols-outlined text-[1.1rem]">{p.icoon}</span>
                </span>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">{p.label}</p>
                  {laden ? (
                    <p className="text-xs text-[#1E293B]/40">Laden…</p>
                  ) : status?.gekoppeld ? (
                    <p className="text-xs text-emerald-600 font-semibold">Gekoppeld{status.accountEmail ? ` · ${status.accountEmail}` : ''}</p>
                  ) : status?.geconfigureerd ? (
                    <p className="text-xs text-[#1E293B]/40">Niet gekoppeld</p>
                  ) : (
                    <p className="text-xs text-amber-600">Nog niet geconfigureerd (ontbrekende API-sleutels)</p>
                  )}
                </div>
              </div>

              {!laden && status?.gekoppeld ? (
                <button
                  onClick={() => koppelLos(p.id)}
                  disabled={bezig === p.id}
                  className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg disabled:opacity-50"
                >
                  {bezig === p.id ? 'Bezig…' : 'Loskoppelen'}
                </button>
              ) : (
                <a
                  href={`/api/integraties/${p.id}/connect`}
                  aria-disabled={!status?.geconfigureerd}
                  className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                    status?.geconfigureerd
                      ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                      : 'bg-gray-200 text-gray-400 pointer-events-none'
                  }`}
                >
                  Koppelen
                </a>
              )}
            </div>

            {status?.gekoppeld && status.agendaItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#1E293B]/8 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#1E293B]/40">Komende items</p>
                {status.agendaItems.slice(0, 3).map((item, i) => (
                  <p key={i} className="text-xs text-[#1E293B]/70">
                    <span className="font-semibold">{item.titel}</span>
                    {' — '}
                    {new Date(item.start).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                ))}
              </div>
            )}
            {status?.gekoppeld && status.agendaFout && (
              <p className="mt-3 pt-3 border-t border-[#1E293B]/8 text-xs text-red-600">{status.agendaFout}</p>
            )}
          </div>
        )
      })}
      <p className="text-xs text-[#1E293B]/40">
        Agenda-items worden alleen uitgelezen (read-only) — ImpactOS plaatst zelf nog niets in je
        agenda.
      </p>
    </div>
  )
}
