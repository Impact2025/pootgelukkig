'use client'

import { useState } from 'react'
import Image from 'next/image'

type Voeding = 'alles' | 'helft' | 'weinig' | 'niets'
type Gedrag = 'normaal' | 'onrustig' | 'agressief' | 'teruggetrokken'
type Gezondheid = 'goed' | 'let_op' | 'dierenarts'

interface Log {
  id: number
  voeding: string
  gedrag: string
  gezondheid: string
  notitie: string | null
  gelogdOp: string
}

interface Props {
  dierId: number
  dierNaam: string
  dierFotoUrl: string | null
  initialeLogs: Log[]
}

function gezondheidKleur(g: string) {
  if (g === 'goed') return 'text-emerald-600 bg-emerald-50'
  if (g === 'let_op') return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function voedingKleur(v: string) {
  if (v === 'alles') return 'text-emerald-600 bg-emerald-50'
  if (v === 'helft') return 'text-amber-600 bg-amber-50'
  if (v === 'weinig') return 'text-orange-600 bg-orange-50'
  return 'text-red-600 bg-red-50'
}

function gedragKleur(g: string) {
  if (g === 'normaal') return 'text-emerald-600 bg-emerald-50'
  if (g === 'teruggetrokken') return 'text-blue-600 bg-blue-50'
  if (g === 'onrustig') return 'text-amber-600 bg-amber-50'
  return 'text-red-600 bg-red-50'
}

function KiesKnop({
  label,
  actief,
  onClick,
  kleur,
}: {
  label: string
  actief: boolean
  onClick: () => void
  kleur: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
        actief
          ? `${kleur} border-transparent`
          : 'bg-gray-50 text-[#33335c]/40 border-gray-100 hover:border-gray-200'
      }`}
    >
      {label}
    </button>
  )
}

export default function WelzijnClient({ dierId, dierNaam, dierFotoUrl, initialeLogs }: Props) {
  const [voeding, setVoeding] = useState<Voeding | null>(null)
  const [gedrag, setGedrag] = useState<Gedrag | null>(null)
  const [gezondheid, setGezondheid] = useState<Gezondheid | null>(null)
  const [notitie, setNotitie] = useState('')
  const [versturen, setVersturen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [logs, setLogs] = useState<Log[]>(initialeLogs)

  async function opslaan() {
    if (!voeding || !gedrag || !gezondheid || versturen) return
    setVersturen(true)
    try {
      const res = await fetch(`/api/admin/welzijn/${dierId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voeding, gedrag, gezondheid, notitie }),
      })
      if (res.ok) {
        const json = (await res.json()) as { data: Log }
        setLogs([json.data, ...logs])
        setVoeding(null)
        setGedrag(null)
        setGezondheid(null)
        setNotitie('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } finally {
      setVersturen(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100">
          {dierFotoUrl ? (
            <Image src={dierFotoUrl} alt={dierNaam} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-2xl">pets</span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Welzijn check-in</h1>
          <p className="text-[#33335c]/50 text-sm">
            {dierNaam} &middot;{' '}
            {new Date().toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center gap-3">
          <span
            className="material-symbols-outlined text-emerald-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-emerald-700 font-semibold text-sm">Check-in opgeslagen!</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Voeding */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#33335c]/40 mb-2">
            Voeding
          </p>
          <div className="flex gap-2">
            {(['alles', 'helft', 'weinig', 'niets'] as Voeding[]).map((v) => (
              <KiesKnop
                key={v}
                label={v.charAt(0).toUpperCase() + v.slice(1)}
                actief={voeding === v}
                onClick={() => setVoeding(v)}
                kleur={
                  v === 'alles'
                    ? 'bg-emerald-100 text-emerald-700'
                    : v === 'helft'
                      ? 'bg-amber-100 text-amber-700'
                      : v === 'weinig'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                }
              />
            ))}
          </div>
        </div>

        {/* Gedrag */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#33335c]/40 mb-2">
            Gedrag
          </p>
          <div className="flex gap-2 flex-wrap">
            {(['normaal', 'onrustig', 'agressief', 'teruggetrokken'] as Gedrag[]).map((g) => (
              <KiesKnop
                key={g}
                label={g.charAt(0).toUpperCase() + g.slice(1)}
                actief={gedrag === g}
                onClick={() => setGedrag(g)}
                kleur={
                  g === 'normaal'
                    ? 'bg-emerald-100 text-emerald-700'
                    : g === 'onrustig'
                      ? 'bg-amber-100 text-amber-700'
                      : g === 'agressief'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                }
              />
            ))}
          </div>
        </div>

        {/* Gezondheid */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#33335c]/40 mb-2">
            Gezondheid
          </p>
          <div className="flex gap-2">
            {(
              [
                { val: 'goed' as Gezondheid, label: 'Goed', kleur: 'bg-emerald-100 text-emerald-700' },
                { val: 'let_op' as Gezondheid, label: 'Let op', kleur: 'bg-amber-100 text-amber-700' },
                {
                  val: 'dierenarts' as Gezondheid,
                  label: 'Dierenarts nodig',
                  kleur: 'bg-red-100 text-red-700',
                },
              ] as { val: Gezondheid; label: string; kleur: string }[]
            ).map(({ val, label, kleur }) => (
              <KiesKnop
                key={val}
                label={label}
                actief={gezondheid === val}
                onClick={() => setGezondheid(val)}
                kleur={kleur}
              />
            ))}
          </div>
        </div>

        {/* Notitie */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#33335c]/40 mb-2">
            Notitie (optioneel)
          </p>
          <textarea
            value={notitie}
            onChange={(e) => setNotitie(e.target.value)}
            placeholder="Bijzonderheden, observaties..."
            rows={2}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10 resize-none"
          />
        </div>

        <button
          onClick={opslaan}
          disabled={!voeding || !gedrag || !gezondheid || versturen}
          className="w-full bg-[#33335c] text-[#f8aa25] font-bold py-3.5 rounded-xl text-sm disabled:opacity-30 flex items-center justify-center gap-2"
        >
          {versturen ? (
            <span className="size-4 border-2 border-[#f8aa25]/30 border-t-[#f8aa25] rounded-full animate-spin" />
          ) : (
            <>
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                save
              </span>
              Check-in opslaan
            </>
          )}
        </button>
      </div>

      {/* Geschiedenis */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <h2 className="font-bold text-sm text-[#33335c]">Recente logs</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-4">
                <p className="text-[10px] text-[#33335c]/30 w-20 flex-shrink-0">
                  {new Date(log.gelogdOp).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${voedingKleur(log.voeding)}`}
                  >
                    Voeding: {log.voeding}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gedragKleur(log.gedrag)}`}
                  >
                    Gedrag: {log.gedrag}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gezondheidKleur(log.gezondheid)}`}
                  >
                    Gezondheid: {log.gezondheid}
                  </span>
                </div>
                {log.notitie && (
                  <p className="text-xs text-[#33335c]/50 truncate flex-1">{log.notitie}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
