'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Section, Eyebrow, ButtonLink } from '@/components/marketing/ui'

export default function VoorAsielenStartPage() {
  const [status, setStatus] = useState<'form' | 'verzenden' | 'gelukt' | 'fout'>('form')
  const [foutMelding, setFoutMelding] = useState('')
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [telefoon, setTelefoon] = useState('')

  async function verstuur(e: FormEvent) {
    e.preventDefault()
    if (!naam.trim() || !email.trim()) return
    setStatus('verzenden')
    setFoutMelding('')
    try {
      const res = await fetch('/api/asielen/aanmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ naam: naam.trim(), email: email.trim(), telefoon: telefoon.trim() || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Onbekende fout')
      }
      setStatus('gelukt')
    } catch (err) {
      setStatus('form')
      setFoutMelding(err instanceof Error ? err.message : 'Er ging iets mis')
    }
  }

  return (
    <>
      {/* Hero */}
      <Section className="!pb-8">
        <div className="max-w-2xl">
          <Eyebrow>Voor asielen — gratis aanmelden</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
            Draai het adoptieproces om.{' '}
            <span className="text-[#ee5b2b]">Geef ons 2 minuten.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
            PootGelukkig helpt asielen met AI-matching, minder telefoontjes, en snellere,
            blijvender adopties. Vul je gegevens in en krijg direct toegang — geen
            verplichtingen, geen terugbelverzoeken.
          </p>
        </div>
      </Section>

      {/* Formulier */}
      <Section className="!pt-0">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Links: Voordelen */}
          <div className="space-y-6">
            {[
              { icon: '🎯', titel: 'Minder telefoontjes', tekst: 'Adoptanten vullen zelf de intake in. Jullie krijgen alleen een melding bij een sterke match.' },
              { icon: '⚡', titel: 'Sneller beslissen', tekst: 'Per aanvraag zie je een match-score met uitleg — geen giswerk meer.' },
              { icon: '💚', titel: 'Altijd gratis voor asielen', tekst: 'PootGelukkig is een stichtingsinitiatief. Geen verborgen kosten.' },
            ].map((v) => (
              <div key={v.titel} className="flex gap-4">
                <span className="mt-0.5 text-2xl">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-[#33335c]">{v.titel}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#33335c]/60">{v.tekst}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rechts: Form */}
          <div>
            {status === 'gelukt' ? (
              <div className="rounded-3xl border border-[#8bc34a]/30 bg-[#f1f8e9] p-8 text-center">
                <span className="text-5xl">🎉</span>
                <h2 className="mt-4 text-2xl font-extrabold text-[#33335c]">Aanmelding ontvangen!</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#33335c]/65">
                  We hebben je gegevens ontvangen. Binnen 24 uur krijg je een e-mail met
                  inloggegevens en een korte rondleiding door het dashboard.
                </p>
                <ButtonLink href="/voor-asielen" variant="ghost" className="mt-6">
                  Terug naar de informatiepagina
                </ButtonLink>
              </div>
            ) : (
              <form onSubmit={verstuur} className="rounded-3xl border border-[#33335c]/8 bg-white p-8 shadow-[0_1px_3px_rgba(51,51,92,0.04)]">
                <h2 className="text-xl font-extrabold text-[#33335c]">Meld je asiel aan</h2>
                <p className="mt-2 text-sm text-[#33335c]/50">
                  Geen pinpas, geen proefperiode. Gewoon toegang.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="naam" className="block text-sm font-bold text-[#33335c] mb-1.5">
                      Naam asiel <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="naam"
                      type="text"
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      placeholder="bijv. Dierenasiel Amsterdam"
                      required
                      className="block w-full rounded-xl border border-[#33335c]/15 bg-white px-4 py-3 text-sm text-[#33335c] placeholder:text-[#33335c]/30 focus:border-[#f8aa25] focus:outline-none focus:ring-2 focus:ring-[#f8aa25]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#33335c] mb-1.5">
                      E-mailadres <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jullie@asiel.nl"
                      required
                      className="block w-full rounded-xl border border-[#33335c]/15 bg-white px-4 py-3 text-sm text-[#33335c] placeholder:text-[#33335c]/30 focus:border-[#f8aa25] focus:outline-none focus:ring-2 focus:ring-[#f8aa25]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefoon" className="block text-sm font-bold text-[#33335c] mb-1.5">
                      Telefoonnummer
                    </label>
                    <input
                      id="telefoon"
                      type="tel"
                      value={telefoon}
                      onChange={(e) => setTelefoon(e.target.value)}
                      placeholder="optioneel — als we snel iets willen vragen"
                      className="block w-full rounded-xl border border-[#33335c]/15 bg-white px-4 py-3 text-sm text-[#33335c] placeholder:text-[#33335c]/30 focus:border-[#f8aa25] focus:outline-none focus:ring-2 focus:ring-[#f8aa25]/20 transition-colors"
                    />
                  </div>
                </div>

                {foutMelding && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {foutMelding}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'verzenden'}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ee5b2b] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#d94e22] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === 'verzenden' ? (
                    <>
                      <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Bezig met aanmelden…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                      Gratis aanmelden
                    </>
                  )}
                </button>

                <p className="mt-4 text-xs leading-relaxed text-[#33335c]/35">
                  We gebruiken je gegevens alleen om contact op te nemen over PootGelukkig.
                  Je kunt je op elk moment afmelden. Lees onze{' '}
                  <Link href="/privacy" className="underline hover:text-[#33335c]/60">privacyverklaring</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </Section>

      {/* Stappen */}
      <div className="bg-white">
        <Section>
          <h2 className="text-center text-3xl font-extrabold leading-tight tracking-tight text-[#33335c] sm:text-4xl">
            Hoe het werkt in 3 stappen
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { stap: '1', titel: 'Meld je aan', tekst: 'Vul het formulier in — duurt 30 seconden. Je krijgt direct toegang.' },
              { stap: '2', titel: 'Voeg dieren toe', tekst: 'Importeer of voeg handmatig dieren toe. Het dashboard is in 5 minuten gevuld.' },
              { stap: '3', titel: 'Ontvang matches', tekst: 'Adoptanten matchen op leefstijl. Jij krijgt alleen de beste kandidaten.' },
            ].map((s) => (
              <div key={s.stap} className="rounded-3xl border border-[#33335c]/8 bg-[#f9fafb] p-7">
                <span className="text-sm font-extrabold text-[#e39207]">Stap {s.stap}</span>
                <h3 className="mt-2 text-lg font-bold text-[#33335c]">{s.titel}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">{s.tekst}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <Section>
        <div className="overflow-hidden rounded-[2rem] bg-[#33335c] px-8 py-14 text-center sm:px-16">
          <h2 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Twijfel je nog? Bekijk de demo van 2 minuten
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
            Zie hoe het dashboard eruit ziet voor een asiel — zonder dat je eerst hoeft aan te melden.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://youtube.com/watch?v=DEMO_VIDEO_PLACEHOLDER"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ee5b2b] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#d94e22] active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Bekijk demo (2 min)
            </a>
            <Link
              href="/voor-asielen"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:border-white/40 active:scale-[0.97]"
            >
              Meer informatie
            </Link>
          </div>
        </div>
      </Section>
    </>
  )
}
