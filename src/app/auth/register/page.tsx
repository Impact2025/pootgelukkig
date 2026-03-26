'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Rol = 'adoptant' | 'asiel'

interface RolKaartProps {
  rol: Rol
  geselecteerd: boolean
  onClick: () => void
}

function RolKaart({ rol, geselecteerd, onClick }: RolKaartProps) {
  const isAdoptant = rol === 'adoptant'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 rounded-3xl p-5 text-left transition-all duration-200 border-2 ${
        geselecteerd
          ? isAdoptant
            ? 'border-primary bg-primary/10'
            : 'border-[#E2725B] bg-[#E2725B]/10'
          : 'border-white/[0.08] bg-white/[0.04] hover:border-white/20'
      }`}
    >
      {geselecteerd && (
        <div
          className={`absolute top-3 right-3 size-5 rounded-full flex items-center justify-center ${
            isAdoptant ? 'bg-primary' : 'bg-[#E2725B]'
          }`}
        >
          <span className="material-symbols-outlined text-[#33335c] text-sm font-black">check</span>
        </div>
      )}

      <div
        className={`size-12 rounded-2xl flex items-center justify-center mb-4 ${
          geselecteerd
            ? isAdoptant
              ? 'bg-primary/20'
              : 'bg-[#E2725B]/20'
            : 'bg-white/[0.08]'
        }`}
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{
            color: geselecteerd ? (isAdoptant ? '#f8aa25' : '#E2725B') : 'rgba(255,255,255,0.4)',
            fontVariationSettings: "'FILL' 1",
          }}
        >
          {isAdoptant ? 'pets' : 'domain'}
        </span>
      </div>

      <p
        className={`font-extrabold text-sm mb-1 ${
          geselecteerd
            ? isAdoptant
              ? 'text-primary'
              : 'text-[#E2725B]'
            : 'text-white'
        }`}
      >
        {isAdoptant ? 'Adoptant' : 'Organisatie'}
      </p>
      <p className="text-white/40 text-xs leading-snug">
        {isAdoptant ? 'Ik zoek een dier voor adoptie' : 'Wij zijn een asiel of stichting'}
      </p>
    </button>
  )
}

const inputKlasse = 'w-full bg-white/[0.06] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all'

export default function RegisterPage() {
  const [stap, setStap] = useState<'rol' | 'formulier'>('rol')
  const [geselecteerdeRol, setGeselecteerdeRol] = useState<Rol>('adoptant')

  // Account velden
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')

  // Locatie velden (adoptant + asiel)
  const [postcode, setPostcode] = useState('')
  const [stad, setStad] = useState('')
  const [postcodeStatus, setPostcodeStatus] = useState<'idle' | 'laden' | 'gevonden' | 'fout'>('idle')

  // Asiel-specifieke velden
  const [asielNaam, setAsielNaam] = useState('')

  const [fout, setFout] = useState<string | null>(null)
  const [laden, setLaden] = useState(false)
  const router = useRouter()

  const geformatteerdePostcode = postcode.replace(/\s/g, '').toUpperCase()
  const postcodeGeldig = /^\d{4}[A-Z]{2}$/.test(geformatteerdePostcode)

  async function zoekPostcode() {
    if (!postcodeGeldig) return
    setPostcodeStatus('laden')
    try {
      const res = await fetch(`/api/postcode?postcode=${geformatteerdePostcode}`)
      const data = await res.json()
      if (!res.ok || data.error) {
        setPostcodeStatus('fout')
        return
      }
      setStad(data.stad)
      setPostcodeStatus('gevonden')
    } catch {
      setPostcodeStatus('fout')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFout(null)
    setLaden(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam,
          email,
          wachtwoord,
          rol: geselecteerdeRol,
          postcode: geformatteerdePostcode || undefined,
          asielNaam: geselecteerdeRol === 'asiel' ? asielNaam : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setFout(data.error ?? 'Er is iets misgegaan')
        return
      }

      const result = await signIn('credentials', {
        email,
        password: wachtwoord,
        redirect: false,
      })

      if (result?.error) {
        router.push('/auth/login')
      } else {
        router.push(geselecteerdeRol === 'asiel' ? '/admin' : '/intake')
        router.refresh()
      }
    } finally {
      setLaden(false)
    }
  }

  const isAsiel = geselecteerdeRol === 'asiel'
  const accentKleur = isAsiel ? '#E2725B' : '#f8aa25'

  return (
    <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      {/* Achtergrond blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
          style={{ background: `${accentKleur}08` }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
          style={{ background: `${accentKleur}05` }}
        />
      </div>

      <div className="w-full max-w-sm z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center size-20 rounded-3xl border mb-5 shadow-2xl transition-all duration-500"
            style={{
              background: `${accentKleur}1a`,
              borderColor: `${accentKleur}30`,
              boxShadow: `0 20px 40px ${accentKleur}15`,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: '2.75rem',
                color: accentKleur,
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {isAsiel ? 'domain' : 'pets'}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">PootGelukkig</h1>
          <p className="text-white/40 mt-2 text-sm font-medium">
            {isAsiel ? 'Asiel & Organisatie portaal' : 'Vind jouw perfecte match'}
          </p>
        </div>

        {/* Stap: Rol selectie */}
        {stap === 'rol' && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-white mb-2">Wie ben jij?</h2>
            <p className="text-white/35 text-sm mb-6">Kies hoe je PootGelukkig wilt gebruiken</p>

            <div className="flex gap-3 mb-6">
              <RolKaart
                rol="adoptant"
                geselecteerd={geselecteerdeRol === 'adoptant'}
                onClick={() => setGeselecteerdeRol('adoptant')}
              />
              <RolKaart
                rol="asiel"
                geselecteerd={geselecteerdeRol === 'asiel'}
                onClick={() => setGeselecteerdeRol('asiel')}
              />
            </div>

            <div className="space-y-2.5 mb-6">
              {(geselecteerdeRol === 'adoptant'
                ? [
                    { icon: 'quiz', tekst: 'Intake in 2 minuten' },
                    { icon: 'auto_awesome', tekst: 'AI berekent jouw matches' },
                    { icon: 'favorite', tekst: 'Contact met asielen' },
                  ]
                : [
                    { icon: 'add_photo_alternate', tekst: 'Dierenprofielen aanmaken' },
                    { icon: 'inbox', tekst: 'Adoptie-aanvragen beheren' },
                    { icon: 'insights', tekst: 'Statistieken & overzicht' },
                  ]
              ).map(({ icon, tekst }) => (
                <div key={tekst} className="flex items-center gap-3">
                  <div
                    className="size-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accentKleur}18` }}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color: accentKleur, fontVariationSettings: "'FILL' 1" }}
                    >
                      {icon}
                    </span>
                  </div>
                  <span className="text-white/60 text-sm">{tekst}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStap('formulier')}
              className="w-full font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg"
              style={{
                background: accentKleur,
                color: isAsiel ? '#fff' : '#33335c',
                boxShadow: `0 8px 20px ${accentKleur}30`,
              }}
            >
              Doorgaan als {geselecteerdeRol === 'adoptant' ? 'adoptant' : 'organisatie'} →
            </button>

            <div className="mt-5 pt-5 border-t border-white/5 text-center">
              <p className="text-white/30 text-sm">
                Al een account?{' '}
                <Link href="/auth/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: accentKleur }}>
                  Inloggen
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Stap: Registratieformulier */}
        {stap === 'formulier' && (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-7">
              <button
                type="button"
                onClick={() => setStap('rol')}
                className="size-8 rounded-xl bg-white/[0.06] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-white/50 text-sm">arrow_back</span>
              </button>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Account aanmaken</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="size-1.5 rounded-full inline-block" style={{ background: accentKleur }} />
                  <span className="text-xs font-semibold" style={{ color: accentKleur }}>
                    {geselecteerdeRol === 'adoptant' ? 'Adoptant' : 'Organisatie'}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Asiel-specifieke velden bovenaan */}
              {isAsiel && (
                <>
                  <div>
                    <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                      Naam van het asiel
                    </label>
                    <input
                      type="text"
                      value={asielNaam}
                      onChange={(e) => setAsielNaam(e.target.value)}
                      className={inputKlasse}
                      placeholder="Dierenasiel Amsterdam"
                      required
                    />
                  </div>
                  <div className="h-px bg-white/[0.06] my-1" />
                </>
              )}

              {/* Postcode veld (adoptant + asiel) */}
              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                  {isAsiel ? 'Postcode asiel' : 'Jouw postcode'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={postcode}
                      onChange={(e) => {
                        setPostcode(e.target.value)
                        setPostcodeStatus('idle')
                        setStad('')
                      }}
                      onBlur={zoekPostcode}
                      placeholder="1234 AB"
                      maxLength={7}
                      className={`${inputKlasse} font-mono uppercase tracking-widest pr-10`}
                    />
                    {postcodeStatus === 'gevonden' && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-base">
                        check_circle
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={zoekPostcode}
                    disabled={!postcodeGeldig || postcodeStatus === 'laden'}
                    className="px-3 rounded-2xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 transition-colors disabled:opacity-40 flex items-center"
                  >
                    {postcodeStatus === 'laden' ? (
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-base">search</span>
                    )}
                  </button>
                </div>
                {stad && (
                  <div className="flex items-center gap-1.5 mt-2 px-3 py-2 bg-white/5 border border-white/8 rounded-xl">
                    <span className="material-symbols-outlined text-primary text-sm">location_city</span>
                    <span className="text-white/80 text-sm font-semibold">{stad}</span>
                  </div>
                )}
                {postcodeStatus === 'fout' && (
                  <p className="text-red-400 text-xs mt-1.5 pl-1">Postcode niet gevonden</p>
                )}
              </div>

              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                  {isAsiel ? 'Contactpersoon naam' : 'Voornaam'}
                </label>
                <input
                  type="text"
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  className={inputKlasse}
                  placeholder={isAsiel ? 'Jan de Vries' : 'Jouw naam'}
                  required
                  autoComplete="given-name"
                />
              </div>

              <div>
                <label className="block text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
                  E-mailadres
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputKlasse}
                  placeholder={isAsiel ? 'info@jouwasiel.nl' : 'jij@email.nl'}
                  required
                  autoComplete="email"
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
                  className={inputKlasse}
                  placeholder="Kies een wachtwoord"
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
                className="w-full font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg mt-2"
                style={{
                  background: accentKleur,
                  color: isAsiel ? '#fff' : '#33335c',
                  boxShadow: `0 8px 20px ${accentKleur}30`,
                }}
              >
                {laden ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="size-4 border-2 rounded-full animate-spin"
                      style={{ borderColor: `${isAsiel ? '#fff' : '#33335c'}30`, borderTopColor: isAsiel ? '#fff' : '#33335c' }}
                    />
                    Account aanmaken...
                  </span>
                ) : isAsiel ? (
                  'Asiel-account aanmaken'
                ) : (
                  'Start jouw zoektocht 🐾'
                )}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-white/5 text-center">
              <p className="text-white/30 text-sm">
                Al een account?{' '}
                <Link href="/auth/login" className="font-semibold hover:opacity-80 transition-opacity" style={{ color: accentKleur }}>
                  Inloggen
                </Link>
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-white/15 text-xs mt-8">
          Bedacht door Maya van Munster · WeAreImpact
        </p>
      </div>
    </div>
  )
}
