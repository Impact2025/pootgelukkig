'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Organisatie } from '@/lib/db/schema'

const WERKVELD_OPTIES: { waarde: string; label: string }[] = [
  { waarde: 'wmo', label: 'Wmo' },
  { waarde: 'participatie', label: 'Participatie' },
  { waarde: 'jeugd', label: 'Jeugd' },
  { waarde: 'reintegratie', label: 'Re-integratie' },
  { waarde: 'overig', label: 'Overig' },
]

const STATUS_LABELS: Record<string, { label: string; toon: string }> = {
  niet_gestart: { label: 'Nog niet gestart', toon: 'bg-gray-100 text-gray-600' },
  bezig: { label: 'Gesprek onderweg', toon: 'bg-amber-100 text-amber-700' },
  afgerond: { label: 'Afgerond', toon: 'bg-emerald-100 text-emerald-700' },
  overgeslagen: { label: 'Overgeslagen', toon: 'bg-gray-100 text-gray-600' },
}

export default function OnboardingProfielForm({ organisatie }: { organisatie: Organisatie }) {
  const [bezig, setBezig] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)
  const [werkveld, setWerkveld] = useState<string[]>(organisatie.werkveldCategorieen ?? [])

  const status = STATUS_LABELS[organisatie.onboardingStatus] ?? STATUS_LABELS.niet_gestart

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBezig(true)
    setOpgeslagen(false)
    const fd = new FormData(e.currentTarget)
    const gemeentenRuw = String(fd.get('gemeenten') ?? '')
    try {
      const res = await fetch(`/api/asielen/${organisatie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rechtsvorm: String(fd.get('rechtsvorm') ?? ''),
          werkveldCategorieen: werkveld,
          gemeenten: gemeentenRuw.split(',').map((g) => g.trim()).filter(Boolean),
          teamgrootte: String(fd.get('teamgrootte') ?? ''),
          vrijwilligersAantal: String(fd.get('vrijwilligersAantal') ?? ''),
          grootsteKnelpunt: String(fd.get('grootsteKnelpunt') ?? ''),
          toneOfVoice: String(fd.get('toneOfVoice') ?? ''),
        }),
      })
      if (res.ok) setOpgeslagen(true)
    } finally {
      setBezig(false)
    }
  }

  function toggleWerkveld(waarde: string) {
    setWerkveld((huidig) => (huidig.includes(waarde) ? huidig.filter((w) => w !== waarde) : [...huidig, waarde]))
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#1E293B]/10 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${status.toon}`}>
          {status.label}
        </span>
        <Link href="/admin/onboarding" className="text-xs font-bold text-[#2563EB] hover:underline">
          Heropen gesprek met Noor →
        </Link>
      </div>

      <Veld label="Rechtsvorm" name="rechtsvorm" defaultValue={organisatie.rechtsvorm ?? ''} placeholder="bijv. stichting" />

      <div>
        <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">Werkveld</label>
        <div className="flex flex-wrap gap-2">
          {WERKVELD_OPTIES.map((o) => (
            <button
              key={o.waarde}
              type="button"
              onClick={() => toggleWerkveld(o.waarde)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold border transition-colors ${
                werkveld.includes(o.waarde)
                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                  : 'bg-white border-gray-200 text-[#1E293B]/60 hover:border-[#2563EB]/40'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <Veld label="Gemeenten (kommagescheiden)" name="gemeenten" defaultValue={(organisatie.gemeenten ?? []).join(', ')} placeholder="bijv. Utrecht, Nieuwegein" />

      <div className="grid grid-cols-2 gap-4">
        <Veld label="Teamgrootte" name="teamgrootte" type="number" defaultValue={organisatie.teamgrootte?.toString() ?? ''} />
        <Veld label="Aantal vrijwilligers" name="vrijwilligersAantal" type="number" defaultValue={organisatie.vrijwilligersAantal?.toString() ?? ''} />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">Grootste knelpunt</label>
        <textarea
          name="grootsteKnelpunt"
          rows={2}
          defaultValue={organisatie.grootsteKnelpunt ?? ''}
          placeholder="Waar gaat nu de meeste tijd/energie in zitten?"
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 resize-none"
        />
      </div>

      <Veld label="Gewenste toon" name="toneOfVoice" defaultValue={organisatie.toneOfVoice ?? ''} placeholder="bijv. informeel en warm" />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={bezig}
          className="bg-[#2563EB] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
        >
          {bezig ? 'Opslaan…' : 'Opslaan'}
        </button>
        {opgeslagen && <span className="text-emerald-600 text-xs font-bold">Opgeslagen ✓</span>}
      </div>
    </form>
  )
}

function Veld({
  label, name, type = 'text', defaultValue, placeholder,
}: { label: string; name: string; type?: string; defaultValue?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
      />
    </div>
  )
}
