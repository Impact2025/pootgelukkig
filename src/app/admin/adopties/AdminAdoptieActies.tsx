'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/admin/Toast'

export default function AdminAdoptieActies({ adoptieId }: { adoptieId: number }) {
  const [laden, setLaden] = useState<string | null>(null)
  const router = useRouter()
  const { showToast } = useToast()

  async function updateStatus(status: 'goedgekeurd' | 'afgewezen') {
    setLaden(status)
    try {
      const res = await fetch(`/api/admin/adopties/${adoptieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        showToast('Er ging iets mis. Probeer het opnieuw.', 'error')
        return
      }
      showToast(
        status === 'goedgekeurd' ? 'Verzoek goedgekeurd' : 'Verzoek afgewezen',
        status === 'goedgekeurd' ? 'success' : 'info'
      )
      router.refresh()
    } catch {
      showToast('Geen verbinding. Probeer het opnieuw.', 'error')
    } finally {
      setLaden(null)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => updateStatus('afgewezen')}
        disabled={!!laden}
        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-40 flex items-center gap-1"
      >
        {laden === 'afgewezen' ? (
          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        ) : null}
        Afwijzen
      </button>
      <button
        onClick={() => updateStatus('goedgekeurd')}
        disabled={!!laden}
        className="px-3 py-2 rounded-xl bg-[#33335c] text-white text-xs font-bold hover:bg-[#33335c]/90 transition-colors disabled:opacity-40 flex items-center gap-1"
      >
        {laden === 'goedgekeurd' ? (
          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
        ) : null}
        Goedkeuren
      </button>
    </div>
  )
}
