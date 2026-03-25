'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: number
}

export default function WachtlijstActies({ id }: Props) {
  const router = useRouter()
  const [bezig, setBezig] = useState(false)

  async function markeerGecontacteerd() {
    if (bezig) return
    setBezig(true)
    try {
      await fetch(`/api/admin/wachtlijst/${id}`, { method: 'PATCH' })
      router.refresh()
    } finally {
      setBezig(false)
    }
  }

  async function verwijder() {
    if (bezig || !confirm('Weet je zeker dat je dit verzoek wilt verwijderen?')) return
    setBezig(true)
    try {
      await fetch(`/api/admin/wachtlijst/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={markeerGecontacteerd}
        disabled={bezig}
        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        Gecontacteerd
      </button>
      <button
        onClick={verwijder}
        disabled={bezig}
        className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  )
}
