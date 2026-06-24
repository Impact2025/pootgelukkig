export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/admin/ui'
import AsielInstellingenForm from './AsielInstellingenForm'

export default async function InstellingenPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const asielId = session.user.asielId

  if (!asielId) {
    return (
      <div className="p-8 max-w-2xl">
        <PageHeader title="Asiel instellingen" icon="settings" />
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
          <p className="font-semibold mb-1">Geen asiel gekoppeld</p>
          <p>Jouw account is nog niet gekoppeld aan een asiel. Neem contact op met de beheerder.</p>
        </div>
      </div>
    )
  }

  const [asiel] = await db
    .select({
      id: asielen.id,
      naam: asielen.naam,
      stad: asielen.stad,
      regio: asielen.regio,
      adres: asielen.adres,
      postcode: asielen.postcode,
      lat: asielen.lat,
      lng: asielen.lng,
      telefoon: asielen.telefoon,
      email: asielen.email,
      website: asielen.website,
      beschrijving: asielen.beschrijving,
      logoUrl: asielen.logoUrl,
      openingstijden: asielen.openingstijden,
      socialMedia: asielen.socialMedia,
      asielConfig: asielen.asielConfig,
    })
    .from(asielen)
    .where(eq(asielen.id, asielId))
    .limit(1)

  if (!asiel) {
    redirect('/admin')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Asiel instellingen"
        icon="settings"
        description={`Beheer de gegevens van ${asiel.naam}. De postcode bepaalt de afstand die adoptanten zien.`}
      />
      <AsielInstellingenForm asiel={asiel} />
    </div>
  )
}
