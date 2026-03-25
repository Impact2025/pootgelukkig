'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Bericht {
  id: number
  verzenderType: 'adoptant' | 'asiel' | 'systeem'
  inhoud: string
  verstuurdOp: string
}

interface Props {
  gesprekId: number
  asielId: number
  dierNaam: string
  dierFotoUrl: string | null
  adoptantNaam: string
  adoptantEmail: string
  initialeBerichten: Bericht[]
  afspraakDatum?: string | null
}

export default function AdminChatClient({
  gesprekId,
  asielId,
  dierNaam,
  dierFotoUrl,
  adoptantNaam,
  adoptantEmail,
  initialeBerichten,
  afspraakDatum,
}: Props) {
  const [berichten, setBerichten] = useState<Bericht[]>(initialeBerichten)
  const [nieuwBericht, setNieuwBericht] = useState('')
  const [versturen, setVersturen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten])

  // Poll elke 4 seconden
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${gesprekId}/messages`)
        if (res.ok) {
          const json = await res.json()
          if (json.data) setBerichten(json.data)
        }
      } catch {
        // negeren
      }
    }, 4000)
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
          verzenderType: 'asiel',
          verzenderId: asielId,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setBerichten((prev) => [...prev, json.data])
      }
    } catch {
      setNieuwBericht(tekst)
    } finally {
      setVersturen(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      verstuurBericht()
    }
  }

  function formatDatum(iso: string) {
    return new Date(iso).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
        <Link href="/admin/berichten" className="text-[#33335c]/40 hover:text-[#33335c] transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
          {dierFotoUrl ? (
            <Image src={dierFotoUrl} alt={dierNaam} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-xl">pets</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#33335c] text-sm leading-tight">{adoptantNaam}</p>
          <p className="text-xs text-[#33335c]/40 truncate">
            {adoptantEmail} · over <span className="font-semibold">{dierNaam}</span>
          </p>
        </div>

        {afspraakDatum && (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-100">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              event_available
            </span>
            {new Date(afspraakDatum).toLocaleDateString('nl-NL', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </header>

      {/* Berichten */}
      <main className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#f6f8f6]">
        {berichten.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-200 mb-3">chat_bubble_outline</span>
            <p className="text-[#33335c]/40 font-semibold text-sm">Nog geen berichten</p>
            <p className="text-[#33335c]/30 text-xs mt-1">Stuur het eerste bericht naar {adoptantNaam}.</p>
          </div>
        ) : (
          berichten.map((bericht) => {
            const vanAdoptant = bericht.verzenderType === 'adoptant'
            const vanSysteem = bericht.verzenderType === 'systeem'
            if (vanSysteem) {
              return (
                <div key={bericht.id} className="flex justify-center">
                  <span className="text-[11px] text-[#33335c]/40 bg-white border border-gray-100 px-3 py-1 rounded-full">
                    {bericht.inhoud}
                  </span>
                </div>
              )
            }
            return (
              <div key={bericht.id} className={`flex ${vanAdoptant ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] space-y-1`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      vanAdoptant
                        ? 'bg-white text-[#33335c] border border-gray-100 rounded-tl-sm'
                        : 'bg-[#33335c] text-white rounded-tr-sm'
                    }`}
                  >
                    {bericht.inhoud}
                  </div>
                  <p className={`text-[10px] text-[#33335c]/40 ${vanAdoptant ? 'text-left ml-1' : 'text-right mr-1'}`}>
                    {vanAdoptant ? adoptantNaam.split(' ')[0] : 'Jij'} · {formatDatum(bericht.verstuurdOp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <footer className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={nieuwBericht}
            onChange={(e) => setNieuwBericht(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Stuur een bericht naar ${adoptantNaam.split(' ')[0]}...`}
            rows={1}
            className="flex-1 resize-none bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-[#33335c] placeholder:text-[#33335c]/30 outline-none focus:ring-2 focus:ring-[#33335c]/10 focus:border-[#33335c]/20 transition-all max-h-32"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={verstuurBericht}
            disabled={versturen || !nieuwBericht.trim()}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#33335c] text-[#f8aa25] shadow-sm disabled:opacity-30 hover:bg-[#2a2a52] transition-colors"
          >
            {versturen ? (
              <span className="size-4 border-2 border-[#f8aa25]/30 border-t-[#f8aa25] rounded-full animate-spin" />
            ) : (
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#33335c]/30 mt-2">Enter om te versturen · Shift+Enter voor nieuwe regel</p>
      </footer>
    </div>
  )
}
