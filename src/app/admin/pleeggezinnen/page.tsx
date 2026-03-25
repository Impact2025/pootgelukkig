export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { pleeggezinnen, pleegplaatsingen } from '@/lib/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import Link from 'next/link'

const SOORT_EMOJI: Record<string, string> = {
  hond: '🐕',
  kat: '🐈',
  vogel: '🦜',
  konijn: '🐇',
  cavia: '🐹',
  hamster: '🐹',
  overig: '🐾',
}

const ERVARING_LABEL: Record<string, string> = {
  geen: 'Geen ervaring',
  beetje: 'Beetje ervaring',
  veel: 'Veel ervaring',
}

export default async function PleeggezinnenPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const asielId = session.user.asielId

  const gezinnen = await db
    .select({
      id: pleeggezinnen.id,
      naam: pleeggezinnen.naam,
      email: pleeggezinnen.email,
      telefoon: pleeggezinnen.telefoon,
      stad: pleeggezinnen.stad,
      soortVoorkeur: pleeggezinnen.soortVoorkeur,
      maxDieren: pleeggezinnen.maxDieren,
      ervaringNiveau: pleeggezinnen.ervaringNiveau,
      aangemaaktOp: pleeggezinnen.aangemaaktOp,
      actievePlaatsingen: count(pleegplaatsingen.id),
    })
    .from(pleeggezinnen)
    .leftJoin(
      pleegplaatsingen,
      and(
        eq(pleegplaatsingen.pleeggezinId, pleeggezinnen.id),
        eq(pleegplaatsingen.actief, true)
      )
    )
    .where(
      and(
        eq(pleeggezinnen.actief, true),
        ...(asielId ? [eq(pleeggezinnen.asielId, asielId)] : [])
      )
    )
    .groupBy(pleeggezinnen.id)
    .orderBy(desc(pleeggezinnen.aangemaaktOp))

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#33335c]">Pleeggezinnen</h1>
          <p className="text-sm text-[#33335c]/50 mt-1">
            {gezinnen.length} {gezinnen.length === 1 ? 'pleeggezin' : 'pleeggezinnen'} actief
          </p>
        </div>
        <Link
          href="/admin/pleeggezinnen/nieuw"
          className="flex items-center gap-2 bg-[#33335c] text-[#f8aa25] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nieuw pleeggezin
        </Link>
      </div>

      {gezinnen.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <span
            className="material-symbols-outlined text-5xl text-gray-200 mb-3 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            house
          </span>
          <p className="text-[#33335c]/40 font-semibold">Nog geen pleeggezinnen</p>
          <p className="text-[#33335c]/30 text-sm mt-1">
            Voeg pleeggezinnen toe om tijdelijke opvang te organiseren.
          </p>
          <Link
            href="/admin/pleeggezinnen/nieuw"
            className="inline-flex items-center gap-2 mt-5 bg-[#33335c] text-[#f8aa25] font-bold px-5 py-2.5 rounded-xl text-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Eerste pleeggezin toevoegen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {gezinnen.map((gezin) => {
            const soorten = (gezin.soortVoorkeur as string[]) ?? []
            const actief = Number(gezin.actievePlaatsingen)
            const maxD = gezin.maxDieren ?? 1
            const beschikbaar = maxD - actief

            return (
              <Link
                key={gezin.id}
                href={`/admin/pleeggezinnen/${gezin.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-extrabold text-[#33335c]">{gezin.naam}</p>
                    {gezin.stad && (
                      <p className="text-xs text-[#33335c]/40 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {gezin.stad}
                      </p>
                    )}
                  </div>
                  <div
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      beschikbaar > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {beschikbaar > 0 ? `${beschikbaar} plek${beschikbaar > 1 ? 'ken' : ''}` : 'Vol'}
                  </div>
                </div>

                {/* Soorten */}
                {soorten.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {soorten.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg font-medium text-[#33335c]/60"
                      >
                        {SOORT_EMOJI[s] ?? '🐾'} {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-xs text-[#33335c]/40">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
                      {actief}/{maxD} geplaatst
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                      {ERVARING_LABEL[gezin.ervaringNiveau ?? 'geen'] ?? 'Onbekend'}
                    </span>
                  </div>
                  {(gezin.telefoon ?? gezin.email) && (
                    <p className="text-xs text-[#33335c]/30 truncate max-w-[140px]">
                      {gezin.telefoon ?? gezin.email}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
