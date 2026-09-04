'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSSEN = [
  { value: 'intake', label: 'Intake' },
  { value: 'actief', label: 'Actief' },
  { value: 'in_behandeling', label: 'In behandeling' },
  { value: 'afgerond', label: 'Afgerond' },
] as const

export default function StatusEditor({ dossierId, huidigeStatus }: { dossierId: string; huidigeStatus: string }) {
  const router = useRouter()
  const [status, setStatus] = useState(huidigeStatus)
  const [bezig, setBezig] = useState(false)
  const [opgeslagen, setOpgeslagen] = useState(false)

  async function opslaan() {
    setBezig(true)
    setOpgeslagen(false)
    try {
      const res = await fetch(`/api/admin/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setOpgeslagen(true)
        router.refresh()
      }
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
      >
        {STATUSSEN.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <button
        onClick={opslaan}
        disabled={bezig || status === huidigeStatus}
        className="bg-[#2563EB] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#1D4ED8] disabled:opacity-40 transition-colors"
      >
        {bezig ? 'Opslaan…' : 'Opslaan'}
      </button>
      {opgeslagen && <span className="text-emerald-600 text-xs font-bold">Opgeslagen ✓</span>}
    </div>
  )
}
