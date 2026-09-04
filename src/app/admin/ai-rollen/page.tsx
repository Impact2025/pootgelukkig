export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiRollenConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/admin/ui'
import { AI_ROLLEN_LIJST } from '@/lib/ai/rollen'
import AiRollenToggleList from './AiRollenToggleList'

export default async function AiRollenInstellingenPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <PageHeader title="AI-rollen activeren" icon="group_add" />
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
          <p className="font-semibold mb-1">Geen organisatie gekoppeld</p>
          <p>Jouw account is nog niet gekoppeld aan een organisatie. Neem contact op met de beheerder.</p>
        </div>
      </div>
    )
  }

  const actief = await db
    .select({ rol: aiRollenConfig.rol, actief: aiRollenConfig.actief })
    .from(aiRollenConfig)
    .where(eq(aiRollenConfig.organisatieId, organisatieId))

  const actiefMap = new Map(actief.map((a) => [a.rol, a.actief]))
  const rollen = AI_ROLLEN_LIJST.map((r) => ({
    id: r.id,
    naam: r.naam,
    titel: r.titel,
    icoon: r.icoon,
    kleur: r.kleur,
    beschrijving: r.beschrijving,
    actief: actiefMap.get(r.id) ?? false,
  }))

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="AI-rollen activeren"
        icon="group_add"
        description="Activeer de AI-teamleden die jouw asiel helpen — per rol aan- of uitzetten."
      />

      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-sky-500 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
          info
        </span>
        <p className="text-sky-800 text-sm leading-relaxed">
          Elke AI-rol is een gespecialiseerd teamlid met toegang tot relevante asieldata. Actieve rollen
          verschijnen in de Copilot als schakelbare &quot;collega&apos;s&quot;. Kosten worden per rol bijgehouden.
        </p>
      </div>

      <AiRollenToggleList rollen={rollen} />
    </div>
  )
}
