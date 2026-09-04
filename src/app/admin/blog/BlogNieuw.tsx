'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/admin/ui'
import { useToast } from '@/components/admin/Toast'

export default function BlogNieuw() {
  const router = useRouter()
  const { showToast } = useToast()
  const [bezig, setBezig] = useState(false)

  async function nieuw() {
    setBezig(true)
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titel: 'Nieuw artikel' }),
      })
      const json = await res.json()
      if (!res.ok || !json.data) throw new Error()
      router.push(`/admin/blog/${json.data.id}`)
    } catch {
      showToast('Aanmaken is mislukt', 'error')
      setBezig(false)
    }
  }

  return (
    <Button icon="add" onClick={nieuw} loading={bezig}>
      Nieuw artikel
    </Button>
  )
}
