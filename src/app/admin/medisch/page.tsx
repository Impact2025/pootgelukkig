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

function BehandelingsRij({ b, isPast }: { b: Behandeling; isPast: boolean }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-gray-50 transition-colors rounded-xl">
      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        {b.dierFotoUrl ? (
          <Image src={b.dierFotoUrl} alt={b.dierNaam} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">
            {soortEmoji(b.dierSoort)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#33335c] text-sm">{b.dierNaam}</p>
        <p className="text-xs text-[#33335c]/50">{b.titel}</p>
      </div>
      <div className="text-right">
        <p className={`text-xs font-bold ${isPast ? 'text-red-500' : 'text-[#33335c]/60'}`}>
          {formatDatum(b.volgendeDatum)}
        </p>
        <span className="text-[10px] uppercase tracking-wide text-[#33335c]/30">{b.type}</span>
      </div>
      <Link
        href={`/admin/dieren/${b.dierId}`}
        className="text-[#33335c]/20 hover:text-[#33335c]/60 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  )
}

function Sectie({
  titel,
  items,
  kleur,
  now,
}: {
  titel: string
  items: Behandeling[]
  kleur: string
  now: Date
}) {
  if (items.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
        <h2 className={`font-bold text-sm ${kleur}`}>{titel}</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-50 text-[#33335c]/40">
          {items.length}
        </span>
      </div>
      <div className="divide-y divide-gray-50 px-1">
        {items.map((b) => (
          <BehandelingsRij key={b.id} b={b} isPast={!!(b.volgendeDatum && b.volgendeDatum <= now)} />
        ))}
      </div>
    </div>
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

  const vandaag = alleBehandelingen.filter(
    (b) => b.volgendeDatum && b.volgendeDatum <= now
  )
  const dezeWeek = alleBehandelingen.filter(
    (b) => b.volgendeDatum && b.volgendeDatum > now && b.volgendeDatum <= inZevenDagen
  )
  const later = alleBehandelingen.filter(
    (b) => b.volgendeDatum && b.volgendeDatum > inZevenDagen
  )

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Medisch overzicht</h1>
          <p className="text-sm text-[#33335c]/50 mt-1">Komende behandelingen &amp; vaccinaties</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">
            {vandaag.length} vandaag
          </div>
          <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-sm font-bold">
            {dezeWeek.length} deze week
          </div>
        </div>
      </div>

      {alleBehandelingen.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <span
            className="material-symbols-outlined text-5xl text-gray-200 mb-3 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            medical_services
          </span>
          <p className="text-[#33335c]/40 font-semibold">Geen behandelingen gepland</p>
          <p className="text-[#33335c]/30 text-sm mt-1">
            Voeg medische records toe bij dierprofielen.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Sectie
            titel="Vandaag & achterstallig"
            items={vandaag}
            kleur="text-red-500"
            now={now}
          />
          <Sectie
            titel="Deze week"
            items={dezeWeek}
            kleur="text-amber-600"
            now={now}
          />
          <Sectie
            titel="Komende periode"
            items={later}
            kleur="text-[#33335c]/60"
            now={now}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-sm text-[#33335c] mb-3">Welzijn check-ins</h2>
        <p className="text-[#33335c]/50 text-xs mb-4">
          Registreer dagelijkse welzijnsobservaties per dier — voeding, gedrag en gezondheid.
        </p>
        <Link
          href="/admin/dieren"
          className="inline-flex items-center gap-2 bg-[#33335c] text-[#f8aa25] font-bold px-4 py-2.5 rounded-xl text-sm"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            pets
          </span>
          Kies een dier voor check-in
        </Link>
      </div>
    </div>
  )
}
