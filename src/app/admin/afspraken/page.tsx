export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { afspraken, dieren, users, asielen } from '@/lib/db/schema'
import { and, count, eq, or } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'
import AfspraakBeheer from './AfspraakBeheer'

const STATUS_CONFIG = {
  aangevraagd: { label: 'Aangevraagd', kleur: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  bevestigd:   { label: 'Bevestigd',   kleur: 'bg-blue-100 text-blue-800 border-blue-200',   dot: 'bg-blue-500'  },
  afgerond:    { label: 'Afgerond',    kleur: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
  geannuleerd: { label: 'Geannuleerd', kleur: 'bg-gray-100 text-gray-500 border-gray-200',   dot: 'bg-gray-400'  },
}

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
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
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

  // Counts per status for tabs
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
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#33335c]">Afspraken</h1>
        <p className="text-[#33335c]/40 text-sm mt-1">
          Beheer kennismakings- en thuischeckafspraken met adoptanten
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Aangevraagd', aantal: totaalAangevraagd, icon: 'pending', bg: 'bg-amber-50', iconKleur: '#d97706' },
          { label: 'Bevestigd', aantal: totaalBevestigd, icon: 'event_available', bg: 'bg-blue-50', iconKleur: '#2563eb' },
          { label: 'Afgerond', aantal: countMap['afgerond'] ?? 0, icon: 'check_circle', bg: 'bg-emerald-50', iconKleur: '#059669' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 border border-black/[0.04]`}>
            <div className="size-10 rounded-xl bg-white/60 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-xl" style={{ color: stat.iconKleur, fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
            </div>
            <p className="text-3xl font-extrabold text-[#33335c] tabular-nums">{stat.aantal}</p>
            <p className="text-[#33335c]/50 text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-6 w-fit">
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

      {/* Lijst */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <span className="material-symbols-outlined text-gray-200 text-5xl block mb-3">calendar_today</span>
          <p className="text-gray-400 font-medium text-sm">Geen afspraken gevonden</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((rij) => {
            const sc = STATUS_CONFIG[rij.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.aangevraagd
            const serializable = {
              ...rij,
              voorkeurDatum: rij.voorkeurDatum.toISOString(),
              bevestigdeDatum: rij.bevestigdeDatum?.toISOString() ?? null,
              aangemaaktOp: rij.aangemaaktOp.toISOString(),
            }
            return (
              <div key={rij.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Dier foto */}
                    <div className="size-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      {rij.dierFotoUrl ? (
                        <Image src={rij.dierFotoUrl} alt={rij.dierNaam} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-2xl">pets</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <Link href={`/animals/${rij.dierId}`} className="font-extrabold text-[#33335c] hover:underline">
                            {rij.dierNaam}
                          </Link>
                          <span className="text-[#33335c]/40 text-sm"> · {rij.dierSoort}</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${sc.kleur}`}>
                          <span className={`size-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
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
                          sub={rij.bevestigdeDatum ? `Bevestigd${rij.bevestigdTijdstip ? ` · ${rij.bevestigdTijdstip}` : ''}` : `Voorkeur · ${TIJDSLOT_LABELS[rij.voorkeurTijdslot] ?? rij.voorkeurTijdslot}`}
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

                {/* Actie balk (client component) */}
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
