'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function WachtwoordVergetenPage() {
  const [email, setEmail] = useState('')
  const [laden, setLaden] = useState(false)
  const [verstuurd, setVerstuurd] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLaden(true)
    try {
      await fetch('/api/auth/wachtwoord-vergeten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setVerstuurd(true)
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
              {verstuurd ? 'mark_email_read' : 'lock_reset'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">PootGelukkig</h1>
          <p className="text-white/40 mt-2 text-sm font-medium">AI-gestuurde dieren adoptie</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          {verstuurd ? (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-3">Check je inbox</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-7">
                Als <span className="text-white/80 font-semibold">{email}</span> bij ons bekend is,
                ontvang je binnen enkele minuten een e-mail met een link om je wachtwoord opnieuw
                in te stellen. De link is 60 minuten geldig.
              </p>
              <Link
                href="/auth/login"
                className="inline-block w-full bg-primary text-bg-dark font-bold py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 text-sm"
              >
                Terug naar inloggen
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">Wachtwoord vergeten?</h2>
              <p className="text-white/40 text-sm mb-7">
                Geen probleem. Vul je e-mailadres in en we sturen je een resetlink.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    placeholder="jij@email.nl"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={laden}
                  className="w-full bg-primary text-bg-dark font-bold py-4 rounded-2xl hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20 text-sm"
                >
                  {laden ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="size-4 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
                      Versturen...
                    </span>
                  ) : (
                    'Stuur resetlink'
                  )}
                </button>
              </form>

              <div className="mt-7 pt-6 border-t border-white/5 text-center">
                <Link
                  href="/auth/login"
                  className="text-white/40 text-sm hover:text-white/70 transition-colors"
                >
                  ← Terug naar inloggen
                </Link>
              </div>
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
