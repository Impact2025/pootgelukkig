'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [wachtwoord, setWachtwoord] = useState('')
  const [herhaal, setHerhaal] = useState('')
  const [fout, setFout] = useState<string | null>(null)
  const [laden, setLaden] = useState(false)
  const [klaar, setKlaar] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)

    if (wachtwoord.length < 8) {
      setFout('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }
    if (wachtwoord !== herhaal) {
      setFout('De wachtwoorden komen niet overeen')
      return
    }

    setLaden(true)
    try {
      const res = await fetch('/api/auth/wachtwoord-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, wachtwoord }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.error ?? 'Er ging iets mis')
      } else {
        setKlaar(true)
        setTimeout(() => router.push('/auth/login'), 2500)
      }
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(226,114,91,0.05)' }}
        />
      </div>

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 border border-primary/20 mb-5 shadow-2xl shadow-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '2.75rem', fontVariationSettings: "'FILL' 1" }}
            >
              {klaar ? 'check_circle' : 'password'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">PootGelukkig</h1>
          <p className="text-white/40 mt-2 text-sm font-medium">AI-gestuurde dieren adoptie</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          {klaar ? (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-3">Gelukt!</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Je wachtwoord is gewijzigd. Je wordt doorgestuurd naar de inlogpagina...
              </p>
            </div>
          ) : !token ? (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-3">Ongeldige link</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-7">
                Deze resetlink is onvolledig. Vraag een nieuwe link aan.
              </p>
              <Link
                href="/auth/wachtwoord-vergeten"
                className="inline-block w-full bg-primary text-bg-dark font-bold py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-sm"
              >
                Nieuwe link aanvragen
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Nieuw wachtwoord</h2>
              <p className="text-white/40 text-sm mb-7">Kies een nieuw, veilig wachtwoord.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                    Nieuw wachtwoord
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
                  disabled={laden}
                  className="w-full bg-primary text-bg-dark font-bold py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20 text-sm"
                >
                  {laden ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                      Opslaan...
                    </span>
                  ) : (
                    'Wachtwoord opslaan'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/15 text-xs mt-8">
          Bedacht door Maya van Munster · WeAreImpact
        </p>
      </div>
    </div>
  )
}

export default function WachtwoordResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  )
}
