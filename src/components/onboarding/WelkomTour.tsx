'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Rol = 'adoptant' | 'asiel' | 'admin'

interface WelkomTourProps {
  naam: string
  rol: Rol
}

const TOUR_KEY = 'pg_welkom_tour_v2'

// ─── ADOPTANT STAPPEN ──────────────────────────────────────────────────────

interface AdoptantStap {
  kleur: string
  gradient: string
  illustratie: React.ReactNode
  badge?: string
  titel: string
  beschrijving: string
  preview?: React.ReactNode
  cta?: { label: string; href: string }
}

function MatchBadge({ pct, delay = 0 }: { pct: number; delay?: number }) {
  return (
    <div
      className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-xl px-3 py-2 backdrop-blur-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="size-6 rounded-lg flex items-center justify-center text-xs">🐕</div>
      <div className="flex-1">
        <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: '#f8aa25' }}
          />
        </div>
      </div>
      <span className="text-xs font-black text-[#f8aa25]">{pct}%</span>
    </div>
  )
}

function QuestionChip({ vraag, vertraging }: { vraag: string; vertraging: number }) {
  return (
    <div
      className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-3.5 py-2.5 text-xs text-white/70 animate-fade-up"
      style={{ animationDelay: `${vertraging}ms`, animationFillMode: 'both' }}
    >
      <span className="size-1.5 rounded-full bg-[#f8aa25] flex-shrink-0" />
      {vraag}
    </div>
  )
}

const getAdoptantStappen = (voornaam: string): AdoptantStap[] => [
  {
    kleur: '#f8aa25',
    gradient: 'radial-gradient(ellipse at 30% 0%, #f8aa2522 0%, transparent 65%), radial-gradient(ellipse at 70% 100%, #13ec1310 0%, transparent 60%)',
    badge: `Hoi ${voornaam}! 👋`,
    titel: 'Welkom bij PootGelukkig',
    beschrijving: 'De slimste manier om jouw perfecte asieldier te vinden — niet op uiterlijk, maar op jóuw leven.',
    illustratie: (
      <div className="relative flex items-center justify-center h-28">
        <div className="absolute text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🐾</div>
        <div className="absolute -top-2 -right-4 text-3xl" style={{ animation: 'spin 8s linear infinite' }}>⭐</div>
        <div className="absolute -bottom-2 -left-6 text-2xl opacity-60" style={{ animation: 'spin 6s linear infinite reverse' }}>✨</div>
        <div className="absolute top-0 left-0 text-2xl opacity-40" style={{ animation: 'pootBounce 3s ease-in-out infinite', animationDelay: '0.5s' }}>🐕</div>
        <div className="absolute bottom-0 right-0 text-2xl opacity-40" style={{ animation: 'pootBounce 3s ease-in-out infinite', animationDelay: '1s' }}>🐈</div>
      </div>
    ),
  },
  {
    kleur: '#f8aa25',
    gradient: 'radial-gradient(ellipse at 50% 0%, #f8aa2518 0%, transparent 70%)',
    badge: 'Stap 1 van 3',
    titel: 'Doe de intake in 2 minuten',
    beschrijving: 'Beantwoord 7 korte vragen over jouw woning, leefstijl en ervaring met dieren.',
    illustratie: (
      <div className="text-5xl mb-1" style={{ filter: 'drop-shadow(0 0 20px rgba(248,170,37,0.4))' }}>💬</div>
    ),
    preview: (
      <div className="space-y-1.5 w-full">
        <QuestionChip vraag="Wat voor woning heb je?" vertraging={0} />
        <QuestionChip vraag="Hoe actief ben je?" vertraging={100} />
        <QuestionChip vraag="Heb je kinderen of andere dieren?" vertraging={200} />
      </div>
    ),
  },
  {
    kleur: '#f8aa25',
    gradient: 'radial-gradient(ellipse at 80% 20%, #f8aa2515 0%, transparent 60%)',
    badge: 'Stap 2 van 3',
    titel: 'AI berekent jouw matches',
    beschrijving: 'Claude AI analyseert elk dier en geeft een persoonlijke compatibiliteitsscore met uitleg.',
    illustratie: (
      <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 20px rgba(248,170,37,0.4))' }}>⚡</div>
    ),
    preview: (
      <div className="space-y-2 w-full">
        <MatchBadge pct={94} delay={0} />
        <MatchBadge pct={87} delay={80} />
        <MatchBadge pct={71} delay={160} />
      </div>
    ),
  },
  {
    kleur: '#f8aa25',
    gradient: 'radial-gradient(ellipse at 20% 20%, #f8aa2515 0%, transparent 60%)',
    badge: 'Stap 3 van 3',
    titel: 'Val in de arm — adopteer',
    beschrijving: 'Chat met het asiel, plan een kennismaking en start jouw adoptietraject. Alles op één plek.',
    illustratie: (
      <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 20px rgba(248,170,37,0.4))' }}>❤️</div>
    ),
    preview: (
      <div className="bg-white/8 border border-white/10 rounded-2xl p-3 w-full">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-xl bg-[#f8aa25]/20 flex items-center justify-center text-xl">🐕</div>
          <div className="flex-1">
            <p className="text-white text-xs font-bold">Buddy — Labrador, 4 jr</p>
            <p className="text-white/40 text-[10px]">Dierenasiel Amsterdam</p>
          </div>
          <div className="bg-[#f8aa25] rounded-lg px-2 py-1">
            <span className="text-[10px] font-black text-[#12122a]">94%</span>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 bg-white/5 rounded-xl py-2 text-center text-[10px] text-white/40 font-medium">❤️ Bewaren</div>
          <div className="flex-1 bg-[#f8aa25]/15 border border-[#f8aa25]/30 rounded-xl py-2 text-center text-[10px] text-[#f8aa25] font-bold">💬 Contact</div>
        </div>
      </div>
    ),
    cta: { label: '🚀  Start de intake — 2 min', href: '/intake' },
  },
]

// ─── ASIEL STAPPEN ─────────────────────────────────────────────────────────

interface AsielStap {
  navIcon: string
  navLabel: string
  navHref: string
  kleur: string
  icon: string
  titel: string
  beschrijving: string
  preview?: React.ReactNode
  cta?: { label: string; href: string }
}

const ASIEL_STAPPEN: AsielStap[] = [
  {
    navIcon: 'grid_view',
    navLabel: 'Dashboard',
    navHref: '/admin',
    kleur: '#E2725B',
    icon: 'domain',
    titel: 'Welkom op het asiel portaal',
    beschrijving: 'Jouw asiel staat nu live. Adoptanten in heel Nederland vinden jouw dieren via AI-matching — volledig automatisch.',
    preview: (
      <div className="grid grid-cols-3 gap-2 w-full">
        {[
          { label: 'Dieren actief', waarde: '35', icon: '🐾' },
          { label: 'Aanvragen', waarde: '8', icon: '📬' },
          { label: 'Gesprekken', waarde: '12', icon: '💬' },
        ].map((s) => (
          <div key={s.label} className="bg-[#33335c]/[0.05] border border-[#33335c]/10 rounded-xl p-2.5 text-center">
            <div className="text-lg mb-1">{s.icon}</div>
            <div className="text-base font-black text-[#33335c]">{s.waarde}</div>
            <div className="text-[9px] text-[#33335c]/50 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    navIcon: 'pets',
    navLabel: 'Dieren',
    navHref: '/admin/dieren',
    kleur: '#E2725B',
    icon: 'add_photo_alternate',
    titel: 'Voeg dieren toe',
    beschrijving: "Maak rijke profielen aan: foto's, gedragsprofiel en medisch paspoort. Hoe meer info, hoe beter de AI matcht.",
    preview: (
      <div className="bg-[#33335c]/[0.04] border border-[#33335c]/10 rounded-2xl p-3 w-full">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-xl bg-[#33335c]/10 flex items-center justify-center text-2xl">🐕</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-2 w-20 bg-[#33335c]/15 rounded-full" />
              <div className="h-2 w-8 bg-[#f8aa25]/60 rounded-full" />
            </div>
            <div className="h-1.5 w-24 bg-[#33335c]/10 rounded-full" />
          </div>
        </div>
        <div className="flex gap-1.5 mt-2.5">
          {['Speels', 'Rustig', 'Kindvriendelijk'].map((t) => (
            <span key={t} className="text-[9px] bg-[#33335c]/[0.06] border border-[#33335c]/10 rounded-lg px-1.5 py-0.5 text-[#33335c]/50">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    navIcon: 'favorite',
    navLabel: 'Adoptie',
    navHref: '/admin/adopties',
    kleur: '#E2725B',
    icon: 'inbox',
    titel: 'Beheer adoptieverzoeken',
    beschrijving: 'Bekijk inkomende aanvragen, keur goed of wijs af en plan kennismakingsgesprekken — op één plek.',
    preview: (
      <div className="space-y-2 w-full">
        {[
          { naam: 'Sophie V.', dier: 'Buddy', status: 'Aangevraagd', dot: 'bg-amber-400' },
          { naam: 'Thomas G.', dier: 'Luna', status: 'Goedgekeurd', dot: 'bg-blue-400' },
        ].map((r) => (
          <div key={r.naam} className="flex items-center gap-2.5 bg-[#33335c]/[0.04] border border-[#33335c]/10 rounded-xl px-3 py-2">
            <span className={`size-2 rounded-full flex-shrink-0 ${r.dot}`} />
            <span className="text-xs text-[#33335c]/65 flex-1">{r.naam} → <span className="text-[#33335c] font-semibold">{r.dier}</span></span>
            <span className="text-[9px] text-[#33335c]/40">{r.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    navIcon: 'chat',
    navLabel: 'Berichten',
    navHref: '/admin/berichten',
    kleur: '#E2725B',
    icon: 'chat_bubble',
    titel: 'Chat met adoptanten',
    beschrijving: 'Beantwoord vragen, plan afspraken en bouw een band op met potentiële adoptiegezinnen.',
    preview: (
      <div className="space-y-2 w-full">
        <div className="flex gap-2">
          <div className="size-6 rounded-full bg-[#f8aa25]/30 flex-shrink-0" />
          <div className="bg-[#33335c]/[0.07] rounded-2xl rounded-tl-none px-3 py-2 text-[10px] text-[#33335c]/65 max-w-[80%]">
            Hoi! Is Buddy nog beschikbaar? 🐕
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="bg-[#33335c]/10 border border-[#33335c]/15 rounded-2xl rounded-tr-none px-3 py-2 text-[10px] text-[#33335c]/65 max-w-[80%]">
            Ja! Kom gerust langs voor een kennismaking 😊
          </div>
          <div className="size-6 rounded-full bg-[#33335c]/20 flex-shrink-0" />
        </div>
      </div>
    ),
    cta: { label: 'Voeg je eerste dier toe →', href: '/admin/dieren/nieuw' },
  },
]

// ─── MINI SIDEBAR (voor asiel tour) ────────────────────────────────────────

const SIDEBAR_ITEMS = [
  { icon: 'grid_view', label: 'Dashboard' },
  { icon: 'pets', label: 'Dieren' },
  { icon: 'favorite', label: 'Adoptie' },
  { icon: 'chat', label: 'Berichten' },
]

function MiniSidebar({ actieveLabel }: { actieveLabel: string }) {
  return (
    <div className="w-28 bg-[#33335c]/[0.04] border-r border-[#33335c]/10 rounded-l-2xl flex flex-col py-3 gap-0.5 flex-shrink-0">
      {/* Mini logo */}
      <div className="flex items-center gap-1.5 px-3 pb-2 mb-1 border-b border-[#33335c]/10">
        <div className="size-5 rounded-md bg-[#33335c] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#f8aa25]" style={{ fontSize: '0.65rem', fontVariationSettings: "'FILL' 1" }}>pets</span>
        </div>
        <span className="text-[9px] font-bold text-[#33335c]/50">Portaal</span>
      </div>
      {SIDEBAR_ITEMS.map((item) => {
        const isActief = item.label === actieveLabel
        return (
          <div
            key={item.label}
            className={`flex items-center gap-2 mx-2 px-2 py-2 rounded-lg transition-all duration-300 ${
              isActief
                ? 'bg-[#33335c]/10 border border-[#33335c]/25'
                : 'opacity-30'
            }`}
          >
            {isActief && (
              <span
                className="size-1.5 rounded-full bg-[#f8aa25] flex-shrink-0"
                style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
              />
            )}
            <span
              className="material-symbols-outlined flex-shrink-0"
              style={{
                fontSize: '0.85rem',
                fontVariationSettings: "'FILL' 1",
                color: isActief ? '#33335c' : 'rgba(51,53,92,0.35)',
              }}
            >
              {item.icon}
            </span>
            <span className={`text-[9px] font-semibold leading-none ${isActief ? 'text-[#33335c]' : 'text-[#33335c]/30'}`}>
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── HOOFD COMPONENT ───────────────────────────────────────────────────────

export default function WelkomTour({ naam, rol }: WelkomTourProps) {
  const router = useRouter()
  const [zichtbaar, setZichtbaar] = useState(false)
  const [huidigeStap, setHuidigeStap] = useState(0)
  const [richting, setRichting] = useState<'links' | 'rechts'>('rechts')
  const [animerend, setAnimerend] = useState(false)
  const [verlatend, setVerlatend] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const isAsiel = rol === 'asiel' || rol === 'admin'
  const voornaam = naam.split(' ')[0]
  const adoptantStappen = getAdoptantStappen(voornaam)
  const stappen = isAsiel ? ASIEL_STAPPEN : adoptantStappen
  const isLaatste = huidigeStap === stappen.length - 1

  useEffect(() => {
    localStorage.removeItem(TOUR_KEY)
    const t = setTimeout(() => setZichtbaar(true), 700)
    return () => clearTimeout(t)
  }, [])

  const sluiten = useCallback((navigeerNaar?: string) => {
    setVerlatend(true)
    localStorage.setItem(TOUR_KEY, '1')
    setTimeout(() => {
      setZichtbaar(false)
      setVerlatend(false)
      if (navigeerNaar) router.push(navigeerNaar)
    }, 350)
  }, [router])

  const naarStap = useCallback((nieuweStap: number) => {
    if (animerend || nieuweStap === huidigeStap) return
    setRichting(nieuweStap > huidigeStap ? 'rechts' : 'links')
    setAnimerend(true)
    setTimeout(() => {
      setHuidigeStap(nieuweStap)
      setAnimerend(false)
    }, 200)
  }, [animerend, huidigeStap])

  const volgende = useCallback(() => {
    if (isLaatste) {
      const cta = isAsiel
        ? (ASIEL_STAPPEN[huidigeStap] as AsielStap).cta
        : (adoptantStappen[huidigeStap] as AdoptantStap).cta
      sluiten(cta?.href)
    } else {
      naarStap(huidigeStap + 1)
    }
  }, [isLaatste, isAsiel, huidigeStap, adoptantStappen, sluiten, naarStap])

  // Swipe support (adoptant)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && !isLaatste) naarStap(huidigeStap + 1)
      if (diff < 0 && huidigeStap > 0) naarStap(huidigeStap - 1)
    }
    touchStartX.current = null
  }

  if (!zichtbaar) return null

  return isAsiel
    ? <AsielTour
        stappen={ASIEL_STAPPEN}
        huidigeStap={huidigeStap}
        isLaatste={isLaatste}
        animerend={animerend}
        verlatend={verlatend}
        voornaam={voornaam}
        naarStap={naarStap}
        volgende={volgende}
        sluiten={sluiten}
      />
    : <AdoptantTour
        stappen={adoptantStappen}
        huidigeStap={huidigeStap}
        isLaatste={isLaatste}
        animerend={animerend}
        richting={richting}
        verlatend={verlatend}
        naarStap={naarStap}
        volgende={volgende}
        sluiten={sluiten}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
}

// ─── ADOPTANT TOUR ─────────────────────────────────────────────────────────

interface AdoptantTourProps {
  stappen: AdoptantStap[]
  huidigeStap: number
  isLaatste: boolean
  animerend: boolean
  richting: 'links' | 'rechts'
  verlatend: boolean
  naarStap: (i: number) => void
  volgende: () => void
  sluiten: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

function AdoptantTour({
  stappen, huidigeStap, isLaatste, animerend, richting, verlatend,
  naarStap, volgende, sluiten, onTouchStart, onTouchEnd,
}: AdoptantTourProps) {
  const stap = stappen[huidigeStap]

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center transition-all duration-350 ${verlatend ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(12,20,12,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => e.target === e.currentTarget && sluiten()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Decoratieve achtergrond bollen */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute size-64 rounded-full opacity-10 blur-3xl transition-all duration-700"
          style={{ background: stap.kleur, top: '10%', left: '20%' }}
        />
        <div
          className="absolute size-48 rounded-full opacity-8 blur-3xl transition-all duration-700"
          style={{ background: '#13ec13', bottom: '30%', right: '10%' }}
        />
      </div>

      <div
        className={`w-full max-w-sm mx-4 mb-6 transition-all duration-350 ${
          verlatend ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.3, 0.64, 1)' }}
      >
        {/* Swipe hint */}
        <p className="text-center text-white/20 text-[10px] mb-3 tracking-wide">
          {huidigeStap > 0 && '← '}veeg om te navigeren{!isLaatste && ' →'}
        </p>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-4 px-1">
          {stappen.map((_, i) => (
            <button
              key={i}
              onClick={() => naarStap(i)}
              className="flex-1 h-1 rounded-full overflow-hidden bg-white/10"
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: i < huidigeStap ? '100%' : i === huidigeStap ? '100%' : '0%',
                  background: i <= huidigeStap ? stap.kleur : 'transparent',
                  opacity: i < huidigeStap ? 0.4 : 1,
                }}
              />
            </button>
          ))}
        </div>

        {/* Kaart */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/8"
          style={{ background: '#0d1a0d' }}
        >
          {/* Illustratie / preview sectie */}
          <div
            className={`px-7 pt-8 pb-6 flex flex-col items-center text-center transition-all duration-200 ${
              animerend
                ? richting === 'rechts' ? '-translate-x-4 opacity-0' : 'translate-x-4 opacity-0'
                : 'translate-x-0 opacity-100'
            }`}
            style={{ background: stap.gradient }}
          >
            {/* Badge */}
            {stap.badge && (
              <div
                className="text-xs font-bold px-3 py-1 rounded-full mb-4 border"
                style={{ color: stap.kleur, borderColor: `${stap.kleur}30`, background: `${stap.kleur}10` }}
              >
                {stap.badge}
              </div>
            )}

            {/* Illustratie */}
            <div className="mb-4">{stap.illustratie}</div>

            {/* Tekst */}
            <h2 className="text-xl font-extrabold text-white leading-tight mb-2.5">{stap.titel}</h2>
            <p className="text-white/50 text-sm leading-relaxed">{stap.beschrijving}</p>

            {/* Preview */}
            {stap.preview && (
              <div className="mt-5 w-full">{stap.preview}</div>
            )}
          </div>

          {/* Actie sectie */}
          <div className="px-5 py-5 space-y-2.5 border-t border-white/6">
            <button
              onClick={volgende}
              className="w-full font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.97] shadow-lg"
              style={{
                background: stap.kleur,
                color: '#12122a',
                boxShadow: `0 8px 24px ${stap.kleur}35`,
              }}
            >
              {isLaatste && stap.cta ? stap.cta.label : isLaatste ? '🎉 Aan de slag!' : 'Volgende →'}
            </button>
            {!isLaatste && (
              <button
                onClick={() => sluiten()}
                className="w-full text-white/25 text-sm font-medium py-2 hover:text-white/45 transition-colors"
              >
                Tour overslaan
              </button>
            )}
          </div>
        </div>

        {/* Stap counter */}
        <p className="text-center text-white/15 text-[10px] mt-3">
          {huidigeStap + 1} / {stappen.length}
        </p>
      </div>
    </div>
  )
}

// ─── ASIEL TOUR ────────────────────────────────────────────────────────────

interface AsielTourProps {
  stappen: AsielStap[]
  huidigeStap: number
  isLaatste: boolean
  animerend: boolean
  verlatend: boolean
  voornaam: string
  naarStap: (i: number) => void
  volgende: () => void
  sluiten: (href?: string) => void
}

function AsielTour({
  stappen, huidigeStap, isLaatste, animerend, verlatend, voornaam,
  naarStap, volgende, sluiten,
}: AsielTourProps) {
  const stap = stappen[huidigeStap]
  const accentKleur = '#33335c'

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-350 ${verlatend ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'rgba(200,210,230,0.60)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => e.target === e.currentTarget && sluiten()}
    >
      <div
        className={`transition-all duration-400 ${
          verlatend ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.2, 0.64, 1)' }}
      >
        {/* Stap-labels boven de kaart */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {stappen.map((s, i) => (
            <button
              key={i}
              onClick={() => naarStap(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                i === huidigeStap
                  ? 'text-[#33335c] border border-[#33335c]/20'
                  : 'text-[#33335c]/35 hover:text-[#33335c]/60'
              }`}
              style={i === huidigeStap ? { background: `${accentKleur}12`, borderColor: `${accentKleur}35` } : {}}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '0.8rem', fontVariationSettings: "'FILL' 1", color: i === huidigeStap ? accentKleur : 'rgba(51,53,92,0.3)' }}
              >
                {s.navIcon}
              </span>
              {s.navLabel}
            </button>
          ))}
        </div>

        {/* Kaart met mini sidebar + content */}
        <div
          className="flex rounded-3xl overflow-hidden shadow-xl border border-black/[0.06]"
          style={{ background: '#ffffff', width: '680px', maxWidth: '95vw' }}
        >
          {/* Mini sidebar */}
          <MiniSidebar actieveLabel={stap.navLabel} />

          {/* Content */}
          <div
            className={`flex-1 p-7 transition-all duration-200 ${
              animerend ? '-translate-x-3 opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="size-11 rounded-2xl flex items-center justify-center border flex-shrink-0"
                  style={{ background: `${accentKleur}0d`, borderColor: `${accentKleur}25`, boxShadow: `0 0 20px ${accentKleur}10` }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1.3rem', color: accentKleur, fontVariationSettings: "'FILL' 1" }}
                  >
                    {stap.icon}
                  </span>
                </div>
                <div>
                  {huidigeStap === 0 && (
                    <p className="text-xs font-bold mb-0.5" style={{ color: '#f8aa25' }}>
                      Hoi {voornaam}!
                    </p>
                  )}
                  <h2 className="text-lg font-extrabold text-[#33335c] leading-tight">{stap.titel}</h2>
                </div>
              </div>
              <button
                onClick={() => sluiten()}
                className="text-[#33335c]/25 hover:text-[#33335c]/55 transition-colors ml-4 flex-shrink-0 mt-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-[#33335c]/60 text-sm leading-relaxed mb-5">{stap.beschrijving}</p>

            {/* Preview */}
            {stap.preview && (
              <div className="mb-5">{stap.preview}</div>
            )}

            {/* Actieknoppen */}
            <div className="flex items-center gap-3">
              {huidigeStap > 0 && (
                <button
                  onClick={() => naarStap(huidigeStap - 1)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#33335c]/40 border border-[#33335c]/10 hover:border-[#33335c]/20 hover:text-[#33335c]/60 transition-all"
                >
                  ← Terug
                </button>
              )}
              <button
                onClick={volgende}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg"
                style={{
                  background: accentKleur,
                  color: '#fff',
                  boxShadow: `0 4px 16px ${accentKleur}30`,
                }}
              >
                {isLaatste && stap.cta ? stap.cta.label : isLaatste ? '🎉 Aan de slag!' : `Volgende: ${stappen[huidigeStap + 1]?.navLabel} →`}
              </button>
            </div>

            {/* Stap indicator */}
            <div className="flex justify-center gap-1.5 mt-4">
              {stappen.map((_, i) => (
                <button
                  key={i}
                  onClick={() => naarStap(i)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === huidigeStap ? '20px' : '6px',
                    background: i <= huidigeStap ? accentKleur : 'rgba(51,53,92,0.12)',
                    opacity: i < huidigeStap ? 0.5 : 1,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-center text-[#33335c]/30 text-[10px] mt-4">
          Klik buiten de kaart om de tour te sluiten · Je kunt hem later terugvinden via Help
        </p>
      </div>
    </div>
  )
}
