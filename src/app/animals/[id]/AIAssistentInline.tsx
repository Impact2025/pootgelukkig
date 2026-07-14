'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

type Bericht = {
  id: string
  rol: 'user' | 'assistant'
  inhoud: string
  streaming?: boolean
}

const QUICK_VRAGEN = [
  { label: 'Past dit dier bij mij?', vraag: 'Past dit dier goed bij mij?' },
  { label: 'Adoptiekosten?', vraag: 'Wat zijn de adoptiekosten voor dit dier?' },
  { label: 'Afspraak maken', vraag: 'Hoe maak ik een kennismakingsafspraak?' },
  { label: 'Medische info', vraag: 'Kun je meer vertellen over de gezondheid van dit dier?' },
]

interface Props {
  dierId: number
  dierNaam: string
}

export default function AIAssistentInline({ dierId, dierNaam }: Props) {
  const [open, setOpen] = useState(false)
  const [berichten, setBerichten] = useState<Bericht[]>([])
  const [invoer, setInvoer] = useState('')
  const [bezig, setBezig] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [open, berichten])

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
      const response = await fetch('/api/assistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          berichten: [
            ...berichten.map((b) => ({ rol: b.rol, inhoud: b.inhoud })),
            { rol: 'user' as const, inhoud: tekstTrimmed },
          ],
          animalId: dierId,
        }),
      })

      if (!response.ok || !response.body) throw new Error('Fout')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let volledigAntwoord = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        volledigAntwoord += decoder.decode(value, { stream: true })
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
          b.id === assistentId ? { ...b, inhoud: 'Sorry, er ging iets mis. Probeer opnieuw.', streaming: false } : b
        )
      )
    } finally {
      setBezig(false)
    }
  }, [berichten, bezig, dierId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void verstuur(invoer)
    }
  }

  return (
    <section
      className="rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        background: open
          ? 'linear-gradient(180deg, #1a1a35 0%, #12122a 100%)'
          : 'rgba(248,170,37,0.06)',
        borderColor: open ? 'rgba(248,170,37,0.2)' : 'rgba(248,170,37,0.15)',
        boxShadow: open ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Header — altijd zichtbaar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #f8aa25 0%, #e39207 100%)', boxShadow: '0 4px 12px rgba(248,170,37,0.3)' }}
        >
          <span className="material-symbols-outlined text-[#12122a] text-lg" style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
            smart_toy
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight">Vraag het de AI</p>
          <p className="text-white/40 text-xs">Over {dierNaam}, het asiel en adoptie</p>
        </div>
        <span
          className="material-symbols-outlined text-white/40 text-xl transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          expand_more
        </span>
      </button>

      {/* Chat body — alleen als open */}
      {open && (
        <div className="border-t" style={{ borderColor: 'rgba(248,170,37,0.1)' }}>
          {/* Berichten */}
          <div className="px-4 pt-3 pb-2 space-y-3 max-h-64 overflow-y-auto overscroll-contain">
            {berichten.length === 0 && (
              <div className="flex gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #f8aa25, #e39207)' }}
                >
                  <span className="material-symbols-outlined text-[#12122a] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div
                  className="rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[85%]"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-white/90 text-sm leading-relaxed">
                    Hoi! Ik ben Dr. Poot. Stel gerust je vragen over {dierNaam} — ik ken alle details over dit dier en het asiel. 🐾
                  </p>
                </div>
              </div>
            )}

            {berichten.map((bericht) => (
              <div
                key={bericht.id}
                className={`flex gap-2 ${bericht.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {bericht.rol === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #f8aa25, #e39207)' }}
                  >
                    <span className="material-symbols-outlined text-[#12122a] text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                    bericht.rol === 'user'
                      ? 'rounded-tr-sm text-white'
                      : 'rounded-tl-sm text-white/90'
                  }`}
                  style={{
                    background: bericht.rol === 'user'
                      ? 'rgba(248,170,37,0.15)'
                      : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${bericht.rol === 'user' ? 'rgba(248,170,37,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <p className="whitespace-pre-wrap">
                    {bericht.inhoud}
                    {bericht.streaming && bericht.inhoud && (
                      <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse" style={{ background: '#f8aa25' }} />
                    )}
                    {bericht.streaming && !bericht.inhoud && (
                      <span className="inline-flex gap-1 py-0.5">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick vragen (alleen als geen berichten nog) */}
          {berichten.length === 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {QUICK_VRAGEN.map((q) => (
                <button
                  key={q.label}
                  onClick={() => void verstuur(q.vraag)}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{
                    border: '1px solid rgba(248,170,37,0.3)',
                    color: 'rgba(255,255,255,0.6)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(248,170,37,0.1)'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                  }}
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Vraag over ${dierNaam}...`}
                disabled={bezig}
                className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none disabled:opacity-50"
              />
              <button
                onClick={() => void verstuur(invoer)}
                disabled={!invoer.trim() || bezig}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-30 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #f8aa25, #e39207)' }}
              >
                <span className="material-symbols-outlined text-[#12122a] text-sm" style={{ fontVariationSettings: "'wght' 700" }}>
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
