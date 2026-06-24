'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/admin/Toast'

export default function WachtlijstActies({ id }: { id: number }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [bezig, setBezig] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function markeerGecontacteerd() {
    if (bezig) return
    setBezig(true)
    try {
      const res = await fetch(`/api/admin/wachtlijst/${id}`, { method: 'PATCH' })
      if (!res.ok) { showToast('Er ging iets mis.', 'error'); return }
      showToast('Gemarkeerd als gecontacteerd', 'success')
      router.refresh()
    } catch {
      showToast('Geen verbinding. Probeer het opnieuw.', 'error')
    } finally {
      setBezig(false)
    }
  }

  async function verwijder() {
    setBezig(true)
    try {
      const res = await fetch(`/api/admin/wachtlijst/${id}`, { method: 'DELETE' })
      if (!res.ok) { showToast('Er ging iets mis.', 'error'); return }
      showToast('Verwijderd uit de wachtlijst', 'info')
      router.refresh()
    } catch {
      showToast('Geen verbinding. Probeer het opnieuw.', 'error')
    } finally {
      setBezig(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-[#33335c]/50 font-medium">Zeker?</span>
        <button
          onClick={verwijder}
          disabled={bezig}
          className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {bezig
            ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            : <span className="material-symbols-outlined text-sm">delete</span>}
          Ja, verwijder
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-semibold text-[#33335c]/40 hover:text-[#33335c] transition-colors px-2 py-1.5"
        >
          Nee
        </button>
      </div>
    )
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
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold px-3 py-1.5 rounded-lg"
      >
        <span className="material-symbols-outlined text-sm">delete</span>
      </button>
    </div>
  )
}
