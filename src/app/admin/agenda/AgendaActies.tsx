'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/admin/ui'
import { useToast } from '@/components/admin/Toast'

export default function AgendaActies({ id, status }: { id: number; status: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [bezig, setBezig] = useState<'bevestigd' | 'geannuleerd' | null>(null)

  if (status !== 'aangevraagd') return null

  async function wijzigStatus(nieuweStatus: 'bevestigd' | 'geannuleerd') {
    setBezig(nieuweStatus)
    try {
      const res = await fetch('/api/admin/agenda', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nieuweStatus }),
      })
      if (!res.ok) throw new Error()
      showToast(nieuweStatus === 'bevestigd' ? 'Afspraak bevestigd' : 'Afspraak geannuleerd', 'success')
      router.refresh()
    } catch {
      showToast('Bijwerken van de afspraak is mislukt', 'error')
    } finally {
      setBezig(null)
    }
  }

  return (
    <div className="flex gap-2 pt-1">
      <Button variant="primary" icon="check" loading={bezig === 'bevestigd'} onClick={() => wijzigStatus('bevestigd')} className="!px-3 !py-1.5 text-xs">
        Bevestigen
      </Button>
      <Button variant="ghost" icon="close" loading={bezig === 'geannuleerd'} onClick={() => wijzigStatus('geannuleerd')} className="!px-3 !py-1.5 text-xs">
        Afwijzen
      </Button>
    </div>
  )
}
