'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Badge, StatusBadge } from '@/components/admin/ui'
import { useToast } from '@/components/admin/Toast'
import type { helpdeskTickets, aiContentQueue } from '@/lib/db/schema'

type Ticket = typeof helpdeskTickets.$inferSelect & { bronLabel: string }
type Concept = typeof aiContentQueue.$inferSelect

export default function HelpdeskTicket({ ticket, concept }: { ticket: Ticket; concept: Concept | null }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [content, setContent] = useState(concept?.content ?? '')
  const [bezig, setBezig] = useState<'versturen' | 'sluiten' | null>(null)

  async function markeerBeantwoord() {
    setBezig('versturen')
    try {
      const res = await fetch('/api/admin/helpdesk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id, status: 'beantwoord', conceptContent: content, queueId: concept?.id }),
      })
      if (!res.ok) throw new Error()
      showToast('Ticket gemarkeerd als beantwoord', 'success')
      router.refresh()
    } catch {
      showToast('Bijwerken is mislukt', 'error')
    } finally {
      setBezig(null)
    }
  }

  async function sluiten() {
    setBezig('sluiten')
    try {
      const res = await fetch('/api/admin/helpdesk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticket.id, status: 'gesloten' }),
      })
      if (!res.ok) throw new Error()
      showToast('Ticket gesloten', 'success')
      router.refresh()
    } catch {
      showToast('Bijwerken is mislukt', 'error')
    } finally {
      setBezig(null)
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#1E293B]">{ticket.onderwerp}</p>
          <p className="text-xs text-[#1E293B]/50">
            {ticket.naam} · {ticket.email} · {new Date(ticket.aangemaaktOp).toLocaleDateString('nl-NL')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{ticket.bronLabel}</Badge>
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-3 text-sm text-[#1E293B]/80 whitespace-pre-wrap">{ticket.bericht}</div>

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
          <span className="material-symbols-outlined text-[1rem]">auto_awesome</span>
          Conceptantwoord van Samen — controleer voor verzending
        </p>
        {concept ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            className="w-full rounded-xl border border-[#1D4ED8]/20 bg-[#1D4ED8]/5 p-3 text-sm text-[#1E293B] focus:outline-none focus:border-[#1D4ED8]/50 focus:ring-2 focus:ring-[#1D4ED8]/10"
          />
        ) : (
          <p className="rounded-xl border border-dashed border-[#1E293B]/15 p-3 text-sm text-[#1E293B]/40">
            Nog geen concept beschikbaar — Samen genereert dit automatisch bij binnenkomst.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" icon="mark_email_read" loading={bezig === 'versturen'} onClick={markeerBeantwoord}>
          Markeer als beantwoord
        </Button>
        <Button variant="ghost" icon="close" loading={bezig === 'sluiten'} onClick={sluiten}>
          Sluiten zonder antwoord
        </Button>
      </div>
    </Card>
  )
}
