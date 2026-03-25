export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { gesprekken, berichten, users, dieren } from '@/lib/db/schema'
import { eq, desc, count, and } from 'drizzle-orm'
import Link from 'next/link'
import Image from 'next/image'

export default async function AdminBerichtenPage() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const alleGesprekken = await db
    .select({
      id: gesprekken.id,
      laasteBerichtOp: gesprekken.laasteBerichtOp,
      afspraakDatum: gesprekken.afspraakDatum,
      adoptantNaam: users.naam,
      adoptantEmail: users.email,
      dierNaam: dieren.naam,
      dierFotoUrl: dieren.hoofdFotoUrl,
      dierSoort: dieren.soort,
    })
    .from(gesprekken)
    .innerJoin(users, eq(gesprekken.userId, users.id))
    .innerJoin(dieren, eq(gesprekken.dierId, dieren.id))
    .orderBy(desc(gesprekken.laasteBerichtOp))

  const ongelezen = await db
    .select({ gesprekId: berichten.gesprekId, aantal: count() })
    .from(berichten)
    .where(and(eq(berichten.verzenderType, 'adoptant'), eq(berichten.gelezen, false)))
    .groupBy(berichten.gesprekId)

  const onglezenMap = new Map(ongelezen.map((r) => [r.gesprekId, Number(r.aantal)]))

  const totaalOngelezen = [...onglezenMap.values()].reduce((a, b) => a + b, 0)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#33335c]">Berichten</h1>
        <p className="text-sm text-[#33335c]/50 mt-1">
          {alleGesprekken.length} gesprek{alleGesprekken.length !== 1 ? 'ken' : ''} ·{' '}
          {totaalOngelezen > 0 ? (
            <span className="text-red-500 font-semibold">{totaalOngelezen} ongelezen</span>
          ) : (
            'alles gelezen'
          )}
        </p>
      </div>

      {alleGesprekken.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block">chat_bubble_outline</span>
          <p className="text-[#33335c]/40 font-semibold">Nog geen gesprekken</p>
          <p className="text-[#33335c]/30 text-sm mt-1">
            Adoptanten starten een gesprek via een dierenprofiel.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {alleGesprekken.map((g) => {
            const ongelezen = onglezenMap.get(g.id) ?? 0
            return (
              <Link
                key={g.id}
                href={`/admin/berichten/${g.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
              >
                {/* Dier foto */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {g.dierFotoUrl ? (
                    <Image src={g.dierFotoUrl} alt={g.dierNaam} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-300">pets</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#33335c] text-sm truncate">{g.adoptantNaam}</p>
                    {ongelezen > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight flex-shrink-0">
                        {ongelezen}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#33335c]/50 truncate">
                    Over <span className="font-semibold">{g.dierNaam}</span>
                    {g.afspraakDatum && (
                      <span className="ml-2 text-emerald-600 font-medium">
                        · Afspraak{' '}
                        {new Date(g.afspraakDatum).toLocaleDateString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </p>
                </div>

                {/* Tijdstip */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-[#33335c]/40">
                    {new Date(g.laasteBerichtOp).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <span className="material-symbols-outlined text-sm text-[#33335c]/20 group-hover:text-[#33335c]/50 transition-colors">
                    chevron_right
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
