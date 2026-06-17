'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [fout, setFout] = useState<string | null>(null)
  const [laden, setLaden] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)
    setLaden(true)
    try {
      const result = await signIn('credentials', {
        email,
        password: wachtwoord,
        redirect: false,
      })
      if (result?.error) {
        setFout('Ongeldig e-mailadres of wachtwoord')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } finally {
      setLaden(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Achtergrond blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'rgba(226,114,91,0.05)' }}
        />
      </div>

      <div className="w-full max-w-sm z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 border border-primary/20 mb-5 shadow-2xl shadow-primary/10">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '2.75rem', fontVariationSettings: "'FILL' 1" }}
            >
              pets
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">PootGelukkig</h1>
          <p className="text-white/40 mt-2 text-sm font-medium">AI-gestuurde dieren adoptie</p>
        </div>

        {/* Formulier kaart */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-7">Welkom terug</h2>

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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider">
                  Wachtwoord
                </label>
                <Link
                  href="/auth/wachtwoord-vergeten"
                  className="text-primary/70 text-xs font-semibold hover:text-primary transition-colors"
                >
                  Wachtwoord vergeten?
                </Link>
              </div>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
                  Inloggen...
                </span>
              ) : (
                'Inloggen'
              )}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">
              Nog geen account?{' '}
              <Link
                href="/auth/register"
                className="text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Gratis aanmelden
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs mt-8">
          Bedacht door Maya van Munster · WeAreImpact
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
