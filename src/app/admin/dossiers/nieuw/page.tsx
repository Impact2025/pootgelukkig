'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/ui'

const CATEGORIEEN = [
  { value: 'wmo', label: 'Wmo' },
  { value: 'participatie', label: 'Participatie' },
  { value: 'jeugd', label: 'Jeugd' },
  { value: 'reintegratie', label: 'Re-integratie' },
  { value: 'overig', label: 'Overig' },
] as const

export default function NieuwDossierPage() {
  const router = useRouter()
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBezig(true)
    setFout(null)
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch('/api/admin/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titel: String(fd.get('titel') ?? ''),
          categorie: String(fd.get('categorie') ?? 'overig'),
          samenvatting: String(fd.get('samenvatting') ?? ''),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.fout ?? 'Opslaan mislukt')
        return
      }
      router.push(`/admin/dossiers/${data.data.id}`)
    } catch {
      setFout('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <PageHeader title="Nieuw dossier" icon="folder" />
      <form onSubmit={onSubmit} className="bg-white border border-[#1E293B]/10 rounded-2xl p-6 space-y-5">
        {fout && <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-sm">{fout}</div>}
        <div>
          <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">Titel</label>
          <input name="titel" required className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">Categorie</label>
          <select name="categorie" defaultValue="overig" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10">
            {CATEGORIEEN.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-[#1E293B]/60 uppercase tracking-wide mb-1.5">Samenvatting</label>
          <textarea name="samenvatting" rows={4} className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10 resize-none" />
        </div>
        <button
          type="submit"
          disabled={bezig}
          className="w-full bg-[#2563EB] text-white font-bold py-3 rounded-xl hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
        >
          {bezig ? 'Bezig…' : 'Dossier aanmaken'}
        </button>
      </form>
    </div>
  )
}
