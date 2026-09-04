'use client'

import { useState } from 'react'
import type { Organisatie } from '@/lib/db/schema'

export default function InstellingenForm({ organisatie }: { organisatie: Organisatie }) {
  const [bezig, setBezig] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBezig(true)
    setOpgeslagen(false)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/asielen/${organisatie.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naam: String(fd.get('naam') ?? ''),
          telefoon: String(fd.get('telefoon') ?? ''),
          website: String(fd.get('website') ?? ''),
          contactEmail: String(fd.get('contactEmail') ?? ''),
          kvkNummer: String(fd.get('kvkNummer') ?? ''),
        }),
      })
      if (res.ok) setOpgeslagen(true)
    } finally {
      setBezig(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#1E293B]/10 rounded-2xl p-6 space-y-5">
      <Veld label="Organisatienaam" name="naam" defaultValue={organisatie.naam} />
      <div className="grid grid-cols-2 gap-4">
        <Veld label="Telefoon" name="telefoon" defaultValue={organisatie.telefoon ?? ''} />
        <Veld label="KVK-nummer" name="kvkNummer" defaultValue={organisatie.kvkNummer ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Veld label="Contact e-mail" name="contactEmail" type="email" defaultValue={organisatie.contactEmail ?? ''} />
        <Veld label="Website" name="website" defaultValue={organisatie.website ?? ''} />
      </div>
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

function Veld({ label, name, type = 'text', defaultValue }: { label: string; name: string; type?: string; defaultValue?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
      />
    </div>
  )
}
