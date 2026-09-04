export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { organisaties } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { PageHeader, StatCard } from '@/components/admin/ui'
import WervingClient from './WervingClient'

export default async function AsielenWervingPage() {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') {
    redirect('/admin')
  }

  const nieuweOrganisatiesRaw = await db
    .select()
    .from(organisaties)
    .where(eq(organisaties.wervingStatus, 'nieuw'))
    .orderBy(organisaties.naam)

  const nieuweAsielen = nieuweOrganisatiesRaw.map((o) => ({
    id: o.id,
    naam: o.naam,
    email: o.contactEmail,
    website: o.website,
  }))

  const [uitgenodigd] = await db
    .select({ aantal: count() })
    .from(organisaties)
    .where(eq(organisaties.wervingStatus, 'uitgenodigd'))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Asielen werving"
        icon="domain_add"
        description="Nieuw gevonden asielen. Controleer het e-mailadres en stuur een uitnodiging in de huisstijl."
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Nog uitnodigen"
          value={nieuweAsielen.length}
          icon="mail_outline"
          tone="warning"
        />
        <StatCard
          label="Uitgenodigd"
          value={uitgenodigd?.aantal ?? 0}
          icon="mark_email_read"
          tone="success"
        />
      </div>

      <WervingClient asielen={nieuweAsielen} />
    </div>
  )
}
