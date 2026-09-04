export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { organisaties } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { PageHeader, Card } from '@/components/admin/ui'
import InstellingenForm from './InstellingenForm'
import OnboardingProfielForm from './OnboardingProfielForm'
import KenniskluisUpload from './KenniskluisUpload'
import WidgetSnippet from './WidgetSnippet'
import AgendaKoppelingen from './AgendaKoppelingen'
import Teamleden from './Teamleden'

export default async function InstellingenPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <PageHeader title="Instellingen" icon="settings" />
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-800 text-sm">
          Jouw account is nog niet gekoppeld aan een organisatie.
        </div>
      </div>
    )
  }

  const [organisatie] = await db.select().from(organisaties).where(eq(organisaties.id, organisatieId)).limit(1)
  if (!organisatie) redirect('/admin')

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <PageHeader title="Instellingen" icon="settings" description="Organisatiegegevens" />
      <InstellingenForm organisatie={organisatie} />

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-1">Organisatieprofiel</h2>
        <p className="text-sm text-[#1E293B]/55 mb-4">
          Dit is het profiel dat Noor tijdens het intakegesprek heeft opgebouwd — het bepaalt o.a.
          welke AI-collega&apos;s relevant zijn. Klopt er iets niet, pas het hier aan of heropen het
          gesprek.
        </p>
        <OnboardingProfielForm organisatie={organisatie} />
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-1">Teamleden</h2>
        <p className="text-sm text-[#1E293B]/55 mb-4">
          Nodig collega&apos;s uit om samen te werken in dezelfde organisatie. Iedereen ziet
          dezelfde dossiers, cliënten en wachtrij.
        </p>
        <Teamleden />
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-1">Agenda-koppeling</h2>
        <p className="text-sm text-[#1E293B]/55 mb-4">
          Koppel Outlook of Google Agenda om komende afspraken direct in ImpactOS te zien.
        </p>
        <AgendaKoppelingen />
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-1">Widget insluiten</h2>
        <p className="text-sm text-[#1E293B]/55 mb-4">
          Plaats de 24/7 webassistent &ldquo;Samen&rdquo; op je bestaande website. Kopieer de code
          en plak hem in je WordPress- of Wix-editor.
        </p>
        <WidgetSnippet slug={organisatie.slug} />
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-1">Kenniskluis</h2>
        <p className="text-sm text-[#1E293B]/55 mb-4">
          Upload je beleidsplan, Wmo-kader of goedgekeurde fondsaanvragen (PDF, max 15MB, tot 10
          documenten). Sam, Mila en Conny gebruiken de inhoud direct als extra context bij het
          voorbereiden van concepten.
        </p>
        <KenniskluisUpload />
      </Card>
    </div>
  )
}
