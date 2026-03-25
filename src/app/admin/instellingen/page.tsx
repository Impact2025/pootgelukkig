export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import AsielInstellingenForm from './AsielInstellingenForm'

export default async function InstellingenPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const asielId = session.user.asielId

  if (!asielId) {
    return (
      <div className="p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-extrabold text-[#33335c] mb-2">Asiel instellingen</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
            <p className="font-semibold mb-1">Geen asiel gekoppeld</p>
            <p>Jouw account is nog niet gekoppeld aan een asiel. Neem contact op met de beheerder.</p>
          </div>
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
    })
    .from(asielen)
    .where(eq(asielen.id, asielId))
    .limit(1)

  if (!asiel) {
    redirect('/admin')
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mb-8">
        <h1 className="text-2xl font-extrabold text-[#33335c] mb-1">Asiel instellingen</h1>
        <p className="text-[#33335c]/50 text-sm">
          Beheer de gegevens van <span className="font-semibold text-[#33335c]">{asiel.naam}</span>.
          De postcode bepaalt de afstand die adoptanten zien op hun dashboard.
        </p>
      </div>

      <AsielInstellingenForm asiel={asiel} />
    </div>
  )
}
