export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { pleeggezinnen, pleegplaatsingen, dieren } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import PlaatsingForm from './PlaatsingForm'
import { Card, EmptyState, Badge } from '@/components/admin/ui'

const ERVARING_LABEL: Record<string, string> = {
  geen: 'Geen ervaring',
  beetje: 'Beetje ervaring',
  veel: 'Veel ervaring',
}

export default async function PleeggezinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const { id } = await params
  const gezinId = parseInt(id)
  if (isNaN(gezinId)) redirect('/admin/pleeggezinnen')

  const [gezin] = await db
    .select()
    .from(pleeggezinnen)
    .where(eq(pleeggezinnen.id, gezinId))
    .limit(1)

  if (!gezin) redirect('/admin/pleeggezinnen')

  const plaatsingen = await db
    .select({
      id: pleegplaatsingen.id,
      startdatum: pleegplaatsingen.startdatum,
      einddatum: pleegplaatsingen.einddatum,
      actief: pleegplaatsingen.actief,
      notities: pleegplaatsingen.notities,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierFotoUrl: dieren.hoofdFotoUrl,
      dierId: dieren.id,
    })
    .from(pleegplaatsingen)
    .innerJoin(dieren, eq(pleegplaatsingen.dierId, dieren.id))
    .where(eq(pleegplaatsingen.pleeggezinId, gezinId))
    .orderBy(desc(pleegplaatsingen.startdatum))

  const asielId = session.user.asielId

  const beschikbareDieren = await db
    .select({ id: dieren.id, naam: dieren.naam, soort: dieren.soort })
    .from(dieren)
    .where(
      and(
        eq(dieren.status, 'beschikbaar'),
        ...(asielId ? [eq(dieren.asielId, asielId)] : [])
      )
    )
    .orderBy(dieren.naam)

  const actievePlaatsingen = plaatsingen.filter((p) => p.actief)
  const afgesloten = plaatsingen.filter((p) => !p.actief)
  const soorten = (gezin.soortVoorkeur as string[]) ?? []
  const maxD = gezin.maxDieren ?? 1
  const bezet = actievePlaatsingen.length

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/pleeggezinnen"
        className="inline-flex items-center gap-1 text-[#33335c]/40 hover:text-[#33335c] text-sm font-semibold mb-6 transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Pleeggezinnen
      </Link>

      <div className="grid grid-cols-3 gap-5">
        {/* Gezin info */}
        <div className="col-span-1 space-y-4">
          <Card>
            <div className="size-14 rounded-2xl bg-[#33335c] flex items-center justify-center mb-4">
              <span
                className="material-symbols-outlined text-[#f8aa25] text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                house
              </span>
            </div>
            <h1 className="font-extrabold text-[#33335c] text-lg leading-tight">{gezin.naam}</h1>
            {gezin.stad && (
              <p className="text-[#33335c]/40 text-sm mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                {gezin.stad}
              </p>
            )}

            <div className="mt-4 space-y-2.5 text-sm">
              {gezin.email && (
                <div className="flex items-center gap-2 text-[#33335c]/60">
                  <span className="material-symbols-outlined text-sm text-[#33335c]/30">mail</span>
                  <a href={`mailto:${gezin.email}`} className="hover:text-[#33335c] truncate">
                    {gezin.email}
                  </a>
                </div>
              )}
              {gezin.telefoon && (
                <div className="flex items-center gap-2 text-[#33335c]/60">
                  <span className="material-symbols-outlined text-sm text-[#33335c]/30">phone</span>
                  <a href={`tel:${gezin.telefoon}`} className="hover:text-[#33335c]">
                    {gezin.telefoon}
                  </a>
                </div>
              )}
              {gezin.adres && (
                <div className="flex items-start gap-2 text-[#33335c]/60">
                  <span className="material-symbols-outlined text-sm text-[#33335c]/30 mt-0.5">home</span>
                  <span>{gezin.adres}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[#33335c]/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#33335c]/40">Bezetting</span>
                <span className={`font-bold ${bezet >= maxD ? 'text-gray-400' : 'text-emerald-600'}`}>
                  {bezet}/{maxD}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${bezet >= maxD ? 'bg-gray-400' : 'bg-[#f8aa25]'}`}
                  style={{ width: `${Math.min((bezet / maxD) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#33335c]/40">
                {ERVARING_LABEL[gezin.ervaringNiveau ?? 'geen']}
              </p>
            </div>

            {soorten.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#33335c]/5">
                <p className="text-xs font-bold text-[#33335c]/30 uppercase tracking-wide mb-2">
                  Voorkeur
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {soorten.map((s) => (
                    <Badge key={s} tone="neutral">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {gezin.notities && (
              <div className="mt-4 pt-4 border-t border-[#33335c]/5">
                <p className="text-xs font-bold text-[#33335c]/30 uppercase tracking-wide mb-1.5">
                  Notities
                </p>
                <p className="text-xs text-[#33335c]/60 leading-relaxed">{gezin.notities}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Plaatsingen */}
        <div className="col-span-2 space-y-4">
          <PlaatsingForm pleeggezinId={gezinId} beschikbareDieren={beschikbareDieren} />

          {actievePlaatsingen.length > 0 && (
            <Card padding={false}>
              <div className="px-5 py-3 border-b border-[#33335c]/5 flex items-center justify-between">
                <h2 className="font-bold text-sm text-[#33335c]">Actieve plaatsingen</h2>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {actievePlaatsingen.length}
                </span>
              </div>
              <div className="divide-y divide-[#33335c]/5">
                {actievePlaatsingen.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative size-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.dierFotoUrl ? (
                        <Image src={p.dierFotoUrl} alt={p.dierNaam} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-base">pets</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#33335c] text-sm">{p.dierNaam}</p>
                      <p className="text-xs text-[#33335c]/40">
                        Geplaatst op{' '}
                        {p.startdatum.toLocaleDateString('nl-NL', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                      {p.notities && (
                        <p className="text-xs text-[#33335c]/30 truncate">{p.notities}</p>
                      )}
                    </div>
                    <Link
                      href={`/admin/dieren/${p.dierId}`}
                      className="text-xs text-[#33335c]/40 hover:text-[#33335c] transition-colors flex items-center gap-1"
                    >
                      Profiel
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {afgesloten.length > 0 && (
            <Card padding={false}>
              <div className="px-5 py-3 border-b border-[#33335c]/5">
                <h2 className="font-bold text-sm text-[#33335c]/50">Afgesloten plaatsingen</h2>
              </div>
              <div className="divide-y divide-[#33335c]/5">
                {afgesloten.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3 opacity-60">
                    <div className="relative size-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.dierFotoUrl ? (
                        <Image src={p.dierFotoUrl} alt={p.dierNaam} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-300 text-sm">pets</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#33335c] text-xs">{p.dierNaam}</p>
                      <p className="text-[10px] text-[#33335c]/40">
                        {p.startdatum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                        {' — '}
                        {p.einddatum
                          ? p.einddatum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
                          : '?'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {plaatsingen.length === 0 && (
            <EmptyState
              icon="pets"
              title="Nog geen plaatsingen"
              description='Klik op "Dier plaatsen" om een dier bij dit gezin te plaatsen.'
            />
          )}
        </div>
      </div>
    </div>
  )
}
