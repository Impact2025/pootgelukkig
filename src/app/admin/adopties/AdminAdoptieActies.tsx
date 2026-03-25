'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminAdoptieActies({ adoptieId }: { adoptieId: number }) {
  const [laden, setLaden] = useState<string | null>(null)
  const router = useRouter()

  async function updateStatus(status: string) {
    setLaden(status)
    try {
      await fetch(`/api/admin/adopties/${adoptieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } finally {
      setLaden(null)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => updateStatus('afgewezen')}
        disabled={!!laden}
        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-40"
      >
        {laden === 'afgewezen' ? '...' : 'Afwijzen'}
      </button>
      <button
        onClick={() => updateStatus('goedgekeurd')}
        disabled={!!laden}
        className="px-3 py-2 rounded-xl bg-[#33335c] text-white text-xs font-bold hover:bg-[#33335c]/90 transition-colors disabled:opacity-40"
      >
        {laden === 'goedgekeurd' ? '...' : 'Goedkeuren'}
      </button>
    </div>
  )
}
