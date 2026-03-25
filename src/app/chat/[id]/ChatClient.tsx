'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Bericht {
  id: number
  verzenderType: 'adoptant' | 'asiel' | 'systeem'
  inhoud: string
  verstuurdOp: string
  gelezen: boolean
}

interface Props {
  gesprekId: number
  userId: number
  dierNaam: string
  dierFotoUrl: string | null
  asielNaam: string
  initialeBerichten: Bericht[]
  initieleAfspraak?: string | null
}

export default function ChatClient({
  gesprekId,
  userId,
  dierNaam,
  dierFotoUrl,
  asielNaam,
  initialeBerichten,
  initieleAfspraak,
}: Props) {
  const [berichten, setBerichten] = useState<Bericht[]>(initialeBerichten)
  const [nieuwBericht, setNieuwBericht] = useState('')
  const [versturen, setVersturen] = useState(false)
  const [afspraakDatum, setAfspraakDatum] = useState(initieleAfspraak ?? '')
  const [afspraakOpslaan, setAfspraakOpslaan] = useState(false)
  const [toonAfspraak, setToonAfspraak] = useState(!initieleAfspraak)
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten])

  // Poll elke 3 seconden voor nieuwe berichten
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${gesprekId}/messages`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) {
            setBerichten(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json.data.map((m: any) => ({
                id: m.id,
                verzenderType: m.verzenderType,
                inhoud: m.inhoud,
                verstuurdOp: m.verstuurdOp,
                gelezen: m.gelezen ?? false,
              }))
            )
          }
        }
      } catch {
        // Polling fouten negeren
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [gesprekId])

  async function verstuurBericht() {
    if (!nieuwBericht.trim() || versturen) return
    setVersturen(true)
    const tekst = nieuwBericht.trim()
    setNieuwBericht('')

    try {
      const res = await fetch(`/api/chat/${gesprekId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inhoud: tekst,
          verzenderType: 'adoptant',
          verzenderId: userId,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setBerichten((prev) => [
          ...prev,
          {
            id: json.data.id,
            verzenderType: json.data.verzenderType,
            inhoud: json.data.inhoud,
            verstuurdOp: json.data.verstuurdOp,
            gelezen: json.data.gelezen ?? false,
          },
        ])
      }
    } catch {
      setNieuwBericht(tekst)
    } finally {
      setVersturen(false)
    }
  }

  function formatTijd(iso: string) {
    return new Date(iso).toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function slaAfspraakOp() {
    if (!afspraakDatum || afspraakOpslaan) return
    setAfspraakOpslaan(true)
    try {
      const res = await fetch(`/api/gesprekken/${gesprekId}/afspraak`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datum: afspraakDatum }),
      })
      if (res.ok) setToonAfspraak(false)
    } finally {
      setAfspraakOpslaan(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      verstuurBericht()
    }
  }

  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto bg-[#f8f6f6]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 ios-blur border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="text-slate-600">
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 relative">
                  {dierFotoUrl ? (
                    <Image
                      src={dierFotoUrl}
                      alt={dierNaam}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-xl">
                        pets
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div>
                <h1 className="text-sm font-bold leading-tight text-slate-900">{asielNaam}</h1>
                <p className="text-[11px] text-slate-500">Over {dierNaam}</p>
              </div>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100">
            <span className="material-symbols-outlined text-slate-600">info</span>
          </button>
        </div>
      </header>

      {/* Chat berichten */}
      <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
        {berichten.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">
              chat_bubble_outline
            </span>
            <p className="text-slate-500 text-sm font-medium">
              Stuur een bericht om het gesprek te starten!
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Het asiel reageert gewoonlijk binnen 1 werkdag.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                Berichten
              </span>
            </div>
            {berichten.map((bericht) => (
              <div key={bericht.id}>
                {bericht.verzenderType !== 'adoptant' ? (
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-400 text-sm">
                        home_work
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="bubble-asiel">{bericht.inhoud}</div>
                      <span className="text-[10px] text-slate-400 ml-1">
                        {formatTijd(bericht.verstuurdOp)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
                    <div className="bubble-user">{bericht.inhoud}</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400">
                        {formatTijd(bericht.verstuurdOp)}
                      </span>
                      {bericht.gelezen && (
                        <span className="material-symbols-outlined text-[14px] text-terracotta-dark">
                          done_all
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
        {/* Afspraak kaart */}
        {toonAfspraak && (
          <div className="w-full bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-terracotta-dark">calendar_today</span>
              <h3 className="font-bold text-slate-900 text-sm">Kennismakingsafspraak plannen</h3>
            </div>
            <p className="text-xs text-slate-500">
              Kies een datum voor een bezoek aan het asiel om {dierNaam} te ontmoeten.
            </p>
            <input
              type="datetime-local"
              value={afspraakDatum}
              onChange={(e) => setAfspraakDatum(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-terracotta/30"
              min={new Date().toISOString().slice(0, 16)}
            />
            <button
              onClick={slaAfspraakOp}
              disabled={!afspraakDatum || afspraakOpslaan}
              className="w-full bg-terracotta-dark text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {afspraakOpslaan ? (
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">check</span>
                  Afspraak bevestigen
                </>
              )}
            </button>
          </div>
        )}

        {!toonAfspraak && initieleAfspraak && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <span className="material-symbols-outlined text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_available
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">Afspraak gepland</p>
              <p className="text-xs text-slate-500">
                {new Date(initieleAfspraak).toLocaleDateString('nl-NL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={() => setToonAfspraak(true)}
              className="ml-auto text-xs text-slate-400 underline"
            >
              Wijzig
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input balk */}
      <footer className="bg-white border-t border-slate-200 p-4 pb-8 fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={nieuwBericht}
              onChange={(e) => setNieuwBericht(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Typ een bericht..."
              className="w-full bg-slate-100 border-none rounded-full py-2 px-4 text-sm focus:ring-2 focus:ring-terracotta/50 text-slate-900 placeholder:text-slate-500 outline-none"
            />
          </div>
          <button
            onClick={verstuurBericht}
            disabled={versturen || !nieuwBericht.trim()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-terracotta-dark text-white shadow-lg shadow-terracotta/20 active:scale-95 transition-transform disabled:opacity-40"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </footer>
    </div>
  )
}
