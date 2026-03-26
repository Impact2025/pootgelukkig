'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

type Bericht = {
  id: string
  rol: 'user' | 'assistant'
  inhoud: string
  streaming?: boolean
}

const QUICK_VRAGEN = [
  { label: '🕐 Openingstijden', vraag: 'Wat zijn jullie openingstijden?' },
  { label: '📅 Afspraak', vraag: 'Hoe maak ik een kennismakingsafspraak?' },
  { label: '🏠 Adoptieproces', vraag: 'Hoe verloopt het adoptieproces?' },
  { label: '📍 Locatie', vraag: 'Waar zijn jullie gevestigd en hoe kom ik er?' },
]

function extractAnimalId(pathname: string): string | null {
  const match = /\/animals\/(\d+)/.exec(pathname)
  return match?.[1] ?? null
}

export function AIAssistentWidget() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [berichten, setBerichten] = useState<Bericht[]>([])
  const [invoer, setInvoer] = useState('')
  const [bezig, setBezig] = useState(false)
  const [gezien, setGezien] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const animalId = extractAnimalId(pathname)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
      setGezien(true)
    }
  }, [open])

  useEffect(() => {
    setBerichten([])
  }, [pathname])

  const verstuur = useCallback(async (tekst: string) => {
    const tekstTrimmed = tekst.trim()
    if (!tekstTrimmed || bezig) return

    const gebruikerBericht: Bericht = { id: crypto.randomUUID(), rol: 'user', inhoud: tekstTrimmed }
    const assistentId = crypto.randomUUID()
    const assistentBericht: Bericht = { id: assistentId, rol: 'assistant', inhoud: '', streaming: true }

    setBerichten((prev) => [...prev, gebruikerBericht, assistentBericht])
    setInvoer('')
    setBezig(true)

    try {
      const payload = {
        berichten: [
          ...berichten.map((b) => ({ rol: b.rol, inhoud: b.inhoud })),
          { rol: 'user' as const, inhoud: tekstTrimmed },
        ],
        ...(animalId ? { animalId } : {}),
      }

      const response = await fetch('/api/assistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok || !response.body) throw new Error('Fout bij ophalen antwoord')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let volledigAntwoord = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        volledigAntwoord += chunk
        setBerichten((prev) =>
          prev.map((b) => b.id === assistentId ? { ...b, inhoud: volledigAntwoord, streaming: true } : b)
        )
      }

      setBerichten((prev) =>
        prev.map((b) => b.id === assistentId ? { ...b, inhoud: volledigAntwoord, streaming: false } : b)
      )
    } catch {
      setBerichten((prev) =>
        prev.map((b) =>
          b.id === assistentId
            ? { ...b, inhoud: 'Sorry, er ging iets mis. Probeer het opnieuw.', streaming: false }
            : b
        )
      )
    } finally {
      setBezig(false)
    }
  }, [berichten, bezig, animalId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void verstuur(invoer)
    }
  }

  if (status === 'loading') return null
  if (!session?.user) return null
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname === '/') return null

  const voornaam = session.user.name?.split(' ')[0] ?? 'daar'

  return (
    <>
      <style>{`
        @keyframes pg-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
        @keyframes pg-pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .pg-chat-panel { animation: pg-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
        .pg-pulse-ring  { animation: pg-pulse-ring 1.8s ease-out infinite; }
        .pg-dot-bounce  { animation: bounce 1.2s ease-in-out infinite; }
      `}</style>

      {/* ── Floating button ──────────────────────────────────────────────── */}
      <div className="fixed bottom-24 right-4 z-50">
        {/* Pulse ring — alleen als nog niet gezien */}
        {!gezien && !open && (
          <span className="pg-pulse-ring absolute inset-0 rounded-full border-2 border-[#f8aa25]/60 pointer-events-none" />
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'AI Assistent sluiten' : 'AI Assistent openen'}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
          style={{
            background: open
              ? 'linear-gradient(135deg, #33335c 0%, #1e1e3f 100%)'
              : 'linear-gradient(135deg, #f8aa25 0%, #e39207 100%)',
            boxShadow: open
              ? '0 8px 32px rgba(51,53,92,0.5), 0 2px 8px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(248,170,37,0.45), 0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {open ? (
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'wght' 600" }}>
              keyboard_arrow_down
            </span>
          ) : (
            <span className="material-symbols-outlined text-[#12122a] text-2xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>
              pets
            </span>
          )}

          {/* AI badge */}
          {!open && (
            <span
              className="absolute -top-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#12122a]/20"
              style={{ background: '#33335c', color: '#f8aa25', letterSpacing: '0.05em' }}
            >
              AI
            </span>
          )}

          {/* Ongelezen dot */}
          {!gezien && !open && (
            <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[#ee5b2b] border-2 border-white" />
          )}
        </button>
      </div>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className="pg-chat-panel fixed bottom-24 right-4 z-50 flex flex-col rounded-3xl overflow-hidden border"
          style={{
            width: 'min(calc(100vw - 2rem), 390px)',
            height: 'min(560px, calc(100dvh - 120px))',
            background: 'linear-gradient(180deg, #1a1a35 0%, #12122a 100%)',
            borderColor: 'rgba(248,170,37,0.15)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 4px 16px rgba(248,170,37,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(248,170,37,0.12) 0%, rgba(51,53,92,0.2) 100%)',
              borderBottom: '1px solid rgba(248,170,37,0.12)',
            }}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f8aa25 0%, #e39207 100%)', boxShadow: '0 4px 12px rgba(248,170,37,0.3)' }}
            >
              <span className="material-symbols-outlined text-[#12122a] text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
                pets
              </span>
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-tight tracking-tight">PootGelukkig AI</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#9db99d] text-xs font-medium">
                  {animalId ? 'Vragen over dit dier' : 'Altijd beschikbaar'}
                </span>
              </div>
            </div>

            {/* Sluiten */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* ── Berichten ──────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">

            {/* Welkomstbericht */}
            {berichten.length === 0 && (
              <div className="space-y-4">
                {/* Welkomst bubble */}
                <div className="flex gap-2.5">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #f8aa25 0%, #e39207 100%)' }}
                  >
                    <span className="material-symbols-outlined text-[#12122a] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-white/90 text-sm leading-relaxed">
                      Hoi {voornaam}! 👋 Ik ben de PootGelukkig AI. Ik kan je helpen met vragen over{' '}
                      {animalId ? 'dit dier,' : ''} het asiel en het adoptieproces.
                    </p>
                  </div>
                </div>

                {/* Quick action chips */}
                <div className="flex flex-wrap gap-2 pl-10">
                  {QUICK_VRAGEN.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => void verstuur(q.vraag)}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(248,170,37,0.08)',
                        border: '1px solid rgba(248,170,37,0.2)',
                        color: '#f8aa25',
                      }}
                    >
                      {q.label}
                    </button>
                  ))}
                  {animalId && (
                    <button
                      onClick={() => void verstuur('Is dit dier nog beschikbaar voor adoptie?')}
                      className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 hover:scale-105 active:scale-95"
                      style={{ background: 'rgba(248,170,37,0.08)', border: '1px solid rgba(248,170,37,0.2)', color: '#f8aa25' }}
                    >
                      🐾 Nog beschikbaar?
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Berichtenlijst */}
            {berichten.map((bericht) => (
              <div
                key={bericht.id}
                className={`flex gap-2.5 ${bericht.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar assistent */}
                {bericht.rol === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #f8aa25 0%, #e39207 100%)' }}
                  >
                    <span className="material-symbols-outlined text-[#12122a] text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${bericht.rol === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={bericht.rol === 'user'
                    ? { background: 'linear-gradient(135deg, rgba(248,170,37,0.18) 0%, rgba(248,170,37,0.10) 100%)', border: '1px solid rgba(248,170,37,0.25)' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }
                  }
                >
                  <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                    {bericht.inhoud}
                    {bericht.streaming && bericht.inhoud && (
                      <span
                        className="inline-block w-0.5 h-3.5 ml-0.5 align-middle rounded-full"
                        style={{ background: '#f8aa25', animation: 'pulse 1s ease-in-out infinite' }}
                      />
                    )}
                    {bericht.streaming && !bericht.inhoud && (
                      <span className="inline-flex gap-1 items-center py-0.5">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: '#f8aa25', opacity: 0.6, animation: `bounce 1.2s ease-in-out ${delay}ms infinite` }}
                          />
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* ── Input ──────────────────────────────────────────────────── */}
          <div
            className="px-3 py-3 flex-shrink-0"
            style={{ borderTop: '1px solid rgba(248,170,37,0.08)', background: 'rgba(0,0,0,0.2)' }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(248,170,37,0.15)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Stel een vraag..."
                disabled={bezig}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/25 outline-none disabled:opacity-40"
              />
              <button
                onClick={() => void verstuur(invoer)}
                disabled={!invoer.trim() || bezig}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-25 hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #f8aa25 0%, #e39207 100%)', boxShadow: '0 4px 12px rgba(248,170,37,0.3)' }}
              >
                <span className="material-symbols-outlined text-[#12122a] text-base" style={{ fontVariationSettings: "'wght' 700" }}>
                  arrow_upward
                </span>
              </button>
            </div>

            <p className="text-center text-white/15 text-[10px] mt-2 font-medium">
              Powered by Claude AI · PootGelukkig
            </p>
          </div>
        </div>
      )}
    </>
  )
}
