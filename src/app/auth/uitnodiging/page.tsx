'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UitnodigingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [status, setStatus] = useState<'laden' | 'ongeldig' | 'geldig' | 'klaar'>('laden')
  const [organisatieNaam, setOrganisatieNaam] = useState('')
  const [email, setEmail] = useState('')
  const [naam, setNaam] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [herhaal, setHerhaal] = useState('')
  const [fout, setFout] = useState<string | null>(null)
  const [bezig, setBezig] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('ongeldig')
      return
    }
    fetch(`/api/auth/uitnodiging?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setFout(data.error ?? 'Ongeldige uitnodiging')
          setStatus('ongeldig')
          return
        }
        setOrganisatieNaam(data.organisatieNaam)
        setEmail(data.email)
        setStatus('geldig')
      })
      .catch(() => setStatus('ongeldig'))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)

    if (naam.trim().length < 2) {
      setFout('Vul je naam in')
      return
    }
    if (wachtwoord.length < 8) {
      setFout('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }
    if (wachtwoord !== herhaal) {
      setFout('De wachtwoorden komen niet overeen')
      return
    }

    setBezig(true)
    try {
      const res = await fetch('/api/auth/uitnodiging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, naam: naam.trim(), wachtwoord }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.error ?? 'Er ging iets mis')
      } else {
        setStatus('klaar')
        setTimeout(() => router.push('/auth/login'), 2500)
      }
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 border border-primary/20 mb-5 shadow-2xl shadow-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '2.75rem', fontVariationSettings: "'FILL' 1" }}
            >
              {status === 'klaar' ? 'check_circle' : 'group_add'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">ImpactOS</h1>
          <p className="text-white/40 mt-2 text-sm font-medium">AI-gestuurd platform voor het sociaal domein</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          {status === 'laden' && (
            <p className="text-center text-white/40 text-sm py-4">Uitnodiging controleren…</p>
          )}

          {status === 'ongeldig' && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-3">Ongeldige uitnodiging</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-7">
                {fout ?? 'Deze link is onvolledig, al gebruikt of verlopen.'} Vraag degene die je heeft
                uitgenodigd om een nieuwe link te sturen.
              </p>
              <Link
                href="/auth/login"
                className="inline-block w-full bg-primary text-bg-dark font-bold py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-sm"
              >
                Naar inloggen
              </Link>
            </div>
          )}

          {status === 'klaar' && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-3">Welkom bij {organisatieNaam}!</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Je account is aangemaakt. Je wordt doorgestuurd naar de inlogpagina...
              </p>
            </div>
          )}

          {status === 'geldig' && (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Account aanmaken</h2>
              <p className="text-white/40 text-sm mb-7">
                Je sluit je aan bij <span className="text-white/70 font-semibold">{organisatieNaam}</span> op ImpactOS
                als <span className="text-white/70 font-semibold">{email}</span>.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                    Jouw naam
                  </label>
                  <input
                    type="text"
                    value={naam}
                    onChange={(e) => setNaam(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="Voor- en achternaam"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                    Wachtwoord
                  </label>
                  <input
                    type="password"
                    value={wachtwoord}
                    onChange={(e) => setWachtwoord(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="Minimaal 8 tekens"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                    Herhaal wachtwoord
                  </label>
                  <input
                    type="password"
                    value={herhaal}
                    onChange={(e) => setHerhaal(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {fout && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-red-400 text-base">error_outline</span>
                    <p className="text-red-400 text-sm">{fout}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={bezig}
                  className="w-full bg-primary text-bg-dark font-bold py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20 text-sm"
                >
                  {bezig ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                      Bezig…
                    </span>
                  ) : (
                    'Account aanmaken'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/15 text-xs mt-8">
          Een initiatief van WeAreImpact
        </p>
      </div>
    </div>
  )
}

export default function UitnodigingPage() {
  return (
    <Suspense>
      <UitnodigingForm />
    </Suspense>
  )
}
