export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren, asielen } from '@/lib/db/schema'
import { and, eq, desc, ilike, or } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import { PageHeader, ButtonLink, EmptyState, StatusBadge } from '@/components/admin/ui'
import DierenFilter from './DierenFilter'
import { Suspense } from 'react'

type AnimalStatus = 'beschikbaar' | 'in_behandeling' | 'geadopteerd' | 'niet_beschikbaar'
const VALID_STATUSSEN: AnimalStatus[] = ['beschikbaar', 'in_behandeling', 'geadopteerd', 'niet_beschikbaar']

export default async function AdminDierenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  const asielId = session?.user?.asielId

  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const statusParam = typeof sp.status === 'string' ? sp.status : ''
  const statusFilter: AnimalStatus | null = VALID_STATUSSEN.includes(statusParam as AnimalStatus)
    ? (statusParam as AnimalStatus)
    : null

  const conditions = [
    asielId ? eq(dieren.asielId, asielId) : undefined,
    statusFilter ? eq(dieren.status, statusFilter) : undefined,
    q
      ? or(
          ilike(dieren.naam, `%${q}%`),
          ilike(dieren.ras, `%${q}%`)
        )
      : undefined,
  ].filter(Boolean) as Parameters<typeof and>

  const alleDieren = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      leeftijdJaren: dieren.leeftijdJaren,
      geslacht: dieren.geslacht,
      status: dieren.status,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      binnengekomentOp: dieren.binnengekomentOp,
      gedragsProfiel: dieren.gedragsProfiel,
      asielNaam: asielen.naam,
      asielStad: asielen.stad,
    })
    .from(dieren)
    .leftJoin(asielen, eq(dieren.asielId, asielen.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(dieren.binnengekomentOp))

  const isFiltered = q !== '' || statusFilter !== null

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Dieren"
        description={`${alleDieren.length} dieren${isFiltered ? ' gevonden' : ' in het systeem'}`}
        icon="pets"
        actions={
          <ButtonLink href="/admin/dieren/nieuw" icon="add">
            Dier toevoegen
          </ButtonLink>
        }
      />

      <Suspense fallback={null}>
        <DierenFilter totaal={alleDieren.length} />
      </Suspense>

      {alleDieren.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon="search_off"
            title="Geen resultaten"
            description={`Geen dieren gevonden${q ? ` voor "${q}"` : ''}${statusFilter ? ` met status "${statusFilter}"` : ''}`}
          />
        ) : (
          <EmptyState
            icon="pets"
            title="Nog geen dieren in het systeem"
            description="Voeg je eerste dier toe om te beginnen"
            action={
              <ButtonLink href="/admin/dieren/nieuw" icon="add">
                Eerste dier toevoegen
              </ButtonLink>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alleDieren.map((dier) => (
            <div
              key={dier.id}
              className="bg-white rounded-2xl border border-[#33335c]/8 overflow-hidden hover:border-[#33335c]/15 hover:shadow-md transition-all group"
            >
              <Link href={`/animals/${dier.id}`} className="flex gap-4 p-4 hover:bg-gray-50/50 transition-colors">
                <div className="size-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {dier.hoofdFotoUrl ? (
                    <Image
                      src={dier.hoofdFotoUrl}
                      alt={dier.naam}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-300 text-2xl">pets</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-[#33335c]">{dier.naam}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {[dier.ras ?? dier.soort, dier.leeftijdJaren ? `${dier.leeftijdJaren} jaar` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <StatusBadge status={dier.status} />
                  </div>

                  {dier.asielNaam && (
                    <div className="flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-gray-300 text-sm">home_work</span>
                      <span className="text-gray-400 text-xs">
                        {dier.asielNaam}
                        {dier.asielStad ? `, ${dier.asielStad}` : ''}
                      </span>
                    </div>
                  )}

                  {dier.gedragsProfiel?.tags && dier.gedragsProfiel.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {dier.gedragsProfiel.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>

              <div className="border-t border-[#33335c]/5 px-4 py-3 flex items-center justify-between bg-gray-50/30">
                <span className="text-gray-400 text-xs">
                  Binnengekomen{' '}
                  {new Date(dier.binnengekomentOp).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/dieren/${dier.id}`}
                    className="flex items-center gap-1 text-[#33335c]/50 text-xs font-bold hover:text-[#33335c] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Bewerken
                  </Link>
                  <Link
                    href={`/animals/${dier.id}`}
                    target="_blank"
                    className="flex items-center gap-1 bg-[#33335c] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#33335c]/90 transition-colors"
                  >
                    Bekijk profiel
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
