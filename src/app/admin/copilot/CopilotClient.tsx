'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { BriefingData, CopilotTaak } from '@/app/api/admin/copilot/briefing/route'

type Rol = {
  id: string
  naam: string
  titel: string
  icoon: string
  kleur: string
  beschrijving: string
  actief: boolean
  acties: { id: string; label: string; icoon: string; prompt: string; sideEffect: boolean; endpoint: string | null }[]
}

type ChatBericht = {
  id: string
  rol: 'user' | 'assistant'
  inhoud: string
  laden?: boolean
}

const SNELLE_ACTIES = [
  { label: 'Dagelijkse prioriteiten', prompt: 'Wat zijn de belangrijkste prioriteiten voor vandaag?' },
  { label: 'Schrijf adoptieverhaal', prompt: 'Kies een dier en schrijf een warm adoptieverhaal.' },
  { label: 'Social media post', prompt: 'Maak een Instagram post voor een dier dat al lang in het asiel zit.' },
  { label: 'Wie heeft aandacht nodig?', prompt: 'Welke dieren hebben deze week extra aandacht of actie nodig?' },
  { label: 'Weekoverzicht', prompt: 'Geef me een samenvatting van hoe de week ervoor staat.' },
  { label: 'Adoptietips', prompt: 'Geef me tips om de adoptie snelheid te verhogen voor dieren die al lang wachten.' },
]

function markdownNaarHtml(tekst: string): string {
  return tekst
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<div class="font-bold text-sm mt-3 mb-1 text-[#33335c]">$1</div>')
    .replace(/^## (.+)$/gm, '<div class="font-bold text-base mt-4 mb-1 text-[#33335c]">$1</div>')
    .replace(/^- (.+)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-[#33335c]/40 flex-shrink-0">•</span><span>$1</span></div>')
    .replace(/\n\n/g, '<div class="my-2"></div>')
    .replace(/\n/g, '<br/>')
}

const prioriteitStijl: Record<string, { bg: string; border: string; dot: string; badge: string }> = {
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
  },
  normaal: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    dot: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
  },
  info: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
  },
}

function TaakKaart({ taak }: { taak: CopilotTaak }) {
  const stijl = prioriteitStijl[taak.prioriteit] ?? prioriteitStijl.info
  return (
    <div className={`${stijl.bg} border ${stijl.border} rounded-xl p-3.5`}>
      <div className="flex items-start gap-3">
        <div className={`size-8 rounded-lg bg-white/70 flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <span
            className="material-symbols-outlined text-base"
            style={{ color: taak.prioriteit === 'urgent' ? '#ef4444' : taak.prioriteit === 'normaal' ? '#d97706' : '#059669', fontVariationSettings: "'FILL' 1" }}
          >
            {taak.icoon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-bold text-[#33335c] text-sm leading-tight">{taak.titel}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stijl.badge}`}>
              {taak.prioriteit === 'urgent' ? 'Urgent' : taak.prioriteit === 'normaal' ? 'Normaal' : 'Info'}
            </span>
          </div>
          <p className="text-[#33335c]/60 text-xs leading-relaxed">{taak.beschrijving}</p>
          {taak.link && (
            <Link
              href={taak.link}
              className="inline-flex items-center gap-1 mt-2 text-[#33335c] text-xs font-bold hover:underline"
            >
              {taak.linkTekst ?? 'Bekijk'}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-1.5 items-center px-1 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="size-2 rounded-full bg-[#33335c]/30 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

interface Props {
  gebruikerNaam: string
  asielNaam: string
}

export default function CopilotClient({ gebruikerNaam, asielNaam }: Props) {
  const [berichten, setBerichten] = useState<ChatBericht[]>([])
  const [invoer, setInvoer] = useState('')
  const [laadt, setLaadt] = useState(false)
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [briefingLaden, setBriefingLaden] = useState(true)
  const [briefingFout, setBriefingFout] = useState(false)
  const [toonTaken, setToonTaken] = useState(true)
  const [rollen, setRollen] = useState<Rol[]>([])
  const [rollenLaden, setRollenLaden] = useState(true)
  const [actieveRol, setActieveRol] = useState<string | null>(null)

  const chatBottomRef = useRef<HTMLDivElement>(null)
  const invoerRef = useRef<HTMLTextAreaElement>(null)

  // Laad briefing + beschikbare rollen bij mount
  useEffect(() => {
    async function laadBriefing() {
      try {
        const res = await fetch('/api/admin/copilot/briefing')
        if (!res.ok) throw new Error('Briefing mislukt')
        const data = await res.json() as BriefingData
        setBriefing(data)
      } catch {
        setBriefingFout(true)
      } finally {
        setBriefingLaden(false)
      }
    }
    async function laadRollen() {
      try {
        const res = await fetch('/api/admin/copilot/rollen')
        if (res.ok) {
          const data = (await res.json()) as { rollen: Rol[] }
          setRollen(data.rollen)
        }
      } catch {
        // rollen optioneel
      } finally {
        setRollenLaden(false)
      }
    }
    laadBriefing()
    laadRollen()
  }, [])

  // Scroll naar beneden bij nieuwe berichten
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten])

  const verstuurBericht = useCallback(async (tekst: string, actieId?: string) => {
    const trim = tekst.trim()
    if (!trim || laadt) return

    const nieuwBericht: ChatBericht = { id: Date.now().toString(), rol: 'user', inhoud: trim }
    const assistentPlaceholder: ChatBericht = { id: (Date.now() + 1).toString(), rol: 'assistant', inhoud: '', laden: true }

    setBerichten((prev) => [...prev, nieuwBericht, assistentPlaceholder])
    setInvoer('')
    setLaadt(true)

    try {
      const payload = {
        berichten: [...berichten, nieuwBericht].map((b) => ({ rol: b.rol, inhoud: b.inhoud })),
        ...(actieveRol ? { rol: actieveRol } : {}),
        ...(actieId ? { actieId } : {}),
      }

      const res = await fetch('/api/admin/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok || !res.body) {
        throw new Error('Fout bij ophalen antwoord')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let antwoord = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        antwoord += decoder.decode(value, { stream: true })

        setBerichten((prev) =>
          prev.map((b) => (b.id === assistentPlaceholder.id ? { ...b, inhoud: antwoord, laden: false } : b))
        )
      }
    } catch {
      setBerichten((prev) =>
        prev.map((b) =>
          b.id === assistentPlaceholder.id
            ? { ...b, inhoud: 'Sorry, er ging iets mis. Probeer het opnieuw.', laden: false }
            : b
        )
      )
    } finally {
      setLaadt(false)
      invoerRef.current?.focus()
    }
  }, [berichten, laadt, actieveRol])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      verstuurBericht(invoer)
    }
  }

  const urgenteTaken = briefing?.taken.filter((t) => t.prioriteit === 'urgent') ?? []
  const overigeTaken = briefing?.taken.filter((t) => t.prioriteit !== 'urgent') ?? []

  return (
    <div className="h-screen flex flex-col bg-[#f6f8f6]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="size-10 rounded-2xl bg-gradient-to-br from-[#33335c] to-[#5c5c9e] flex items-center justify-center shadow-lg shadow-[#33335c]/20">
            <span
              className="material-symbols-outlined text-[#f8aa25] text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#33335c] leading-tight">Asiel Copilot</h1>
            <p className="text-[#33335c]/40 text-xs font-medium">{asielNaam} · AI-assistent voor medewerkers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-[#33335c]/40">Online</span>
        </div>
      </div>

      {/* Rol-switcher: AI-team */}
      <div className="bg-white/60 border-b border-gray-100 px-8 py-2.5 flex items-center gap-2 overflow-x-auto flex-shrink-0">
        <span className="text-xs font-extrabold text-[#33335c]/40 uppercase tracking-wider mr-1 flex-shrink-0">
          AI-team
        </span>
        <button
          onClick={() => setActieveRol(null)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            actieveRol === null
              ? 'bg-[#33335c] text-white shadow-sm'
              : 'bg-white border border-gray-200 text-[#33335c]/60 hover:bg-gray-50'
          }`}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          Algemeen
        </button>
        {!rollenLaden && rollen.map((r) => {
          const actief = actieveRol === r.id
          return (
            <button
              key={r.id}
              onClick={() => setActieveRol(actief ? null : r.id)}
              title={`${r.naam} — ${r.titel}`}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                actief ? 'text-white shadow-sm' : 'bg-white border border-gray-200 text-[#33335c]/60 hover:bg-gray-50'
              }`}
              style={actief ? { backgroundColor: r.kleur } : undefined}
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {r.icoon}
              </span>
              {r.naam}
            </button>
          )
        })}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Linker paneel: Briefing + Taken */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            {/* Dagelijkse briefing */}
            <div className="bg-gradient-to-br from-[#33335c] to-[#4a4a8a] rounded-2xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="material-symbols-outlined text-[#f8aa25] text-lg"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  wb_sunny
                </span>
                <span className="font-bold text-sm">Goedemorgen, {gebruikerNaam}</span>
              </div>

              {briefingLaden ? (
                <div className="space-y-2">
                  {[80, 60, 70].map((w, i) => (
                    <div key={i} className={`h-3 bg-white/10 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : briefingFout ? (
                <p className="text-white/60 text-xs">Briefing kon niet worden geladen.</p>
              ) : briefing ? (
                <>
                  <p
                    className="text-white/90 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: markdownNaarHtml(briefing.briefingTekst) }}
                  />
                  {briefing.stats && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { label: 'Beschikbaar', waarde: briefing.stats.beschikbaar, icoon: 'pets' },
                        { label: 'Open adopties', waarde: briefing.stats.openstaandeAdopties, icoon: 'favorite' },
                        { label: 'Berichten', waarde: briefing.stats.onglezenBerichten, icoon: 'chat' },
                        { label: 'Med. alerts', waarde: briefing.stats.medischeAlerts, icoon: 'medical_services' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white/10 rounded-xl p-2">
                          <p className="text-white/50 text-[10px] font-medium">{stat.label}</p>
                          <p className="text-white font-extrabold text-lg leading-tight tabular-nums">{stat.waarde}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Taken */}
            {briefingLaden ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (briefing?.taken?.length ?? 0) > 0 ? (
              <div>
                <button
                  onClick={() => setToonTaken((v) => !v)}
                  className="flex items-center justify-between w-full mb-2"
                >
                  <span className="text-xs font-extrabold text-[#33335c]/50 uppercase tracking-wider">
                    Prioriteiten ({briefing!.taken.length})
                  </span>
                  <span className="material-symbols-outlined text-sm text-[#33335c]/30">
                    {toonTaken ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {toonTaken && (
                  <div className="space-y-2">
                    {urgenteTaken.length > 0 && (
                      <>
                        {urgenteTaken.map((t) => <TaakKaart key={t.id} taak={t} />)}
                      </>
                    )}
                    {overigeTaken.map((t) => <TaakKaart key={t.id} taak={t} />)}
                  </div>
                )}
              </div>
            ) : briefing && !briefingFout ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <span
                  className="material-symbols-outlined text-emerald-500 text-2xl block mb-1"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <p className="text-emerald-800 font-bold text-sm">Alles in orde!</p>
                <p className="text-emerald-600/60 text-xs mt-0.5">Geen openstaande taken</p>
              </div>
            ) : null}

            {/* Inzichten */}
            {(briefing?.inzichten?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-extrabold text-[#33335c]/50 uppercase tracking-wider mb-2">Inzichten</p>
                <div className="space-y-1.5">
                  {briefing!.inzichten.map((inzicht, i) => (
                    <div key={i} className="flex gap-2 items-start bg-violet-50 border border-violet-100 rounded-xl p-3">
                      <span
                        className="material-symbols-outlined text-violet-500 text-sm flex-shrink-0 mt-0.5"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        lightbulb
                      </span>
                      <p className="text-violet-800 text-xs leading-relaxed">{inzicht}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Snelle acties — rol-specifiek of algemeen */}
            <div>
              <p className="text-xs font-extrabold text-[#33335c]/50 uppercase tracking-wider mb-2">
                {actieveRol ? `Acties · ${rollen.find((r) => r.id === actieveRol)?.naam ?? ''}` : 'Snelle acties'}
              </p>
              <div className="space-y-1">
                {(actieveRol
                  ? rollen.find((r) => r.id === actieveRol)?.acties.map((a) => ({
                      label: a.label,
                      prompt: a.prompt,
                      icoon: a.icoon,
                      actieId: a.id,
                    })) ?? []
                  : SNELLE_ACTIES.map((a) => ({ label: a.label, prompt: a.prompt, icoon: 'bolt', actieId: undefined }))
                ).map((actie) => (
                  <button
                    key={actie.label}
                    onClick={() => verstuurBericht(actie.prompt, actie.actieId)}
                    disabled={laadt}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group disabled:opacity-50"
                  >
                    <span
                      className="material-symbols-outlined text-sm text-[#33335c]/30 group-hover:text-[#33335c]/60 transition-colors flex-shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {actie.icoon}
                    </span>
                    <span className="text-xs font-semibold text-[#33335c]/60 group-hover:text-[#33335c] transition-colors">
                      {actie.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat gebied */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Actieve rol banner */}
          {actieveRol && (() => {
            const r = rollen.find((x) => x.id === actieveRol)
            if (!r) return null
            return (
              <div
                className="px-6 py-2.5 flex items-center gap-2 text-white text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: r.kleur }}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {r.icoon}
                </span>
                <span>{r.naam} · {r.titel}</span>
                <span className="ml-auto text-white/80 text-xs font-medium">{r.beschrijving}</span>
              </div>
            )
          })()}

          {/* Berichten */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {berichten.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="size-16 rounded-3xl bg-[#33335c]/5 flex items-center justify-center mb-4">
                  <span
                    className="material-symbols-outlined text-3xl text-[#33335c]/20"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <h2 className="font-extrabold text-[#33335c] text-xl mb-2">Hallo, {gebruikerNaam}!</h2>
                <p className="text-[#33335c]/40 text-sm max-w-sm leading-relaxed">
                  Ik ben je AI-copilot. Stel me een vraag, laat me een tekst schrijven, of klik op een snelle actie links.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-6 max-w-md w-full">
                  {SNELLE_ACTIES.slice(0, 4).map((actie) => (
                    <button
                      key={actie.label}
                      onClick={() => verstuurBericht(actie.prompt)}
                      className="text-left bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-[#33335c]/20 hover:shadow-sm transition-all group"
                    >
                      <span className="text-xs font-bold text-[#33335c]/60 group-hover:text-[#33335c] transition-colors block">
                        {actie.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {berichten.map((bericht) => (
              <div
                key={bericht.id}
                className={`flex gap-3 ${bericht.rol === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-1">
                  {bericht.rol === 'assistant' ? (
                    <div className="size-8 rounded-xl bg-gradient-to-br from-[#33335c] to-[#5c5c9e] flex items-center justify-center shadow-sm">
                      <span
                        className="material-symbols-outlined text-[#f8aa25] text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                    </div>
                  ) : (
                    <div className="size-8 rounded-xl bg-[#f8aa25] flex items-center justify-center shadow-sm">
                      <span className="text-[#33335c] font-extrabold text-sm leading-none">
                        {gebruikerNaam.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    bericht.rol === 'user'
                      ? 'bg-[#33335c] text-white rounded-tr-sm'
                      : 'bg-white border border-gray-100 text-[#33335c] rounded-tl-sm shadow-sm'
                  }`}
                >
                  {bericht.laden ? (
                    <TypingIndicator />
                  ) : bericht.rol === 'assistant' ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: markdownNaarHtml(bericht.inhoud) }}
                      className="[&_strong]:font-bold [&_strong]:text-[#33335c] [&_em]:italic"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{bericht.inhoud}</p>
                  )}
                </div>
              </div>
            ))}

            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white p-4">
            <div className="flex gap-3 items-end max-w-4xl mx-auto">
              <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-[#33335c]/30 focus-within:bg-white transition-all">
                <textarea
                  ref={invoerRef}
                  value={invoer}
                  onChange={(e) => setInvoer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Stel een vraag of vraag om een tekst... (Enter om te sturen)"
                  rows={1}
                  disabled={laadt}
                  className="w-full bg-transparent text-sm text-[#33335c] placeholder-[#33335c]/30 resize-none outline-none max-h-32 disabled:opacity-50"
                  style={{ minHeight: '24px' }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement
                    t.style.height = 'auto'
                    t.style.height = `${Math.min(t.scrollHeight, 128)}px`
                  }}
                />
              </div>
              <button
                onClick={() => verstuurBericht(invoer)}
                disabled={!invoer.trim() || laadt}
                className="size-11 bg-[#33335c] text-white rounded-2xl flex items-center justify-center hover:bg-[#33335c]/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#33335c]/20 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {laadt ? 'hourglass_empty' : 'send'}
                </span>
              </button>
            </div>
            <p className="text-center text-[#33335c]/20 text-[10px] mt-2 font-medium">
              Copilot heeft toegang tot alle actuele data van {asielNaam}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
