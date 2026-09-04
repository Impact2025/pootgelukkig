'use client'

import { useState } from 'react'
import Link from 'next/link'

const ACTIES = [
  { id: 'subsidieaanvraag', label: 'Concept-subsidieaanvraag (Sam)', endpoint: '/api/admin/rollen/fundraising/subsidieaanvraag' },
  { id: 'wmo', label: 'Wmo-rapportage (Mila)', endpoint: '/api/admin/rollen/rapportage/wmo' },
  { id: 'linkedin', label: 'LinkedIn-artikel (Conny)', endpoint: '/api/admin/rollen/social/linkedin' },
] as const

export default function AiActiesPanel({ dossierTitel }: { dossierTitel: string }) {
  const [bezig, setBezig] = useState<string | null>(null)
  const [resultaat, setResultaat] = useState<{ actie: string; opgeslagen: boolean } | null>(null)
  const [fout, setFout] = useState<string | null>(null)

  async function voerUit(actie: (typeof ACTIES)[number]) {
    setBezig(actie.id)
    setFout(null)
    setResultaat(null)
    try {
      const res = await fetch(actie.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierTitel }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFout(data.fout ?? 'Genereren mislukt')
        return
      }
      setResultaat({ actie: actie.label, opgeslagen: data.opgeslagen })
    } catch {
      setFout('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setBezig(null)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#1E293B]/40">
        Elke AI-generatie wordt als concept in de wachtrij geplaatst — niets wordt automatisch verstuurd.
      </p>
      <div className="flex flex-wrap gap-2">
        {ACTIES.map((actie) => (
          <button
            key={actie.id}
            onClick={() => voerUit(actie)}
            disabled={bezig !== null}
            className="text-sm font-bold px-4 py-2.5 rounded-xl border border-[#2563EB]/20 text-[#2563EB] hover:bg-[#2563EB]/5 disabled:opacity-40 transition-colors"
          >
            {bezig === actie.id ? 'Bezig…' : actie.label}
          </button>
        ))}
      </div>
      {fout && <p className="text-red-600 text-sm">{fout}</p>}
      {resultaat && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-800 flex items-center justify-between gap-3">
          <span>&ldquo;{resultaat.actie}&rdquo; is gegenereerd en staat klaar in de wachtrij.</span>
          <Link href="/admin/content-queue" className="font-bold underline whitespace-nowrap">
            Bekijk wachtrij
          </Link>
        </div>
      )}
    </div>
  )
}
