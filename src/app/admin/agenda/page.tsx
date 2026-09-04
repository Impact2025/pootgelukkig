export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken, dossiers, users } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { PageHeader, EmptyState, StatusBadge, Card } from '@/components/admin/ui'
import AgendaActies from './AgendaActies'

const TYPE_LABELS: Record<string, string> = {
  kennismaking: 'Kennismakingsgesprek',
  thuischeck: 'Dossiergesprek',
}

export default async function AgendaPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  if (!organisatieId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState icon="calendar_month" title="Geen organisatie gekoppeld" description="Jouw account is nog niet gekoppeld aan een organisatie." />
      </div>
    )
  }

  // Strikt gescoped op organisatie_id — een organisatie ziet nooit afspraken van een andere.
  const rijen = await db
    .select({
      id: afspraken.id,
      type: afspraken.type,
      status: afspraken.status,
      voorkeurDatum: afspraken.voorkeurDatum,
      voorkeurTijdslot: afspraken.voorkeurTijdslot,
      bevestigdeDatum: afspraken.bevestigdeDatum,
      bevestigdTijdstip: afspraken.bevestigdTijdstip,
      notitieAsiel: afspraken.notitieAsiel,
      dossierTitel: dossiers.titel,
      dossierNummer: dossiers.dossierNummer,
      dossierId: dossiers.id,
      aanvragerNaam: users.naam,
      aanvragerEmail: users.email,
    })
    .from(afspraken)
    .innerJoin(dossiers, eq(afspraken.dossierId, dossiers.id))
    .leftJoin(users, eq(afspraken.userId, users.id))
    .where(eq(afspraken.organisatieId, organisatieId))
    .orderBy(asc(afspraken.voorkeurDatum))

  const openstaand = rijen.filter((r) => r.status === 'aangevraagd')
  const bevestigd = rijen.filter((r) => r.status === 'bevestigd')
  const afgehandeld = rijen.filter((r) => r.status === 'afgerond' || r.status === 'geannuleerd')

  function formatDatum(d: Date | null) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <PageHeader
        title="Agenda & Planning"
        description={`${rijen.length} afspraken • ${openstaand.length} wachten op bevestiging`}
        icon="calendar_month"
      />

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E293B]/40">Wacht op bevestiging</h2>
        {openstaand.length === 0 ? (
          <EmptyState icon="event_available" title="Niets in te plannen" description="Er staan geen nieuwe afspraakverzoeken open." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {openstaand.map((a) => (
              <Card key={a.id} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-[#1E293B]">{TYPE_LABELS[a.type] ?? a.type}</p>
                    <p className="text-xs text-[#1E293B]/50">{a.dossierTitel} · {a.dossierNummer}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="text-sm text-[#1E293B]/70">
                  Voorkeur: {formatDatum(a.voorkeurDatum)} ({a.voorkeurTijdslot})
                </p>
                {a.aanvragerNaam && <p className="text-xs text-[#1E293B]/40">Aangevraagd door {a.aanvragerNaam}</p>}
                <AgendaActies id={a.id} status={a.status} />
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E293B]/40">Bevestigd</h2>
        {bevestigd.length === 0 ? (
          <EmptyState icon="event" title="Geen bevestigde afspraken" />
        ) : (
          <div className="bg-white border border-[#1E293B]/8 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1E293B]/5 bg-gray-50/60">
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Datum</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Dossier</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {bevestigd.map((a) => (
                  <tr key={a.id} className="border-b border-[#1E293B]/5 last:border-0 hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-sm text-[#1E293B]">
                      {formatDatum(a.bevestigdeDatum ?? a.voorkeurDatum)}{a.bevestigdTijdstip ? ` · ${a.bevestigdTijdstip}` : ''}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#1E293B]/70">{TYPE_LABELS[a.type] ?? a.type}</td>
                    <td className="px-5 py-3 text-sm text-[#1E293B]/70">{a.dossierTitel}</td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {afgehandeld.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E293B]/40">Afgehandeld</h2>
          <div className="bg-white border border-[#1E293B]/8 rounded-2xl overflow-hidden opacity-70">
            <table className="w-full">
              <tbody>
                {afgehandeld.map((a) => (
                  <tr key={a.id} className="border-b border-[#1E293B]/5 last:border-0">
                    <td className="px-5 py-3 text-sm text-[#1E293B]/60">{formatDatum(a.bevestigdeDatum ?? a.voorkeurDatum)}</td>
                    <td className="px-5 py-3 text-sm text-[#1E293B]/60">{a.dossierTitel}</td>
                    <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
