export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { helpdeskTickets, aiContentQueue } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { PageHeader, EmptyState } from '@/components/admin/ui'
import HelpdeskTicket from './HelpdeskTicket'

const BRON_LABELS: Record<string, string> = {
  contactformulier: 'Contactformulier',
  webintake: 'Web-intake',
  widget: 'Chatwidget',
}

export default async function HelpdeskPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  if (!organisatieId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState icon="support_agent" title="Geen organisatie gekoppeld" description="Jouw account is nog niet gekoppeld aan een organisatie." />
      </div>
    )
  }

  // Strikt gescoped op organisatie_id — tickets van andere organisaties zijn nooit zichtbaar.
  const tickets = await db
    .select()
    .from(helpdeskTickets)
    .where(eq(helpdeskTickets.organisatieId, organisatieId))
    .orderBy(desc(helpdeskTickets.aangemaaktOp))
    .limit(100)

  const queueIds = tickets.map((t) => t.conceptQueueId).filter((id): id is number => id != null)
  const concepten = queueIds.length
    ? await db.select().from(aiContentQueue).where(eq(aiContentQueue.organisatieId, organisatieId))
    : []
  const conceptMap = new Map(concepten.map((c) => [c.id, c]))

  const openstaand = tickets.filter((t) => t.status !== 'beantwoord' && t.status !== 'gesloten')
  const afgehandeld = tickets.filter((t) => t.status === 'beantwoord' || t.status === 'gesloten')

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        title="Helpdesk & Inbox"
        description={`${openstaand.length} openstaande ${openstaand.length === 1 ? 'vraag' : 'vragen'} • ${tickets.length} totaal`}
        icon="support_agent"
      />

      {openstaand.length === 0 ? (
        <EmptyState icon="mark_email_read" title="Inbox is leeg" description="Er zijn geen openstaande contactformulieren of web-intakes." />
      ) : (
        <div className="space-y-4">
          {openstaand.map((t) => (
            <HelpdeskTicket
              key={t.id}
              ticket={{ ...t, bronLabel: BRON_LABELS[t.bron] ?? t.bron }}
              concept={t.conceptQueueId ? conceptMap.get(t.conceptQueueId) ?? null : null}
            />
          ))}
        </div>
      )}

      {afgehandeld.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E293B]/40">Afgehandeld</h2>
          <div className="space-y-2 opacity-60">
            {afgehandeld.map((t) => (
              <div key={t.id} className="rounded-xl border border-[#1E293B]/8 bg-white px-4 py-3 text-sm">
                <span className="font-semibold text-[#1E293B]">{t.onderwerp}</span>
                <span className="text-[#1E293B]/50"> — {t.naam} · {new Date(t.aangemaaktOp).toLocaleDateString('nl-NL')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
