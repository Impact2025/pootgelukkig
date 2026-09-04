'use client'

import { useState, useRef, useEffect } from 'react'

type Bericht = { rol: 'user' | 'assistant'; inhoud: string }

export default function WidgetChat({ org }: { org: string }) {
  const [berichten, setBerichten] = useState<Bericht[]>([
    { rol: 'assistant', inhoud: 'Hoi! Ik ben Samen, de digitale assistent. Waar kan ik je mee helpen?' },
  ])
  const [invoer, setInvoer] = useState('')
  const [bezig, setBezig] = useState(false)
  const bodemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodemRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten])

  async function verstuur(e: React.FormEvent) {
    e.preventDefault()
    const tekst = invoer.trim()
    if (!tekst || bezig || !org) return

    const nieuweBerichten: Bericht[] = [...berichten, { rol: 'user', inhoud: tekst }]
    setBerichten(nieuweBerichten)
    setInvoer('')
    setBezig(true)

    try {
      const res = await fetch('/api/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org, berichten: nieuweBerichten }),
      })

      if (!res.body) throw new Error('Geen antwoord ontvangen')

      setBerichten((prev) => [...prev, { rol: 'assistant', inhoud: '' }])
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setBerichten((prev) => {
          const kopie = [...prev]
          kopie[kopie.length - 1] = { rol: 'assistant', inhoud: kopie[kopie.length - 1].inhoud + chunk }
          return kopie
        })
      }
    } catch {
      setBerichten((prev) => [...prev, { rol: 'assistant', inhoud: 'Sorry, er ging iets mis. Probeer het opnieuw.' }])
    } finally {
      setBezig(false)
    }
  }

  if (!org) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[#1E293B]/50">
        Widget niet correct ingesteld: voeg <code className="mx-1 px-1 bg-gray-100 rounded">?org=jouw-organisatie-slug</code> toe aan de embed-URL.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 bg-[#0F172A] text-white">
        <span className="flex size-8 items-center justify-center rounded-full bg-[#3B82F6]">
          <span className="material-symbols-outlined text-[1.1rem]">forum</span>
        </span>
        <div>
          <p className="text-sm font-bold leading-tight">Samen</p>
          <p className="text-[10px] text-white/60 leading-tight">Digitale assistent · meestal binnen een minuut</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {berichten.map((b, i) => (
          <div key={i} className={`flex ${b.rol === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                b.rol === 'user' ? 'bg-[#2563EB] text-white rounded-br-sm' : 'bg-gray-100 text-[#1E293B] rounded-bl-sm'
              }`}
            >
              {b.inhoud || (bezig && i === berichten.length - 1 ? '…' : '')}
            </div>
          </div>
        ))}
        <div ref={bodemRef} />
      </div>

      <form onSubmit={verstuur} className="flex items-center gap-2 border-t border-gray-100 px-3 py-3">
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          placeholder="Stel je vraag…"
          disabled={bezig}
          className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={bezig || !invoer.trim()}
          className="flex size-10 items-center justify-center rounded-xl bg-[#2563EB] text-white disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-[1.2rem]">send</span>
        </button>
      </form>
    </div>
  )
}
