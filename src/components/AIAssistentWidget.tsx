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
  { label: 'Openingstijden', vraag: 'Wat zijn jullie openingstijden?' },
  { label: 'Afspraak maken', vraag: 'Hoe maak ik een kennismakingsafspraak?' },
  { label: 'Adoptieproces', vraag: 'Hoe verloopt het adoptieproces?' },
  { label: 'Locatie', vraag: 'Waar zijn jullie gevestigd en hoe kom ik er?' },
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

  // Scroll naar beneden bij nieuwe berichten
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten])

  // Focus input als widget opent
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
      setGezien(true)
    }
  }, [open])

  // Reset gesprek als pagina verandert
  useEffect(() => {
    setBerichten([])
  }, [pathname])

  const verstuur = useCallback(async (tekst: string) => {
    const tekstTrimmed = tekst.trim()
    if (!tekstTrimmed || bezig) return

    const gebruikerBericht: Bericht = {
      id: crypto.randomUUID(),
      rol: 'user',
      inhoud: tekstTrimmed,
    }

    const assistentId = crypto.randomUUID()
    const assistentBericht: Bericht = {
      id: assistentId,
      rol: 'assistant',
      inhoud: '',
      streaming: true,
    }

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

      if (!response.ok || !response.body) {
        throw new Error('Fout bij ophalen antwoord')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let volledigAntwoord = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        volledigAntwoord += chunk
        setBerichten((prev) =>
          prev.map((b) =>
            b.id === assistentId ? { ...b, inhoud: volledigAntwoord, streaming: true } : b
          )
        )
      }

      setBerichten((prev) =>
        prev.map((b) =>
          b.id === assistentId ? { ...b, inhoud: volledigAntwoord, streaming: false } : b
        )
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

  // Alleen tonen voor ingelogde adoptanten
  if (status === 'loading') return null
  if (!session?.user) return null
  // Verberg op admin pagina's
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname === '/') return null

  const dierNaam = animalId ? null : null // naam komt via context in system prompt

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Assistent openen"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-[#13ec13] shadow-lg shadow-[#13ec13]/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        {open ? (
          <span className="material-symbols-outlined text-[#102210] text-2xl" style={{ fontVariationSettings: "'wght' 600" }}>
            close
          </span>
        ) : (
          <span className="material-symbols-outlined text-[#102210] text-2xl" style={{ fontVariationSettings: "'wght' 600" }}>
            smart_toy
          </span>
        )}
        {/* Pulserende dot bij eerste bezoek */}
        {!gezien && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#ee5b2b] border-2 border-[#102210] animate-pulse" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-[390px] h-[520px] flex flex-col rounded-3xl bg-[#102210] border border-[#13ec13]/20 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#13ec13]/10 bg-[#13ec13]/5">
            <div className="w-8 h-8 rounded-full bg-[#13ec13]/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#13ec13] text-base" style={{ fontVariationSettings: "'wght' 500, 'FILL' 1" }}>
                smart_toy
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-tight">PootGelukkig Assistent</p>
              <p className="text-[#9db99d] text-xs truncate">
                {animalId ? `Over dit dier` : 'Stel je vraag'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#13ec13] animate-pulse" />
                <span className="text-[#9db99d] text-xs">Online</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Sluiten"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#9db99d] hover:text-white hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Berichten */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Welkomstbericht */}
            {berichten.length === 0 && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#13ec13]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[#13ec13] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]">
                    <p className="text-white text-sm leading-relaxed">
                      Hoi {session.user.name?.split(' ')[0] ?? 'daar'}! 👋 Ik ben de PootGelukkig Assistent. Heb je vragen over {animalId ? 'dit dier,' : ''} het asiel of het adoptieproces? Ik help je graag!
                    </p>
                  </div>
                </div>

                {/* Quick vragen */}
                <div className="flex flex-wrap gap-2 pl-8">
                  {QUICK_VRAGEN.map((q) => (
                    <button
                      key={q.label}
                      onClick={() => void verstuur(q.vraag)}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#13ec13]/30 text-[#9db99d] hover:bg-[#13ec13]/10 hover:text-white hover:border-[#13ec13]/60 transition-colors"
                    >
                      {q.label}
                    </button>
                  ))}
                  {animalId && (
                    <button
                      onClick={() => void verstuur('Is dit dier nog beschikbaar voor adoptie?')}
                      className="text-xs px-3 py-1.5 rounded-full border border-[#13ec13]/30 text-[#9db99d] hover:bg-[#13ec13]/10 hover:text-white hover:border-[#13ec13]/60 transition-colors"
                    >
                      Nog beschikbaar?
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Berichtenlijst */}
            {berichten.map((bericht) => (
              <div
                key={bericht.id}
                className={`flex gap-2 ${bericht.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {bericht.rol === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#13ec13]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[#13ec13] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                      smart_toy
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 ${
                    bericht.rol === 'user'
                      ? 'bg-[#13ec13]/15 rounded-tr-sm text-white'
                      : 'bg-white/5 rounded-tl-sm text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {bericht.inhoud}
                    {bericht.streaming && bericht.inhoud && (
                      <span className="inline-block w-0.5 h-4 bg-[#13ec13] ml-0.5 animate-pulse align-middle" />
                    )}
                    {bericht.streaming && !bericht.inhoud && (
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9db99d] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9db99d] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9db99d] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-[#13ec13]/10">
            <div className="flex items-center gap-2 bg-white/5 rounded-2xl px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Stel een vraag..."
                disabled={bezig}
                className="flex-1 bg-transparent text-white text-sm placeholder-[#9db99d]/60 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => void verstuur(invoer)}
                disabled={!invoer.trim() || bezig}
                className="w-8 h-8 rounded-full bg-[#13ec13] flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                <span className="material-symbols-outlined text-[#102210] text-base" style={{ fontVariationSettings: "'wght' 700" }}>
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
