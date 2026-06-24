export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren, matches, adopties, asielen, users } from '@/lib/db/schema'
import { and, eq, count, desc, gte, ne, sql } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'
import WelkomTour from '@/components/onboarding/WelkomTour'
import { StatCard, Card, ButtonLink, StatusBadge } from '@/components/admin/ui'

function begroeting() {
  const uur = new Date().getHours()
  if (uur < 12) return 'Goedemorgen'
  if (uur < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

function relatiefTijd(datum: Date | string) {
  const diff = Date.now() - new Date(datum).getTime()
  const uren = Math.floor(diff / 3600000)
  const dagen = Math.floor(diff / 86400000)
  if (uren < 1) return 'zojuist'
  if (uren < 24) return `${uren}u geleden`
  if (dagen === 1) return 'gisteren'
  return `${dagen} dagen geleden`
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const asielId = session?.user?.asielId

  let asielNaam = 'Asiel Portaal'
  if (asielId) {
    const [asiel] = await db
      .select({ naam: asielen.naam })
      .from(asielen)
      .where(eq(asielen.id, asielId))
      .limit(1)
    if (asiel) asielNaam = asiel.naam
  }

  const [aantalBeschikbaar] = await db
    .select({ aantal: count() })
    .from(dieren)
    .where(
      asielId
        ? and(eq(dieren.status, 'beschikbaar'), eq(dieren.asielId, asielId))
        : eq(dieren.status, 'beschikbaar')
    )

  const [aantalInShelter] = await db
    .select({ aantal: count() })
    .from(dieren)
    .where(
      asielId
        ? and(eq(dieren.asielId, asielId), ne(dieren.status, 'geadopteerd'))
        : ne(dieren.status, 'geadopteerd')
    )

  const [aantalMatches] = await db.select({ aantal: count() }).from(matches)

  const [aantalAfgerond] = await db
    .select({ aantal: count() })
    .from(adopties)
    .where(
      asielId
        ? and(eq(adopties.status, 'afgerond'), eq(adopties.asielId, asielId))
        : eq(adopties.status, 'afgerond')
    )

  const [aantalOpenstaand] = await db
    .select({ aantal: count() })
    .from(adopties)
    .where(
      asielId
        ? and(eq(adopties.status, 'aangevraagd'), eq(adopties.asielId, asielId))
        : eq(adopties.status, 'aangevraagd')
    )

  const zeveDagenGeleden = new Date()
  zeveDagenGeleden.setDate(zeveDagenGeleden.getDate() - 6)
  zeveDagenGeleden.setHours(0, 0, 0, 0)

  const dagelijksTrend = await db
    .select({
      dag: sql<string>`DATE(${adopties.aangevraagdOp})`,
      aantal: count(),
    })
    .from(adopties)
    .where(
      asielId
        ? and(gte(adopties.aangevraagdOp, zeveDagenGeleden), eq(adopties.asielId, asielId))
        : gte(adopties.aangevraagdOp, zeveDagenGeleden)
    )
    .groupBy(sql`DATE(${adopties.aangevraagdOp})`)
    .orderBy(sql`DATE(${adopties.aangevraagdOp})`)

  const dagNamenKort = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dagStr = d.toISOString().split('T')[0]
    const found = dagelijksTrend.find((t) => t.dag === dagStr)
    return {
      dag: dagNamenKort[d.getDay()],
      datum: dagStr,
      aantal: Number(found?.aantal ?? 0),
      isVandaag: i === 6,
    }
  })
  const maxTrend = Math.max(...trendData.map((t) => t.aantal), 1)

  const openstaandeVerzoeken = await db
    .select({
      id: adopties.id,
      aangevraagdOp: adopties.aangevraagdOp,
      dierNaam: dieren.naam,
      dierFoto: dieren.hoofdFotoUrl,
      dierSoort: dieren.soort,
      dierRas: dieren.ras,
      userName: users.naam,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .innerJoin(users, eq(adopties.userId, users.id))
    .where(
      asielId
        ? and(eq(adopties.status, 'aangevraagd'), eq(adopties.asielId, asielId))
        : eq(adopties.status, 'aangevraagd')
    )
    .orderBy(adopties.aangevraagdOp)
    .limit(3)

  const recenteDieren = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      soort: dieren.soort,
      ras: dieren.ras,
      status: dieren.status,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      binnengekomentOp: dieren.binnengekomentOp,
      leeftijdJaren: dieren.leeftijdJaren,
    })
    .from(dieren)
    .where(asielId ? eq(dieren.asielId, asielId) : undefined)
    .orderBy(desc(dieren.binnengekomentOp))
    .limit(6)

  const beschikbaar = aantalBeschikbaar?.aantal ?? 0
  const inShelter = aantalInShelter?.aantal ?? 0
  const openstaand = aantalOpenstaand?.aantal ?? 0

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <WelkomTour naam={session?.user?.name ?? 'beheerder'} rol={session?.user?.rol ?? 'asiel'} />

      {/* Begroeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#33335c]/40 text-sm font-medium">
            {new Date().toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <h1 className="text-3xl font-extrabold text-[#33335c] leading-tight mt-0.5">
            {begroeting()}, {session?.user?.name?.split(' ')[0] ?? 'beheerder'}
          </h1>
          <p className="text-[#33335c]/40 text-sm mt-0.5 font-medium">{asielNaam}</p>
        </div>
        <ButtonLink href="/admin/dieren/nieuw" icon="add" className="flex-shrink-0">
          Dier toevoegen
        </ButtonLink>
      </div>

      {/* Alert banner openstaande verzoeken */}
      {openstaand > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <span
                className="material-symbols-outlined text-amber-600 text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notifications_active
              </span>
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">
                {openstaand} {openstaand === 1 ? 'adoptieverzoek wacht' : 'adoptieverzoeken wachten'} op jouw actie
              </p>
              <p className="text-amber-600/70 text-xs mt-0.5">Reageer snel voor de beste ervaring</p>
            </div>
          </div>
          <Link
            href="/admin/adopties"
            className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-amber-600 transition-colors flex-shrink-0"
          >
            Bekijk verzoeken
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* KPI rij */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Beschikbaar"
          value={beschikbaar}
          icon="pets"
          tone="success"
          hint={`van ${inShelter} in opvang`}
          href="/admin/dieren"
        />
        <StatCard
          label="Openstaand"
          value={openstaand}
          icon="schedule"
          tone={openstaand > 0 ? 'warning' : 'neutral'}
          hint="adoptieverzoeken"
          href="/admin/adopties"
        />
        <StatCard
          label="Adopties"
          value={aantalAfgerond?.aantal ?? 0}
          icon="favorite"
          tone="info"
          hint="afgerond totaal"
          href="/admin/adopties"
        />
        <StatCard
          label="AI Matches"
          value={aantalMatches?.aantal ?? 0}
          icon="auto_awesome"
          tone="neutral"
          hint="berekend totaal"
        />
      </div>

      {/* Trend + Urgent queue */}
      <div className="grid grid-cols-3 gap-5">
        {/* Bar chart */}
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-[#33335c]">Adoptieverzoeken trend</h2>
              <p className="text-[#33335c]/40 text-xs mt-0.5">Afgelopen 7 dagen</p>
            </div>
            <span className="text-xs font-semibold text-[#33335c]/40 bg-gray-50 px-3 py-1.5 rounded-full border border-[#33335c]/8">
              {trendData.reduce((s, d) => s + d.aantal, 0)} totaal
            </span>
          </div>
          <div className="flex items-end gap-2" style={{ height: '100px' }}>
            {trendData.map((dag) => (
              <div key={dag.datum} className="flex-1 flex flex-col items-center gap-2 group">
                {dag.aantal > 0 ? (
                  <span className="text-[10px] font-bold text-white bg-[#33335c] rounded-md px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {dag.aantal}
                  </span>
                ) : (
                  <span className="text-[10px] opacity-0">0</span>
                )}
                <div className="w-full flex items-end" style={{ height: '68px' }}>
                  <div
                    className={`w-full rounded-xl transition-all duration-300 ${
                      dag.isVandaag
                        ? 'bg-[#f8aa25]'
                        : 'bg-[#33335c]/[0.07] group-hover:bg-[#33335c]/[0.15]'
                    }`}
                    style={{
                      height: dag.aantal === 0 ? '4px' : `${Math.max((dag.aantal / maxTrend) * 68, 8)}px`,
                    }}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    dag.isVandaag ? 'text-[#33335c] font-extrabold' : 'text-[#33335c]/30'
                  }`}
                >
                  {dag.dag}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#33335c]/5">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-[#f8aa25]" />
              <span className="text-[10px] text-[#33335c]/40 font-medium">Vandaag</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-[#33335c]/[0.07]" />
              <span className="text-[10px] text-[#33335c]/40 font-medium">Eerdere dagen</span>
            </div>
          </div>
        </Card>

        {/* Urgent queue */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#33335c]">Actie nodig</h2>
            {openstaand > 3 && (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                +{openstaand - 3} meer
              </span>
            )}
          </div>

          {openstaandeVerzoeken.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
              <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                <span
                  className="material-symbols-outlined text-2xl text-emerald-500"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <p className="text-[#33335c] font-bold text-sm">Alles afgehandeld!</p>
              <p className="text-[#33335c]/40 text-xs mt-1">Geen openstaande verzoeken</p>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1">
              {openstaandeVerzoeken.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-3 bg-amber-50/70 rounded-xl border border-amber-100"
                >
                  <div className="size-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    {v.dierFoto ? (
                      <Image src={v.dierFoto} alt={v.dierNaam} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-300 text-base">pets</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#33335c] text-xs truncate">{v.dierNaam}</p>
                    <p className="text-[#33335c]/50 text-[10px] truncate">{v.userName}</p>
                    <p className="text-amber-600 text-[10px] font-semibold mt-0.5">
                      {relatiefTijd(v.aangevraagdOp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {openstaand > 0 && (
            <Link
              href="/admin/adopties"
              className="mt-4 flex items-center justify-center gap-1.5 bg-[#33335c] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#33335c]/90 transition-colors"
            >
              Alle verzoeken beheren
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          )}
        </Card>
      </div>

      {/* Recente dieren */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-[#33335c]">Recente dieren</h2>
            {inShelter > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-28 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f8aa25] rounded-full"
                    style={{ width: `${(beschikbaar / inShelter) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[#33335c]/40 font-medium">
                  {beschikbaar}/{inShelter} beschikbaar
                </span>
              </div>
            )}
          </div>
          <Link
            href="/admin/dieren"
            className="flex items-center gap-1 text-xs font-bold text-[#33335c]/40 hover:text-[#33335c] transition-colors"
          >
            Alle dieren
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {recenteDieren.length === 0 ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-gray-200 text-5xl block mb-3">pets</span>
            <p className="text-gray-400 text-sm font-medium">Nog geen dieren toegevoegd</p>
            <ButtonLink href="/admin/dieren/nieuw" icon="add" className="mt-3">
              Eerste dier toevoegen
            </ButtonLink>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {recenteDieren.map((dier) => (
              <Link
                key={dier.id}
                href={`/animals/${dier.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="size-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {dier.hoofdFotoUrl ? (
                    <Image src={dier.hoofdFotoUrl} alt={dier.naam} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-300">pets</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#33335c] text-sm truncate group-hover:underline">
                    {dier.naam}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {dier.ras ?? dier.soort}
                    {dier.leeftijdJaren ? ` · ${dier.leeftijdJaren}j` : ''}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={dier.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
