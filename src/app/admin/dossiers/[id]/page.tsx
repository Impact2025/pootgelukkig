export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { dossiers, begeleidingen, clienten, welzijnLogs } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { PageHeader, Card, StatusBadge } from '@/components/admin/ui'
import StatusEditor from './StatusEditor'
import AiActiesPanel from './AiActiesPanel'

const CATEGORIE_LABELS: Record<string, string> = {
  wmo: 'Wmo', participatie: 'Participatie', jeugd: 'Jeugd', reintegratie: 'Re-integratie', overig: 'Overig',
}

export default async function DossierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }
  const organisatieId = session.user.organisatieId
  const { id } = await params

  const [dossier] = await db
    .select()
    .from(dossiers)
    .where(organisatieId ? and(eq(dossiers.id, id), eq(dossiers.organisatieId, organisatieId)) : eq(dossiers.id, id))
    .limit(1)

  if (!dossier) notFound()

  const gekoppeldeBegeleidingen = await db
    .select({
      id: begeleidingen.id,
      status: begeleidingen.status,
      startDatum: begeleidingen.startDatum,
      evaluatieNotities: begeleidingen.evaluatieNotities,
      clientVoornaam: clienten.voornaam,
      clientAchternaam: clienten.achternaam,
      clientId: clienten.id,
    })
    .from(begeleidingen)
    .innerJoin(clienten, eq(begeleidingen.clientId, clienten.id))
    .where(eq(begeleidingen.dossierId, dossier.id))
    .orderBy(desc(begeleidingen.createdAt))

  const veldlogs = await db
    .select()
    .from(welzijnLogs)
    .where(eq(welzijnLogs.dossierId, dossier.id))
    .orderBy(desc(welzijnLogs.gelogdOp))
    .limit(20)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={dossier.titel}
        description={`${dossier.dossierNummer} · ${CATEGORIE_LABELS[dossier.categorie] ?? dossier.categorie}`}
        icon="folder"
        actions={<StatusBadge status={dossier.status} />}
      />

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-3">Samenvatting</h2>
        <p className="text-sm text-[#1E293B]/70 whitespace-pre-wrap leading-relaxed">
          {dossier.samenvatting ?? 'Geen samenvatting beschikbaar.'}
        </p>
        <p className="text-xs text-[#1E293B]/40 mt-4">
          Aangemaakt op {new Date(dossier.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
          {dossier.vertrouwelijk && ' · Vertrouwelijk'}
        </p>
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-3">Status bewerken</h2>
        <StatusEditor dossierId={dossier.id} huidigeStatus={dossier.status} />
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-3">Gekoppelde cliënten &amp; begeleidingen</h2>
        {gekoppeldeBegeleidingen.length === 0 ? (
          <p className="text-sm text-[#1E293B]/40">Nog geen cliënt gekoppeld aan dit dossier.</p>
        ) : (
          <div className="space-y-2">
            {gekoppeldeBegeleidingen.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">{b.clientVoornaam} {b.clientAchternaam}</p>
                  {b.evaluatieNotities && <p className="text-xs text-[#1E293B]/50 mt-0.5">{b.evaluatieNotities}</p>}
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-3">Veldlogs</h2>
        {veldlogs.length === 0 ? (
          <p className="text-sm text-[#1E293B]/40">Nog geen veldlogs geregistreerd voor dit dossier.</p>
        ) : (
          <div className="space-y-2">
            {veldlogs.map((log) => (
              <div key={log.id} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-[#1E293B]/40 mb-1">
                  {new Date(log.gelogdOp).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-sm text-[#1E293B]/70">{log.notitie ?? 'Geen notitie'}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-bold text-[#1E293B] mb-3">AI-acties</h2>
        <AiActiesPanel dossierTitel={dossier.titel} />
      </Card>
    </div>
  )
}
