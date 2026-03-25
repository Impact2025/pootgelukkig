'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const STAPPEN = [
  {
    stap: 1,
    vraag: 'In wat voor soort woning ga jij en je nieuwe vriend wonen?',
    veld: 'woningType',
    opties: [
      { waarde: 'appartement', label: 'Appartement', emoji: '🏢', beschrijving: 'Knusse ruimtes, met of zonder balkon', foto: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
      { waarde: 'huis_met_tuin', label: 'Huis met tuin', emoji: '🌿', beschrijving: 'Genoeg ruimte om veilig buiten te spelen', foto: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400' },
      { waarde: 'boerderij', label: 'Boerderij', emoji: '🌾', beschrijving: 'Veel land en vrijheid voor actieve dieren', foto: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400' },
    ],
  },
  {
    stap: 2,
    vraag: 'Wie woont er nog meer in jouw huishouden?',
    veld: 'gezin',
    opties: [
      { waarde: 'alleen', label: 'Ik alleen', emoji: '👤', beschrijving: 'Rustig en gestructureerd', foto: 'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=400' },
      { waarde: 'stel', label: 'Met mijn partner', emoji: '👫', beschrijving: 'Twee aanspreekpunten', foto: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400' },
      { waarde: 'gezin_ouder_kinderen', label: 'Gezin (oudere kinderen)', emoji: '👨‍👩‍👧', beschrijving: 'Kinderen van 8 jaar of ouder', foto: 'https://images.unsplash.com/photo-1602866063048-ba7b9e2a2f1c?w=400' },
      { waarde: 'gezin_jonge_kinderen', label: 'Gezin (jonge kinderen)', emoji: '👶', beschrijving: 'Kinderen onder de 8 jaar', foto: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=400' },
    ],
  },
  {
    stap: 3,
    vraag: 'Hoe actief ben jij op een gemiddelde dag?',
    veld: 'activiteitNiveau',
    opties: [
      { waarde: 'laag', label: 'Rustig aan', emoji: '🛋️', beschrijving: 'Wandelingetje hier en daar', foto: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400' },
      { waarde: 'normaal', label: 'Normaal actief', emoji: '🚶', beschrijving: 'Dagelijkse wandelingen', foto: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400' },
      { waarde: 'hoog', label: 'Actief', emoji: '🏃', beschrijving: 'Sporten, lange wandelingen', foto: 'https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=400' },
      { waarde: 'zeer_hoog', label: 'Heel actief', emoji: '⚡', beschrijving: 'Hardlopen, hiking', foto: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400' },
    ],
  },
  {
    stap: 4,
    vraag: 'Hoeveel tijd ben je gemiddeld thuis per werkdag?',
    veld: 'werkTijd',
    opties: [
      { waarde: 'altijd', label: 'Werk thuis', emoji: '💻', beschrijving: 'Bijna altijd thuis', foto: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400' },
      { waarde: 'deels', label: 'Deels thuis', emoji: '🔄', beschrijving: 'Hybride, 2-3 dagen kantoor', foto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400' },
      { waarde: 'fulltime', label: 'Fulltime buitenshuis', emoji: '🏢', beschrijving: '8+ uur per dag weg', foto: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400' },
    ],
  },
  {
    stap: 5,
    vraag: 'Heb je al andere dieren thuis?',
    veld: 'andereDieren',
    opties: [
      { waarde: 'geen', label: 'Geen andere dieren', emoji: '🏠', beschrijving: 'Eerste dier in huis', foto: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400' },
      { waarde: 'hond', label: 'Ja, een hond', emoji: '🐶', beschrijving: 'Een bestaande hond thuis', foto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' },
      { waarde: 'kat', label: 'Ja, een kat', emoji: '🐱', beschrijving: 'Een bestaande kat thuis', foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
      { waarde: 'meerdere', label: 'Meerdere dieren', emoji: '🐾', beschrijving: 'Een echte dierenliefhebber!', foto: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400' },
    ],
  },
  {
    stap: 6,
    vraag: 'Hoeveel ervaring heb je met dieren?',
    veld: 'ervaring',
    opties: [
      { waarde: 'geen', label: 'Geen ervaring', emoji: '🌱', beschrijving: 'Dit wordt mijn eerste huisdier', foto: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400' },
      { waarde: 'beetje', label: 'Beetje ervaring', emoji: '📚', beschrijving: 'Had vroeger wel eens een dier', foto: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400' },
      { waarde: 'veel', label: 'Veel ervaring', emoji: '🏆', beschrijving: 'Meerdere dieren gehad', foto: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400' },
    ],
  },
  {
    stap: 7,
    vraag: 'Welk type dier zoek je?',
    veld: 'diersoort',
    opties: [
      { waarde: 'hond', label: 'Hond', emoji: '🐶', beschrijving: 'Trouwe begeleider', foto: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400' },
      { waarde: 'kat', label: 'Kat', emoji: '🐱', beschrijving: 'Zelfstandig en lief', foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
      { waarde: 'konijn', label: 'Konijn/knaagdier', emoji: '🐰', beschrijving: 'Kleiner en rustig', foto: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=400' },
      { waarde: 'alles', label: 'Maakt niet uit', emoji: '🐾', beschrijving: 'Verras me!', foto: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400' },
    ],
  },
]

export default function IntakePage() {
  const router = useRouter()
  const [huidigStap, setHuidigStap] = useState(0)
  const [antwoorden, setAntwoorden] = useState<Record<string, string>>({})
  const [geselecteerd, setGeselecteerd] = useState<string | null>(null)
  const [isLaden, setIsLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  const stap = STAPPEN[huidigStap]
  const voortgang = ((huidigStap + 1) / STAPPEN.length) * 100

  function handleSelecteer(waarde: string) {
    setGeselecteerd(waarde)
    const nieuweAntwoorden = { ...antwoorden, [stap.veld]: waarde }
    setAntwoorden(nieuweAntwoorden)

    // Auto-advance na korte delay zodat de selectie zichtbaar is
    setTimeout(() => {
      if (huidigStap < STAPPEN.length - 1) {
        setHuidigStap((s) => s + 1)
        setGeselecteerd(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        handleAfronden(nieuweAntwoorden)
      }
    }, 300)
  }

  function handleVolgende() {
    if (!geselecteerd) return
    const nieuweAntwoorden = { ...antwoorden, [stap.veld]: geselecteerd }

    if (huidigStap < STAPPEN.length - 1) {
      setHuidigStap(huidigStap + 1)
      setGeselecteerd(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleAfronden(nieuweAntwoorden)
    }
  }

  async function handleAfronden(alleAntwoorden: Record<string, string>) {
    setIsLaden(true)
    setFout(null)
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antwoorden: alleAntwoorden }),
      })
      if (response.ok) {
        router.push('/dashboard?intake=voltooid')
        return
      }
      const data = await response.json().catch(() => ({}))
      setFout(data.error ?? `Er ging iets mis (${response.status}). Probeer het opnieuw.`)
    } catch {
      setFout('Geen verbinding. Controleer je internet en probeer opnieuw.')
    } finally {
      setIsLaden(false)
    }
  }

  if (isLaden) {
    return (
      <div className="mobile-container bg-bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="poot-bounce text-6xl">🐾</div>
          <p className="text-white font-bold text-lg">Jouw matches worden berekend...</p>
          <p className="text-white/50 text-sm">AI aan het werk</p>
        </div>
      </div>
    )
  }

  if (fout) {
    return (
      <div className="mobile-container bg-bg-dark flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-sm">
          <div className="text-5xl">😔</div>
          <div>
            <p className="text-white font-bold text-lg mb-2">Oeps, er ging iets mis</p>
            <p className="text-white/50 text-sm">{fout}</p>
          </div>
          <button
            onClick={() => {
              setFout(null)
              handleAfronden(antwoorden)
            }}
            className="btn-primary"
          >
            <span>Opnieuw proberen</span>
            <span className="material-symbols-outlined">refresh</span>
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="block w-full text-white/30 text-sm py-2"
          >
            Ga naar dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-container bg-bg-dark flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg-dark/80 ios-blur">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => huidigStap > 0 ? setHuidigStap(huidigStap - 1) : router.push('/dashboard')}
            className="flex items-center justify-center size-10 rounded-full hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
          </button>
          <h1 className="text-lg font-bold text-white">Intake Gesprek</h1>
          <div className="size-10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">info</span>
          </div>
        </div>

        {/* Voortgangsbalk */}
        <div className="px-6 pb-4 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium text-sage">Voortgang</span>
            <span className="text-xs font-bold text-sage">{huidigStap + 1} van {STAPPEN.length}</span>
          </div>
          <div className="h-1.5 w-full bg-sage-dark/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${voortgang}%` }}
            />
          </div>
        </div>
      </header>

      {/* Chat interface */}
      <main className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-6">
        {/* Assistent bericht */}
        <div className="flex items-end gap-3 max-w-[85%] animate-fade-in">
          <div className="size-10 shrink-0 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
            <span className="text-xl">🐾</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold text-sage uppercase tracking-wider ml-1">
              PootGelukkig Assistent
            </p>
            <div className="bg-bg-dark/80 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3">
              <p className="text-[15px] leading-relaxed text-white">
                {huidigStap === 0
                  ? 'Hoi! Ik ben je PootGelukkig assistent. Om de perfecte match te vinden, heb ik wat info nodig. 🐾'
                  : 'Super! Nog een vraagje:'}
                <br /><br />
                {stap.vraag}
              </p>
            </div>
          </div>
        </div>

        {/* Opties grid */}
        <div className="grid grid-cols-1 gap-4 mt-2">
          {stap.opties.map((optie) => (
            <button
              key={optie.waarde}
              onClick={() => handleSelecteer(optie.waarde)}
              className={`group relative flex flex-col w-full text-left rounded-2xl overflow-hidden border-2 transition-all active:scale-95 shadow-md ${
                geselecteerd === optie.waarde
                  ? 'border-primary bg-bg-dark'
                  : 'border-transparent bg-white/5 hover:border-primary/50'
              }`}
            >
              {/* Foto */}
              <div className="h-28 w-full overflow-hidden relative">
                <Image
                  src={optie.foto}
                  alt={optie.label}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{optie.emoji}</span>
                    {optie.label}
                  </span>
                  <p className="text-sm text-sage mt-0.5">{optie.beschrijving}</p>
                </div>
                {geselecteerd === optie.waarde && (
                  <div className="bg-primary text-bg-dark size-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="h-24" />
      </main>

      {/* Footer CTA */}
      <footer className="p-6 bg-gradient-to-t from-bg-dark via-bg-dark to-transparent">
        {geselecteerd ? (
          <button
            onClick={handleVolgende}
            className="btn-primary animate-fade-in"
          >
            <span>{huidigStap < STAPPEN.length - 1 ? 'Volgende stap' : 'Bekijk mijn matches!'}</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        ) : (
          <p className="text-center text-sage/60 text-sm py-4">
            Tik op een optie hierboven om verder te gaan
          </p>
        )}
        <div className="ios-indicator" />
      </footer>
    </div>
  )
}
