export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken, dieren, users, asielen } from '@/lib/db/schema'
import { and, count, eq, or } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'
import { PageHeader, EmptyState, StatusBadge, StatCard } from '@/components/admin/ui'
import AfspraakBeheer from './AfspraakBeheer'

const TYPE_LABELS: Record<string, string> = {
  kennismaking: 'Kennismakingsbezoek',
  thuischeck: 'Thuischeck',
}

const TIJDSLOT_LABELS: Record<string, string> = {
  ochtend: 'Ochtend (9–12)',
  middag: 'Middag (12–17)',
  avond: 'Avond (17–20)',
}

function formatDatum(d: Date | string) {
  return new Date(d).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AdminAfsprakenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const session = await auth()
  const asielId = session?.user?.asielId
  const { status: statusFilter = 'alle' } = await searchParams

  const where = and(
    asielId ? eq(afspraken.asielId, asielId) : undefined,
    statusFilter !== 'alle'
      ? eq(afspraken.status, statusFilter as 'aangevraagd' | 'bevestigd' | 'afgerond' | 'geannuleerd')
      : or(
          eq(afspraken.status, 'aangevraagd'),
          eq(afspraken.status, 'bevestigd'),
          eq(afspraken.status, 'afgerond'),
          eq(afspraken.status, 'geannuleerd'),
        )
  )

  const rows = await db
    .select({
      id: afspraken.id,
      status: afspraken.status,
      type: afspraken.type,
      voorkeurDatum: afspraken.voorkeurDatum,
      voorkeurTijdslot: afspraken.voorkeurTijdslot,
      bevestigdeDatum: afspraken.bevestigdeDatum,
      bevestigdTijdstip: afspraken.bevestigdTijdstip,
      notitieAdoptant: afspraken.notitieAdoptant,
      notitieAsiel: afspraken.notitieAsiel,
      aangemaaktOp: afspraken.aangemaaktOp,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierFotoUrl: dieren.hoofdFotoUrl,
      dierId: dieren.id,
      adoptantNaam: users.naam,
      adoptantEmail: users.email,
    })
    .from(afspraken)
    .innerJoin(dieren, eq(afspraken.dierId, dieren.id))
    .innerJoin(users, eq(afspraken.userId, users.id))
    .innerJoin(asielen, eq(afspraken.asielId, asielen.id))
    .where(where)
    .orderBy(afspraken.aangemaaktOp)

  const counts = await db
    .select({ status: afspraken.status, aantal: count() })
    .from(afspraken)
    .where(asielId ? eq(afspraken.asielId, asielId) : undefined)
    .groupBy(afspraken.status)

  const countMap = Object.fromEntries(counts.map((c) => [c.status, Number(c.aantal)]))
  const totaalAangevraagd = countMap['aangevraagd'] ?? 0
  const totaalBevestigd = countMap['bevestigd'] ?? 0

  const tabs = [
    { key: 'alle', label: 'Alle' },
    { key: 'aangevraagd', label: 'Aangevraagd', badge: totaalAangevraagd },
    { key: 'bevestigd', label: 'Bevestigd', badge: totaalBevestigd },
    { key: 'afgerond', label: 'Afgerond' },
    { key: 'geannuleerd', label: 'Geannuleerd' },
  ]

  return (
    <div className="px-4 sm:px-8 py-6 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Afspraken"
        icon="calendar_month"
        description="Beheer kennismakings- en thuischeckafspraken met adoptanten"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Aangevraagd"
          value={totaalAangevraagd}
          icon="pending"
          tone="warning"
          href="/admin/afspraken?status=aangevraagd"
        />
        <StatCard
          label="Bevestigd"
          value={totaalBevestigd}
          icon="event_available"
          tone="info"
          href="/admin/afspraken?status=bevestigd"
        />
        <StatCard
          label="Afgerond"
          value={countMap['afgerond'] ?? 0}
          icon="check_circle"
          tone="success"
          href="/admin/afspraken?status=afgerond"
        />
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit max-w-full overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/afspraken?status=${tab.key}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              statusFilter === tab.key
                ? 'bg-white text-[#33335c] shadow-sm'
                : 'text-[#33335c]/50 hover:text-[#33335c]'
            }`}
          >
            {tab.label}
            {tab.badge ? (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="calendar_today" title="Geen afspraken gevonden" />
      ) : (
        <div className="space-y-3">
          {rows.map((rij) => {
            const serializable = {
              ...rij,
              voorkeurDatum: rij.voorkeurDatum.toISOString(),
              bevestigdeDatum: rij.bevestigdeDatum?.toISOString() ?? null,
              aangemaaktOp: rij.aangemaaktOp.toISOString(),
            }
            return (
              <div key={rij.id} className="bg-white rounded-2xl border border-[#33335c]/8 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      {rij.dierFotoUrl ? (
                        <Image src={rij.dierFotoUrl} alt={rij.dierNaam} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-2xl">pets</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <Link href={`/animals/${rij.dierId}`} className="font-extrabold text-[#33335c] hover:underline">
                            {rij.dierNaam}
                          </Link>
                          <span className="text-[#33335c]/40 text-sm"> · {rij.dierSoort}</span>
                        </div>
                        <StatusBadge status={rij.status} />
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                        <InfoRij icon="person" waarde={rij.adoptantNaam} sub={rij.adoptantEmail} />
                        <InfoRij
                          icon={rij.type === 'kennismaking' ? 'home_work' : 'house'}
                          waarde={TYPE_LABELS[rij.type] ?? rij.type}
                        />
                        <InfoRij
                          icon="calendar_today"
                          waarde={
                            rij.bevestigdeDatum
                              ? formatDatum(rij.bevestigdeDatum)
                              : formatDatum(rij.voorkeurDatum)
                          }
                          sub={
                            rij.bevestigdeDatum
                              ? `Bevestigd${rij.bevestigdTijdstip ? ` · ${rij.bevestigdTijdstip}` : ''}`
                              : `Voorkeur · ${TIJDSLOT_LABELS[rij.voorkeurTijdslot] ?? rij.voorkeurTijdslot}`
                          }
                        />
                        <InfoRij icon="schedule" waarde={`Aangevraagd ${formatDatum(rij.aangemaaktOp)}`} />
                      </div>

                      {rij.notitieAdoptant && (
                        <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2">
                          <p className="text-[#33335c]/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                            Bericht adoptant
                          </p>
                          <p className="text-[#33335c]/70 text-xs italic">&ldquo;{rij.notitieAdoptant}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(rij.status === 'aangevraagd' || rij.status === 'bevestigd') && (
                  <AfspraakBeheer afspraak={serializable} dierId={rij.dierId} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoRij({ icon, waarde, sub }: { icon: string; waarde: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-outlined text-[#33335c]/30 text-sm mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[#33335c] text-xs font-semibold leading-tight">{waarde}</p>
        {sub && <p className="text-[#33335c]/40 text-[10px] leading-tight mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
