'use client'

import { useEffect, useState } from 'react'

interface MatchBreakdownProps {
  score: number
  analyse: string | null
  diernaam: string
  scores: {
    woning: number | null
    energie: number | null
    gezin: number | null
    ervaring: number | null
    alleenThuis: number | null
    budget: number | null
  }
}

const FACTOREN = [
  { key: 'energie' as const, icon: 'bolt', label: 'Energie', hint: 'Activiteitsniveau match' },
  { key: 'gezin' as const, icon: 'family_restroom', label: 'Gezin', hint: 'Kinderen & huisgenoten' },
  { key: 'alleenThuis' as const, icon: 'schedule', label: 'Alleen thuis', hint: 'Jouw werktijden' },
  { key: 'woning' as const, icon: 'home', label: 'Woonruimte', hint: 'Tuin, ruimte, type woning' },
  { key: 'ervaring' as const, icon: 'school', label: 'Ervaring', hint: 'Jouw dierervaring' },
  { key: 'budget' as const, icon: 'account_balance_wallet', label: 'Budget', hint: 'Dierenarts & zorg' },
]

function scoreKleur(s: number): string {
  if (s >= 80) return '#f8aa25'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(s: number): string {
  if (s >= 88) return 'Perfecte fit'
  if (s >= 75) return 'Heel goed'
  if (s >= 60) return 'Goed'
  if (s >= 45) return 'Redelijk'
  return 'Aandachtspunt'
}

// SVG circulaire gauge — straal 15.9155 → omtrek 100
function CircleGauge({ score, animated }: { score: number; animated: boolean }) {
  const radius = 15.9155
  const circumference = 100
  const strokeDash = animated ? `${score}, ${circumference}` : `0, ${circumference}`
  const kleur = scoreKleur(score)

  const label =
    score >= 90 ? 'Uitstekend' : score >= 75 ? 'Hoog' : score >= 60 ? 'Goed' : 'Matig'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative size-28">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          {/* Track */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="2.5"
          />
          {/* Glow ring */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={kleur}
            strokeWidth="4"
            strokeDasharray={strokeDash}
            strokeLinecap="round"
            opacity="0.15"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
          {/* Voortgang */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={kleur}
            strokeWidth="2.5"
            strokeDasharray={strokeDash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 4px ${kleur})` }}
          />
        </svg>
        {/* Getal in het midden */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white leading-none">{score}</span>
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: kleur }}>{label}</p>
        <p className="text-[10px] text-white/30 mt-0.5">match voor jou</p>
      </div>
    </div>
  )
}

function ScoreBalk({
  icon,
  label,
  hint,
  score,
  animated,
}: {
  icon: string
  label: string
  hint: string
  score: number
  animated: boolean
}) {
  const kleur = scoreKleur(score)
  const breedte = animated ? `${score}%` : '0%'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="material-symbols-outlined text-sm flex-shrink-0"
            style={{ color: kleur, fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <span className="text-sm font-bold text-white truncate">{label}</span>
          <span className="text-[10px] text-white/25 truncate hidden sm:inline">{hint}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-[10px] font-semibold whitespace-nowrap" style={{ color: kleur }}>
            {scoreLabel(score)}
          </span>
          <span className="text-sm font-black text-white tabular-nums w-8 text-right">{score}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: breedte,
            background: `linear-gradient(90deg, ${kleur}99, ${kleur})`,
            boxShadow: animated ? `0 0 8px ${kleur}60` : 'none',
            transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.9s ease',
          }}
        />
      </div>
    </div>
  )
}

export default function MatchBreakdown({ score, analyse, diernaam, scores }: MatchBreakdownProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Korte delay zodat de mount zichtbaar is
    const t = setTimeout(() => setAnimated(true), 150)
    return () => clearTimeout(t)
  }, [])

  const beschikbareScores = FACTOREN.filter(({ key }) => scores[key] !== null)

  return (
    <section className="space-y-5">
      {/* Header */}
      <h2 className="text-xl font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
          analytics
        </span>
        Waarom {score}% match?
      </h2>

      {/* Gauge + motivatie */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 flex gap-5 items-center">
        <CircleGauge score={score} animated={animated} />
        <div className="flex-1 min-w-0">
          {analyse ? (
            <>
              <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold mb-2">
                AI motivatie
              </p>
              <p className="text-sm leading-relaxed text-white/70 italic">
                &ldquo;{analyse}&rdquo;
              </p>
            </>
          ) : (
            <p className="text-sm text-white/40">
              {diernaam} scoort {score}% op basis van jouw leefstijl.
            </p>
          )}
        </div>
      </div>

      {/* Score breakdown */}
      {beschikbareScores.length > 0 && (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
            Score per factor
          </p>

          {beschikbareScores.map(({ key, icon, label, hint }, i) => (
            <div
              key={key}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <ScoreBalk
                icon={icon}
                label={label}
                hint={hint}
                score={scores[key]!}
                animated={animated}
              />
            </div>
          ))}

          {/* Totaal */}
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-extrabold text-white">Totale match</span>
              <span className="font-black text-base" style={{ color: scoreKleur(score) }}>
                {score}%
              </span>
            </div>
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: animated ? `${score}%` : '0%',
                  background: 'linear-gradient(90deg, #f8aa2599, #f8aa25)',
                  boxShadow: animated ? '0 0 12px #f8aa2560' : 'none',
                  transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 1.2s ease',
                  transitionDelay: `${beschikbareScores.length * 80 + 50}ms`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
