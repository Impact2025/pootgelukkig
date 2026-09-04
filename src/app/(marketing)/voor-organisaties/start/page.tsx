'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Section, Eyebrow, ButtonLink } from '@/components/marketing/ui'

export default function VoorOrganisatiesStartPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'form' | 'verzenden' | 'gelukt' | 'fout'>('form')
  const [foutMelding, setFoutMelding] = useState('')
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [telefoon, setTelefoon] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')

  async function verstuur(e: FormEvent) {
    e.preventDefault()
    if (!naam.trim() || !email.trim() || wachtwoord.length < 8) return
    setStatus('verzenden')
    setFoutMelding('')
    try {
      const res = await fetch('/api/asielen/aanmelden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: naam.trim(),
          email: email.trim(),
          telefoon: telefoon.trim() || null,
          wachtwoord,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Onbekende fout')
      }

      // Meteen inloggen en doorsturen naar het onboarding-gesprek — geen wachten op e-mail.
      const result = await signIn('credentials', { email: email.trim(), password: wachtwoord, redirect: false })
      if (result?.error) {
        // Account is aangemaakt maar automatisch inloggen lukte niet — val terug op de loginpagina.
        setStatus('gelukt')
        return
      }
      router.push('/admin/onboarding')
      router.refresh()
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
          <Eyebrow>Voor organisaties — gratis aanmelden</Eyebrow>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1E293B] sm:text-5xl">
            Draai de bureaucratie om.{' '}
            <span className="text-[#2563EB]">Geef ons 2 minuten.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-[#1E293B]/65">
            ImpactOS helpt organisaties in het sociaal domein met AI-collega&apos;s, minder dubbele
            invoer en snellere rapportages. Vul je gegevens in en krijg direct toegang — geen
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
              { icon: '📉', titel: 'Minder telefoontjes', tekst: 'De "Samen"-webassistent beantwoordt veelgestelde vragen van cliënten 24/7 direct op je website.' },
              { icon: '⚡', titel: 'Sneller rapporteren', tekst: 'Dossiers en veldlogs staan doorlopend op één plek, klaar voor Mila om een Wmo- of SROI-rapportage voor te bereiden.' },
              { icon: '🤝', titel: 'Gratis starten', tekst: 'Meld je organisatie gratis aan en verken het platform. Kies daarna het pakket dat bij je past.' },
            ].map((v) => (
              <div key={v.titel} className="flex gap-4">
                <span className="mt-0.5 text-2xl">{v.icon}</span>
                <div>
                  <h3 className="font-bold text-[#1E293B]">{v.titel}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#1E293B]/60">{v.tekst}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Rechts: Form */}
          <div>
            {status === 'gelukt' ? (
              <div className="rounded-3xl border border-emerald-300/40 bg-emerald-50 p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-emerald-500">check_circle</span>
                <h2 className="mt-4 text-2xl font-extrabold text-[#1E293B]">Account aangemaakt!</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-[#1E293B]/65">
                  Je organisatie staat geregistreerd. Log in met je e-mailadres en wachtwoord om
                  het onboarding-gesprek te starten.
                </p>
                <ButtonLink href="/auth/login" className="mt-6">
                  Naar inloggen
                </ButtonLink>
              </div>
            ) : (
              <form onSubmit={verstuur} className="rounded-3xl border border-[#1E293B]/8 bg-white p-8 shadow-[0_1px_3px_rgba(30,41,59,0.04)]">
                <h2 className="text-xl font-extrabold text-[#1E293B]">Meld je organisatie aan</h2>
                <p className="mt-2 text-sm text-[#1E293B]/50">
                  Start gratis en verken het platform. Bekijk de{' '}
                  <Link href="/tarieven" className="underline hover:text-[#1E293B]">tarieven</Link> voor de complete pakketten.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="naam" className="block text-sm font-bold text-[#1E293B] mb-1.5">
                      Naam organisatie <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="naam"
                      type="text"
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      placeholder="bijv. Stichting Welzijn & Toekomst"
                      required
                      className="block w-full rounded-xl border border-[#1E293B]/15 bg-white px-4 py-3 text-sm text-[#1E293B] placeholder:text-[#1E293B]/30 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-[#1E293B] mb-1.5">
                      E-mailadres <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jullie@organisatie.nl"
                      required
                      className="block w-full rounded-xl border border-[#1E293B]/15 bg-white px-4 py-3 text-sm text-[#1E293B] placeholder:text-[#1E293B]/30 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefoon" className="block text-sm font-bold text-[#1E293B] mb-1.5">
                      Telefoonnummer
                    </label>
                    <input
                      id="telefoon"
                      type="tel"
                      value={telefoon}
                      onChange={(e) => setTelefoon(e.target.value)}
                      placeholder="optioneel — als we snel iets willen vragen"
                      className="block w-full rounded-xl border border-[#1E293B]/15 bg-white px-4 py-3 text-sm text-[#1E293B] placeholder:text-[#1E293B]/30 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="wachtwoord" className="block text-sm font-bold text-[#1E293B] mb-1.5">
                      Wachtwoord <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="wachtwoord"
                      type="password"
                      value={wachtwoord}
                      onChange={(e) => setWachtwoord(e.target.value)}
                      placeholder="minimaal 8 tekens"
                      minLength={8}
                      required
                      autoComplete="new-password"
                      className="block w-full rounded-xl border border-[#1E293B]/15 bg-white px-4 py-3 text-sm text-[#1E293B] placeholder:text-[#1E293B]/30 focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-colors"
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
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
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

                <p className="mt-4 text-xs leading-relaxed text-[#1E293B]/35">
                  We gebruiken je gegevens alleen om contact op te nemen over ImpactOS.
                  Je kunt je op elk moment afmelden. Lees onze{' '}
                  <Link href="/privacy" className="underline hover:text-[#1E293B]/60">privacyverklaring</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </Section>

      {/* Stappen */}
      <div className="bg-white">
        <Section>
          <h2 className="text-center text-3xl font-extrabold leading-tight tracking-tight text-[#1E293B] sm:text-4xl">
            Hoe het werkt in 3 stappen
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { stap: '1', titel: 'Meld je aan', tekst: 'Vul het formulier in — duurt 30 seconden. Je krijgt direct toegang.' },
              { stap: '2', titel: 'Richt dossiers in', tekst: 'Zet je eerste dossiers en cliënten op. Het platform is in 5 minuten gevuld.' },
              { stap: '3', titel: 'Activeer je AI-team', tekst: 'Zet Sam, Mila, Conny, Bram en Samen aan. Jij keurt elk concept goed.' },
            ].map((s) => (
              <div key={s.stap} className="rounded-3xl border border-[#1E293B]/8 bg-[#F8FAFC] p-7">
                <span className="text-sm font-extrabold text-[#2563EB]">Stap {s.stap}</span>
                <h3 className="mt-2 text-lg font-bold text-[#1E293B]">{s.titel}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#1E293B]/65">{s.tekst}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <Section>
        <div className="overflow-hidden rounded-[2rem] bg-[#1E293B] px-8 py-14 text-center sm:px-16">
          <h2 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Nog even twijfelen? We bellen of mailen je graag.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
            Geen opgenomen demo nodig — je praat met het team dat het bouwt. Stel je vragen en
            zie in een kort gesprek of ImpactOS past bij jullie organisatie.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#1D4ED8] active:scale-[0.97]"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              Neem contact op
            </Link>
            <Link
              href="/voor-organisaties"
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
