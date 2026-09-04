export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiContentQueue } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { PageHeader, Badge, EmptyState, ButtonLink } from '@/components/admin/ui'
import type { StatusTone } from '@/components/admin/nav'

const TYPE_LABELS: Record<string, string> = {
  social_post: 'LinkedIn-artikel',
  email: 'Nieuwsbriefconcept',
  briefing: 'Persbericht',
}

const SOCIAL_STATUS_LABEL: Record<string, string> = {
  pending: 'Concept',
  approved: 'Klaar voor publicatie',
  rejected: 'Afgewezen',
}

const SOCIAL_STATUS_TONE: Record<string, StatusTone> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export default async function SocialPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  if (!organisatieId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState icon="campaign" title="Geen organisatie gekoppeld" description="Jouw account is nog niet gekoppeld aan een organisatie." />
      </div>
    )
  }

  // Strikt gescoped op organisatie_id, alleen content van Conny (rol 'social').
  const items = await db
    .select()
    .from(aiContentQueue)
    .where(and(eq(aiContentQueue.organisatieId, organisatieId), eq(aiContentQueue.rol, 'social')))
    .orderBy(desc(aiContentQueue.bijgewerktOp))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Social Media & PR"
        description={`${items.length} items van Conny — LinkedIn-artikelen, verhalen en nieuwsbriefconcepten`}
        icon="campaign"
        actions={
          <ButtonLink href="/admin/copilot" icon="auto_awesome">
            Nieuw met Conny
          </ButtonLink>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="campaign"
          title="Nog geen content"
          description="Vraag Conny in de AI Copilot om een LinkedIn-artikel, verhaal of nieuwsbriefconcept te schrijven."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-[#1E293B]/8 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">{TYPE_LABELS[item.type] ?? item.type}</p>
                  <p className="text-sm font-bold text-[#1E293B] mt-0.5">{item.titel || 'Zonder titel'}</p>
                </div>
                <Badge tone={SOCIAL_STATUS_TONE[item.status] ?? 'neutral'}>{SOCIAL_STATUS_LABEL[item.status] ?? item.status}</Badge>
              </div>
              <p className="text-sm text-[#1E293B]/60 line-clamp-4 whitespace-pre-wrap">{item.content}</p>
              <p className="text-xs text-[#1E293B]/35">
                {new Date(item.bijgewerktOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
