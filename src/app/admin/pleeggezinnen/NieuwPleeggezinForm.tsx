'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SOORTEN = ['hond', 'kat', 'vogel', 'konijn', 'cavia', 'hamster', 'overig']
const SOORT_EMOJI: Record<string, string> = {
  hond: '🐕',
  kat: '🐈',
  vogel: '🦜',
  konijn: '🐇',
  cavia: '🐹',
  hamster: '🐹',
  overig: '🐾',
}
const ERVARING_OPTIES = [
  { val: 'geen', label: 'Geen ervaring' },
  { val: 'beetje', label: 'Beetje ervaring' },
  { val: 'veel', label: 'Veel ervaring' },
]

export default function NieuwPleeggezinForm() {
  const router = useRouter()
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [telefoon, setTelefoon] = useState('')
  const [adres, setAdres] = useState('')
  const [stad, setStad] = useState('')
  const [soortVoorkeur, setSoortVoorkeur] = useState<string[]>([])
  const [maxDieren, setMaxDieren] = useState(1)
  const [ervaringNiveau, setErvaringNiveau] = useState('geen')
  const [notities, setNotities] = useState('')

  function toggleSoort(soort: string) {
    setSoortVoorkeur((prev) =>
      prev.includes(soort) ? prev.filter((s) => s !== soort) : [...prev, soort]
    )
  }

  async function opslaan(e: React.FormEvent) {
    e.preventDefault()
    if (!naam.trim()) {
      setFout('Naam is verplicht')
      return
    }
    setBezig(true)
    setFout('')
    try {
      const res = await fetch('/api/admin/pleeggezinnen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam,
          email: email || undefined,
          telefoon: telefoon || undefined,
          adres: adres || undefined,
          stad: stad || undefined,
          soortVoorkeur,
          maxDieren,
          ervaringNiveau,
          notities: notities || undefined,
        }),
      })
      const json = (await res.json()) as { data?: { id: number }; error?: string }
      if (!res.ok || !json.data) {
        setFout(json.error ?? 'Er is een fout opgetreden')
        return
      }
      router.push('/admin/pleeggezinnen')
      router.refresh()
    } catch {
      setFout('Verbindingsfout. Probeer opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <form onSubmit={opslaan} className="max-w-2xl space-y-5">
      {fout && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700 font-medium">
          {fout}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-[#33335c] text-sm uppercase tracking-wide">Contactgegevens</h2>

        <div>
          <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
            Naam *
          </label>
          <input
            type="text"
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            required
            placeholder="Voor- en achternaam"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@email.nl"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
              Telefoon
            </label>
            <input
              type="tel"
              value={telefoon}
              onChange={(e) => setTelefoon(e.target.value)}
              placeholder="06-12345678"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
            Adres
          </label>
          <input
            type="text"
            value={adres}
            onChange={(e) => setAdres(e.target.value)}
            placeholder="Straat en huisnummer"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
            Stad
          </label>
          <input
            type="text"
            value={stad}
            onChange={(e) => setStad(e.target.value)}
            placeholder="Amsterdam"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-[#33335c] text-sm uppercase tracking-wide">Voorkeur &amp; ervaring</h2>

        <div>
          <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-2">
            Diersoort voorkeur
          </label>
          <div className="flex flex-wrap gap-2">
            {SOORTEN.map((soort) => {
              const geselecteerd = soortVoorkeur.includes(soort)
              return (
                <button
                  key={soort}
                  type="button"
                  onClick={() => toggleSoort(soort)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                    geselecteerd
                      ? 'bg-[#33335c] text-white border-transparent'
                      : 'bg-gray-50 text-[#33335c]/50 border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {SOORT_EMOJI[soort]} {soort.charAt(0).toUpperCase() + soort.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
              Max. dieren tegelijk
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxDieren}
              onChange={(e) => setMaxDieren(parseInt(e.target.value) || 1)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
              Ervaringsniveau
            </label>
            <select
              value={ervaringNiveau}
              onChange={(e) => setErvaringNiveau(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10"
            >
              {ERVARING_OPTIES.map((opt) => (
                <option key={opt.val} value={opt.val}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#33335c]/50 uppercase tracking-widest mb-1.5">
            Notities
          </label>
          <textarea
            value={notities}
            onChange={(e) => setNotities(e.target.value)}
            rows={3}
            placeholder="Bijzonderheden, beperkingen, speciale situatie..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-[#33335c] outline-none focus:ring-2 focus:ring-[#33335c]/10 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={bezig}
          className="flex-1 bg-[#33335c] text-[#f8aa25] font-bold py-3 rounded-xl text-sm disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {bezig ? (
            <span className="size-4 border-2 border-[#f8aa25]/30 border-t-[#f8aa25] rounded-full animate-spin" />
          ) : (
            <>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                save
              </span>
              Pleeggezin opslaan
            </>
          )}
        </button>
        <a
          href="/admin/pleeggezinnen"
          className="px-5 py-3 bg-gray-100 text-[#33335c]/60 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors text-center"
        >
          Annuleren
        </a>
      </div>
    </form>
  )
}
