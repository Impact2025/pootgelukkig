export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { medischeRecords, dieren } from '@/lib/db/schema'
import { eq, and, lte, isNotNull } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'

const soortEmoji = (soort: string): string =>
  ({ hond: '🐕', kat: '🐈', vogel: '🦜', konijn: '🐇', cavia: '🐹', hamster: '🐹', overig: '🐾' } as Record<string, string>)[soort] ?? '🐾'

function formatDatum(d: Date | null) {
  if (!d) return '—'
  return d.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
}

function dagenGeleden(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
  if (diff === 0) return 'vandaag'
  if (diff === 1) return '1 dag geleden'
  return `${diff} dagen geleden`
}

function dagenTot(d: Date): string {
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
  if (diff <= 0) return 'vandaag'
  if (diff === 1) return 'morgen'
  return `over ${diff} dagen`
}

type Behandeling = {
  id: number
  dierId: number
  type: string
  titel: string
  datum: Date
  volgendeDatum: Date | null
  status: string
  dierNaam: string
  dierSoort: string
  dierFotoUrl: string | null
}

const typeConfig: Record<string, { kleur: string; bg: string; icon: string }> = {
  vaccinatie:     { kleur: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: 'vaccines' },
  behandeling:    { kleur: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       icon: 'medical_services' },
  ontworming:     { kleur: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200',       icon: 'bug_report' },
  'check-up':     { kleur: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200',   icon: 'stethoscope' },
  operatie:       { kleur: 'text-red-700',     bg: 'bg-red-50 border-red-200',         icon: 'surgery' },
  tandheelkundig: { kleur: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200',   icon: 'dentistry' },
}

function getTypeConfig(type: string) {
  return typeConfig[type.toLowerCase()] ?? { kleur: 'text-[#33335c]/60', bg: 'bg-gray-50 border-gray-200', icon: 'event' }
}

function BehandelingsRij({ b, isPast, isUrgent }: { b: Behandeling; isPast: boolean; isUrgent: boolean }) {
  const cfg = getTypeConfig(b.type)
  const datum = b.volgendeDatum

  return (
    <Link
      href={`/admin/dieren/${b.dierId}`}
      className={`group flex items-center gap-4 py-3.5 px-4 rounded-xl transition-all duration-150 hover:shadow-sm ${
        isUrgent ? 'hover:bg-red-100/60' : 'hover:bg-gray-50'
      }`}
    >
      {/* Urgentie indicator */}
      {isPast && (
        <div className="w-1 h-8 rounded-full bg-red-400 flex-shrink-0" />
      )}

      {/* Foto */}
      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-white shadow-sm">
        {b.dierFotoUrl ? (
          <Image src={b.dierFotoUrl} alt={b.dierNaam} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">
            {soortEmoji(b.dierSoort)}
          </div>
        )}
      </div>

      {/* Naam + titel */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#33335c] text-sm leading-tight">{b.dierNaam}</p>
        <p className="text-xs text-[#33335c]/50 mt-0.5 truncate">{b.titel}</p>
      </div>

      {/* Type badge */}
      <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.kleur}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '0.7rem', fontVariationSettings: "'FILL' 1" }}>
          {cfg.icon}
        </span>
        {b.type}
      </div>

      {/* Datum */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold tabular-nums ${isPast ? 'text-red-500' : 'text-[#33335c]'}`}>
          {formatDatum(datum)}
        </p>
        <p className={`text-[10px] mt-0.5 font-medium ${isPast ? 'text-red-400' : 'text-[#33335c]/35'}`}>
          {datum ? (isPast ? dagenGeleden(datum) : dagenTot(datum)) : ''}
        </p>
      </div>

      {/* Arrow */}
      <span
        className={`material-symbols-outlined text-base transition-all duration-150 group-hover:translate-x-0.5 ${
          isUrgent ? 'text-red-300 group-hover:text-red-500' : 'text-[#33335c]/20 group-hover:text-[#33335c]/60'
        }`}
      >
        arrow_forward
      </span>
    </Link>
  )
}

export default async function AdminMedischPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) redirect('/auth/login')

  const now = new Date()
  const inZevenDagen = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const inVeertigDagen = new Date(now.getTime() + 40 * 24 * 60 * 60 * 1000)

  const alleBehandelingen = await db
    .select({
      id: medischeRecords.id,
      dierId: medischeRecords.dierId,
      type: medischeRecords.type,
      titel: medischeRecords.titel,
      datum: medischeRecords.datum,
      volgendeDatum: medischeRecords.volgendeDatum,
      status: medischeRecords.status,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierFotoUrl: dieren.hoofdFotoUrl,
    })
    .from(medischeRecords)
    .innerJoin(dieren, eq(medischeRecords.dierId, dieren.id))
    .where(
      and(
        eq(medischeRecords.status, 'aankomend'),
        isNotNull(medischeRecords.volgendeDatum),
        lte(medischeRecords.volgendeDatum, inVeertigDagen)
      )
    )
    .orderBy(medischeRecords.volgendeDatum)

  const vandaag = alleBehandelingen.filter(b => b.volgendeDatum && b.volgendeDatum <= now)
  const dezeWeek = alleBehandelingen.filter(b => b.volgendeDatum && b.volgendeDatum > now && b.volgendeDatum <= inZevenDagen)
  const later = alleBehandelingen.filter(b => b.volgendeDatum && b.volgendeDatum > inZevenDagen)

  const totaal = alleBehandelingen.length
  const urgentPct = totaal > 0 ? Math.round((vandaag.length / totaal) * 100) : 0

  return (
    <div className="p-8 max-w-4xl space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c] tracking-tight">Medisch overzicht</h1>
          <p className="text-sm text-[#33335c]/45 mt-1">Behandelingen, vaccinaties &amp; welzijn</p>
        </div>

        <div className="flex gap-2.5">
          {/* Urgent pill */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-sm ${
            vandaag.length > 0
              ? 'bg-red-50 border-red-200 text-red-600'
              : 'bg-gray-50 border-gray-100 text-[#33335c]/40'
          }`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              {vandaag.length > 0 ? 'warning' : 'check_circle'}
            </span>
            <span>{vandaag.length} vandaag</span>
          </div>

          {/* Week pill */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border font-bold text-sm ${
            dezeWeek.length > 0
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-gray-50 border-gray-100 text-[#33335c]/40'
          }`}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_today
            </span>
            <span>{dezeWeek.length} deze week</span>
          </div>
        </div>
      </div>

      {/* ── Urgentie progress bar ── */}
      {totaal > 0 && vandaag.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <span className="material-symbols-outlined text-red-400 text-2xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
            emergency
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-700">
              {vandaag.length} behandeling{vandaag.length !== 1 ? 'en' : ''} verei{vandaag.length !== 1 ? 'sen' : 'st'} direct actie
            </p>
            <div className="mt-2 h-1.5 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-400 rounded-full transition-all duration-700"
                style={{ width: `${urgentPct}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-black text-red-300 flex-shrink-0">{urgentPct}%</span>
        </div>
      )}

      {/* ── Lege staat ── */}
      {alleBehandelingen.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="size-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>
              health_and_safety
            </span>
          </div>
          <p className="text-[#33335c] font-bold text-base">Alle dieren zijn up-to-date</p>
          <p className="text-[#33335c]/40 text-sm mt-1">Geen behandelingen gepland voor de komende 40 dagen.</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── Vandaag & achterstallig ── */}
          {vandaag.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-red-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-red-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    warning
                  </span>
                  <h2 className="font-extrabold text-sm text-red-700">Vandaag &amp; achterstallig</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-red-100 border border-red-200 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                  {vandaag.length}
                </div>
              </div>
              <div className="divide-y divide-red-200/40 px-2 py-1">
                {vandaag.map((b) => (
                  <BehandelingsRij key={b.id} b={b} isPast={true} isUrgent={true} />
                ))}
              </div>
            </div>
          )}

          {/* ── Deze week ── */}
          {dezeWeek.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-amber-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    schedule
                  </span>
                  <h2 className="font-extrabold text-sm text-amber-700">Deze week</h2>
                </div>
                <span className="bg-amber-100 border border-amber-200 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full">
                  {dezeWeek.length}
                </span>
              </div>
              <div className="divide-y divide-amber-200/40 px-2 py-1">
                {dezeWeek.map((b) => (
                  <BehandelingsRij key={b.id} b={b} isPast={false} isUrgent={false} />
                ))}
              </div>
            </div>
          )}

          {/* ── Komende periode ── */}
          {later.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#33335c]/40 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    event
                  </span>
                  <h2 className="font-extrabold text-sm text-[#33335c]/60">Komende periode</h2>
                </div>
                <span className="bg-gray-50 border border-gray-100 text-[#33335c]/40 text-xs font-bold px-2.5 py-1 rounded-full">
                  {later.length}
                </span>
              </div>
              <div className="divide-y divide-gray-50 px-2 py-1">
                {later.map((b) => (
                  <BehandelingsRij key={b.id} b={b} isPast={false} isUrgent={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Welzijn check-ins ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#33335c]/[0.06] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#33335c]/60 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#33335c]">Welzijn check-ins</p>
            <p className="text-xs text-[#33335c]/45 mt-0.5">Dagelijkse observaties: voeding, gedrag en gezondheid</p>
          </div>
          <Link
            href="/admin/dieren"
            className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-[#f8aa25]" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
            Kies dier
          </Link>
        </div>

        {/* Type legenda */}
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-[#33335c]/30 uppercase tracking-wider mb-3">Behandelingstypes</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(typeConfig).map(([type, cfg]) => (
              <div key={type} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.kleur}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.7rem', fontVariationSettings: "'FILL' 1" }}>
                  {cfg.icon}
                </span>
                {type}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
