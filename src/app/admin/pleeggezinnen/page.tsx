export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { pleeggezinnen, pleegplaatsingen } from '@/lib/db/schema'
import { eq, and, count, desc } from 'drizzle-orm'
import Link from 'next/link'
import { PageHeader, ButtonLink, EmptyState, Badge } from '@/components/admin/ui'

const ERVARING_LABEL: Record<string, string> = {
  geen: 'Geen ervaring',
  beetje: 'Beetje ervaring',
  veel: 'Veel ervaring',
}

const SOORT_LABELS: Record<string, string> = {
  hond: 'Hond',
  kat: 'Kat',
  vogel: 'Vogel',
  konijn: 'Konijn',
  cavia: 'Cavia',
  hamster: 'Hamster',
  overig: 'Overig',
}

export default async function PleeggezinnenPage() {
  const session = await auth()
  const asielId = session?.user?.asielId

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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Pleeggezinnen"
        icon="house"
        description={`${gezinnen.length} ${gezinnen.length === 1 ? 'pleeggezin' : 'pleeggezinnen'} actief`}
        actions={
          <ButtonLink href="/admin/pleeggezinnen/nieuw" icon="add">
            Nieuw pleeggezin
          </ButtonLink>
        }
      />

      {gezinnen.length === 0 ? (
        <EmptyState
          icon="house"
          title="Nog geen pleeggezinnen"
          description="Voeg pleeggezinnen toe om tijdelijke opvang te organiseren."
          action={
            <ButtonLink href="/admin/pleeggezinnen/nieuw" icon="add">
              Eerste pleeggezin toevoegen
            </ButtonLink>
          }
        />
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
                className="bg-white rounded-2xl border border-[#33335c]/8 p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
              >
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
                  <Badge tone={beschikbaar > 0 ? 'success' : 'neutral'}>
                    {beschikbaar > 0 ? `${beschikbaar} plek${beschikbaar > 1 ? 'ken' : ''}` : 'Vol'}
                  </Badge>
                </div>

                {soorten.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {soorten.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-gray-50 border border-[#33335c]/8 px-2 py-0.5 rounded-lg font-medium text-[#33335c]/60"
                      >
                        {SOORT_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#33335c]/5">
                  <div className="flex items-center gap-3 text-xs text-[#33335c]/40">
                    <span className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-xs"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        pets
                      </span>
                      {actief}/{maxD} geplaatst
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-xs"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        school
                      </span>
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
