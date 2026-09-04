'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIEEN = [
  { value: 'wmo', label: 'Wmo' },
  { value: 'participatie', label: 'Participatie' },
  { value: 'jeugd', label: 'Jeugd' },
  { value: 'reintegratie', label: 'Re-integratie' },
  { value: 'overig', label: 'Overig' },
] as const

export default function IntakeForm() {
  const router = useRouter()
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [gelukt, setGelukt] = useState<{ dossierNummer: string } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBezig(true)
    setFout(null)
    const fd = new FormData(e.currentTarget)
    const body = {
      voornaam: String(fd.get('voornaam') ?? ''),
      achternaam: String(fd.get('achternaam') ?? ''),
      email: String(fd.get('email') ?? ''),
      telefoon: String(fd.get('telefoon') ?? ''),
      categorie: String(fd.get('categorie') ?? 'overig'),
      hulpvraagOmschrijving: String(fd.get('hulpvraagOmschrijving') ?? ''),
      gewensteOndersteuning: String(fd.get('gewensteOndersteuning') ?? ''),
      situatieOmschrijving: String(fd.get('situatieOmschrijving') ?? ''),
    }

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.fout ?? 'Er ging iets mis. Probeer opnieuw.')
        return
      }
      setGelukt({ dossierNummer: data.dossier.dossierNummer })
    } catch {
      setFout('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  if (gelukt) {
    return (
      <div className="bg-white border border-[#1E293B]/10 rounded-2xl p-8 text-center">
        <span className="material-symbols-outlined text-emerald-500 text-4xl mb-3">check_circle</span>
        <p className="text-[#1E293B] font-bold text-lg">Intake aangemaakt</p>
        <p className="text-[#1E293B]/50 text-sm mt-1">Dossier {gelukt.dossierNummer} staat klaar in Dossiers.</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => router.push('/admin/dossiers')}
            className="bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1D4ED8] transition-colors"
          >
            Naar dossiers
          </button>
          <button
            onClick={() => setGelukt(null)}
            className="border border-[#1E293B]/15 text-[#1E293B] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Nog een intake
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#1E293B]/10 rounded-2xl p-6 space-y-5">
      {fout && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-sm">{fout}</div>}

      <div className="grid grid-cols-2 gap-4">
        <Veld label="Voornaam" name="voornaam" required />
        <Veld label="Achternaam" name="achternaam" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Veld label="E-mailadres" name="email" type="email" />
        <Veld label="Telefoonnummer" name="telefoon" type="tel" />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">Categorie</label>
        <select name="categorie" defaultValue="overig" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10">
          {CATEGORIEEN.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <Textarea label="Hulpvraag" name="hulpvraagOmschrijving" required placeholder="Waar vraagt deze cliënt ondersteuning bij?" />
      <Textarea label="Gewenste ondersteuning" name="gewensteOndersteuning" placeholder="Welke vorm van begeleiding lijkt passend?" />
      <Textarea label="Situatieomschrijving" name="situatieOmschrijving" placeholder="Korte achtergrond/context van de situatie" />

      <button
        type="submit"
        disabled={bezig}
        className="w-full bg-[#2563EB] text-white font-bold py-3 rounded-xl hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
      >
        {bezig ? 'Bezig met opslaan…' : 'Intake aanmaken'}
      </button>
    </form>
  )
}

function Veld({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
      />
    </div>
  )
}

function Textarea({ label, name, required, placeholder }: { label: string; name: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">{label}</label>
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 resize-none"
      />
    </div>
  )
}
