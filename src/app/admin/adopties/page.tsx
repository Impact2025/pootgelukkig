export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { adopties, dieren, users } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import Image from 'next/image'
import { PageHeader, EmptyState, StatusBadge, Card } from '@/components/admin/ui'
import AdminAdoptieActies from './AdminAdoptieActies'

function relatiefTijd(datum: Date | string) {
  const diff = Date.now() - new Date(datum).getTime()
  const uren = Math.floor(diff / 3600000)
  const dagen = Math.floor(diff / 86400000)
  if (uren < 1) return 'zojuist'
  if (uren < 24) return `${uren}u geleden`
  if (dagen === 1) return 'gisteren'
  return `${dagen} dagen geleden`
}

export default async function AdminAdoptiesPage() {
  const session = await auth()
  const asielId = session?.user?.asielId

  const filters = [...(asielId ? [eq(adopties.asielId, asielId)] : [])]

  const alleAdopties = await db
    .select({
      id: adopties.id,
      status: adopties.status,
      aangevraagdOp: adopties.aangevraagdOp,
      adoptieDatum: adopties.adoptieDatum,
      dierNaam: dieren.naam,
      dierSoort: dieren.soort,
      dierRas: dieren.ras,
      dierFoto: dieren.hoofdFotoUrl,
      dierId: dieren.id,
      userName: users.naam,
      userEmail: users.email,
    })
    .from(adopties)
    .innerJoin(dieren, eq(adopties.dierId, dieren.id))
    .innerJoin(users, eq(adopties.userId, users.id))
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(adopties.aangevraagdOp))

  const aangevraagd = alleAdopties.filter((a) => a.status === 'aangevraagd')
  const overig = alleAdopties.filter((a) => a.status !== 'aangevraagd')

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <PageHeader
        title="Adoptieverzoeken"
        icon="favorite"
        description={
          aangevraagd.length > 0
            ? `${aangevraagd.length} wacht op actie · ${alleAdopties.length} in totaal`
            : `${alleAdopties.length} in totaal`
        }
      />

      {alleAdopties.length === 0 && (
        <EmptyState
          icon="favorite"
          title="Nog geen adoptieverzoeken"
          description="Verzoeken verschijnen hier zodra adoptanten interesse tonen"
        />
      )}

      {aangevraagd.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-6 rounded-lg bg-amber-100 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-amber-600 text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notifications_active
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-[#33335c]/60 uppercase tracking-wider">Actie vereist</h2>
          </div>
          <div className="space-y-3">
            {aangevraagd.map((adoptie) => (
              <div
                key={adoptie.id}
                className="bg-white rounded-2xl border border-amber-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="size-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {adoptie.dierFoto ? (
                    <Image src={adoptie.dierFoto} alt={adoptie.dierNaam} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-300 text-xl">pets</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-extrabold text-[#33335c]">{adoptie.dierNaam}</h3>
                    <span className="text-[11px] text-[#33335c]/40 font-medium">
                      {adoptie.dierRas ?? adoptie.dierSoort}
                    </span>
                  </div>
                  <p className="text-sm text-[#33335c]/60">
                    Door <span className="font-bold text-[#33335c]">{adoptie.userName}</span>
                    <span className="text-[#33335c]/40"> — {adoptie.userEmail}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    <span className="text-xs text-amber-600 font-semibold">{relatiefTijd(adoptie.aangevraagdOp)}</span>
                    <span className="text-[#33335c]/20 text-xs">·</span>
                    <span className="text-xs text-[#33335c]/40">
                      {new Date(adoptie.aangevraagdOp).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                </div>

                <AdminAdoptieActies adoptieId={adoptie.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {overig.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-6 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-400 text-sm">history</span>
            </div>
            <h2 className="text-sm font-extrabold text-[#33335c]/60 uppercase tracking-wider">Geschiedenis</h2>
          </div>
          <Card padding={false}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#33335c]/5 bg-gray-50/60">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                    Dier
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                    Adoptant
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody>
                {overig.map((adoptie, i) => (
                  <tr
                    key={adoptie.id}
                    className={`${i < overig.length - 1 ? 'border-b border-[#33335c]/5' : ''} hover:bg-gray-50/50 transition-colors`}
                  >
                    <td className="px-5 py-4">
                      <span className="font-bold text-[#33335c] text-sm">{adoptie.dierNaam}</span>
                      <span className="text-gray-400 text-xs ml-1.5">{adoptie.dierRas ?? adoptie.dierSoort}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#33335c] text-sm font-medium">{adoptie.userName}</p>
                      <p className="text-gray-400 text-xs">{adoptie.userEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={adoptie.status} />
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">
                      {new Date(adoptie.aangevraagdOp).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}
    </div>
  )
}
