'use client'

import { useEffect, useRef, useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalmCard, CalmIcon, CalmPill, CalmProgressBar } from '@/components/admin/calm'

interface Bericht {
  id?: number
  afzender: 'gebruiker' | 'assistent'
  inhoud: string
}

interface Profiel {
  naam: string
  rechtsvorm: string | null
  werkveldCategorieen: string[]
  gemeenten: string[]
  teamgrootte: number | null
  vrijwilligersAantal: number | null
  grootsteKnelpunt: string | null
  toneOfVoice: string | null
}

const ROL_NAMEN: Record<string, string> = {
  fundraising: 'Sam (Fondsen & Subsidies)',
  rapportage: 'Mila (Impact & Verantwoording)',
  social: 'Conny (Communicatie & Storytelling)',
  vrijwilligers: 'Bram (Werving & Vrijwilligers)',
  chat: 'Samen (Webassistent)',
}

function voortgang(p: Profiel | null): number {
  if (!p) return 0
  const velden = [
    !!p.rechtsvorm,
    p.werkveldCategorieen.length > 0,
    p.gemeenten.length > 0,
    p.teamgrootte != null,
    p.vrijwilligersAantal != null,
    !!p.grootsteKnelpunt,
    !!p.toneOfVoice,
  ]
  return Math.round((velden.filter(Boolean).length / velden.length) * 100)
}

export default function OnboardingChat() {
  const router = useRouter()
  const [berichten, setBerichten] = useState<Bericht[]>([])
  const [profiel, setProfiel] = useState<Profiel | null>(null)
  const [status, setStatus] = useState<'laden' | 'klaar' | 'fout'>('laden')
  const [tekst, setTekst] = useState('')
  const [versturen, setVersturen] = useState(false)
  const [afgerond, setAfgerond] = useState(false)
  const [aanbevolenRollen, setAanbevolenRollen] = useState<string[]>([])
  const [foutmelding, setFoutmelding] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  async function laadState() {
    setStatus('laden')
    try {
      const res = await fetch('/api/admin/onboarding')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBerichten(data.berichten ?? [])
      setProfiel(data.profiel ?? null)
      setAfgerond(data.onboardingStatus === 'afgerond')
      setStatus('klaar')
    } catch {
      setStatus('fout')
    }
  }

  useEffect(() => {
    laadState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [berichten, versturen])

  async function verstuur(e: FormEvent) {
    e.preventDefault()
    const bericht = tekst.trim()
    if (!bericht || versturen) return
    setFoutmelding('')
    setTekst('')
    setBerichten((prev) => [...prev, { afzender: 'gebruiker', inhoud: bericht }])
    setVersturen(true)
    try {
      const res = await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bericht }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.fout ?? 'Er ging iets mis')
      setBerichten((prev) => [...prev, { afzender: 'assistent', inhoud: data.bericht }])
      setProfiel(data.profiel ?? null)
      if (data.afgerond) {
        setAfgerond(true)
        setAanbevolenRollen(data.aanbevolenRollen ?? [])
      }
    } catch (err) {
      setFoutmelding(err instanceof Error ? err.message : 'Er ging iets mis — je bericht is bewaard, probeer opnieuw te versturen.')
    } finally {
      setVersturen(false)
    }
  }

  async function slaOver() {
    if (!confirm('Onboarding overslaan? Je kunt dit later altijd afmaken via Instellingen.')) return
    try {
      await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actie: 'overslaan' }),
      })
    } finally {
      router.push('/admin')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-calm-surface font-inter">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-calm-outline-variant/40 bg-calm-surface/90 px-5 py-4 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-calm-tertiary text-sm font-extrabold text-white">N</span>
          <div className="leading-tight">
            <p className="font-jakarta text-sm font-extrabold text-calm-on-surface">Noor</p>
            <p className="font-inter text-[10px] font-bold uppercase tracking-widest text-calm-on-surface-variant/60">Intake &amp; inrichting</p>
          </div>
        </div>
        {!afgerond && (
          <button
            type="button"
            onClick={slaOver}
            className="font-inter text-xs font-bold text-calm-on-surface-variant/70 underline hover:text-calm-on-surface"
          >
            Later afmaken
          </button>
        )}
      </header>

      {profiel && !afgerond && (
        <div className="border-b border-calm-outline-variant/30 bg-calm-surface-lowest px-5 py-3 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="font-inter text-[11px] font-bold uppercase tracking-wide text-calm-on-surface-variant/70">Profiel wordt ingericht</p>
              <p className="font-inter text-[11px] font-bold text-calm-on-surface-variant/70">{voortgang(profiel)}%</p>
            </div>
            <CalmProgressBar percentage={voortgang(profiel)} />
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 sm:px-8">
        {status === 'laden' && (
          <div className="flex items-center gap-2 text-calm-on-surface-variant">
            <span className="inline-block size-4 animate-spin rounded-full border-2 border-calm-primary-container border-t-transparent" />
            Noor bereidt het gesprek voor…
          </div>
        )}

        {status === 'fout' && (
          <CalmCard className="p-5 text-center">
            <p className="font-inter text-sm text-calm-on-surface-variant">
              Het gesprek kon niet geladen worden.
            </p>
            <button
              type="button"
              onClick={laadState}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-calm-primary-container px-4 py-2 font-inter text-sm font-bold text-calm-on-primary"
            >
              Opnieuw proberen
            </button>
          </CalmCard>
        )}

        {status === 'klaar' && berichten.length === 0 && (
          <CalmCard className="p-5 text-center">
            <p className="font-inter text-sm text-calm-on-surface-variant">
              Noor kon het gesprek niet starten — waarschijnlijk een tijdelijke storing bij de AI-dienst.
            </p>
            <button
              type="button"
              onClick={laadState}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-calm-primary-container px-4 py-2 font-inter text-sm font-bold text-calm-on-primary"
            >
              Opnieuw proberen
            </button>
          </CalmCard>
        )}

        {status === 'klaar' && berichten.length > 0 && (
          <div className="space-y-4">
            {berichten.map((b, i) => (
              <div key={b.id ?? i} className={b.afzender === 'gebruiker' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    b.afzender === 'gebruiker'
                      ? 'max-w-[85%] rounded-3xl rounded-br-md bg-calm-primary-container px-4 py-3 font-inter text-sm text-calm-on-primary'
                      : 'max-w-[85%] rounded-3xl rounded-bl-md bg-calm-surface-lowest px-4 py-3 font-inter text-sm text-calm-on-surface shadow-[0_1px_2px_rgba(19,27,46,0.04)]'
                  }
                >
                  {b.inhoud}
                </div>
              </div>
            ))}

            {versturen && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-3xl rounded-bl-md bg-calm-surface-lowest px-4 py-3 shadow-[0_1px_2px_rgba(19,27,46,0.04)]">
                  <span className="flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-calm-on-surface-variant/50 [animation-delay:-0.3s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-calm-on-surface-variant/50 [animation-delay:-0.15s]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-calm-on-surface-variant/50" />
                  </span>
                </div>
              </div>
            )}

            {afgerond && (
              <CalmCard className="p-5">
                <CalmPill tone="success" icon="check_circle">Profiel afgerond</CalmPill>
                <p className="mt-3 font-jakarta text-base font-bold text-calm-on-surface">
                  ImpactOS is ingericht op basis van dit gesprek.
                </p>
                {aanbevolenRollen.length > 0 && (
                  <p className="mt-1.5 font-inter text-sm text-calm-on-surface-variant">
                    Geactiveerd: {aanbevolenRollen.map((r) => ROL_NAMEN[r] ?? r).join(' · ')}
                  </p>
                )}
                <Link
                  href="/admin"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-calm-primary-container px-5 py-2.5 font-inter text-sm font-bold text-calm-on-primary"
                >
                  Naar het dashboard
                  <CalmIcon name="arrow_forward" className="text-[1.1rem]" />
                </Link>
              </CalmCard>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {status === 'klaar' && !afgerond && berichten.length > 0 && (
        <form onSubmit={verstuur} className="sticky bottom-0 border-t border-calm-outline-variant/40 bg-calm-surface/95 px-5 py-4 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  verstuur(e)
                }
              }}
              placeholder="Typ je antwoord…"
              rows={1}
              disabled={versturen}
              className="max-h-32 min-h-[3rem] flex-1 resize-none rounded-2xl border border-calm-outline-variant/50 bg-calm-surface-lowest px-4 py-3 font-inter text-sm text-calm-on-surface placeholder:text-calm-on-surface-variant/50 focus:border-calm-primary-container focus:outline-none focus:ring-2 focus:ring-calm-primary-container/20"
            />
            <button
              type="submit"
              disabled={versturen || !tekst.trim()}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-calm-primary-container text-calm-on-primary transition-opacity disabled:opacity-40"
              aria-label="Versturen"
            >
              <CalmIcon name="arrow_upward" />
            </button>
          </div>
          {foutmelding && (
            <p className="mx-auto mt-2 max-w-2xl font-inter text-xs font-semibold text-red-600">{foutmelding}</p>
          )}
        </form>
      )}
    </div>
  )
}
