export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dossiers, begeleidingen, clienten } from '@/lib/db/schema'
import { and, eq, desc, ilike, inArray } from 'drizzle-orm'
import Link from 'next/link'
import { PageHeader, ButtonLink, EmptyState, StatusBadge } from '@/components/admin/ui'

const CATEGORIE_LABELS: Record<string, string> = {
  wmo: 'Wmo', participatie: 'Participatie', jeugd: 'Jeugd', reintegratie: 'Re-integratie', overig: 'Overig',
}

export default async function DossiersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const status = typeof sp.status === 'string' ? sp.status : ''

  const condities = [
    organisatieId ? eq(dossiers.organisatieId, organisatieId) : undefined,
    status ? eq(dossiers.status, status as typeof dossiers.$inferSelect.status) : undefined,
    q ? ilike(dossiers.titel, `%${q}%`) : undefined,
  ].filter(Boolean) as Parameters<typeof and>

  const alleDossiers = await db
    .select()
    .from(dossiers)
    .where(condities.length > 0 ? and(...condities) : undefined)
    .orderBy(desc(dossiers.createdAt))

  // Eerste gekoppelde cliënt per dossier (via begeleidingen), voor de kolom "Cliënt"
  const clientenPerDossier = alleDossiers.length
    ? await db
        .select({
          dossierId: begeleidingen.dossierId,
          voornaam: clienten.voornaam,
          achternaam: clienten.achternaam,
        })
        .from(begeleidingen)
        .innerJoin(clienten, eq(begeleidingen.clientId, clienten.id))
        .where(inArray(begeleidingen.dossierId, alleDossiers.map((d) => d.id)))
    : []
  const clientMap = new Map(clientenPerDossier.map((c) => [c.dossierId, `${c.voornaam} ${c.achternaam}`]))

  const statussen = [
    { value: '', label: 'Alle' },
    { value: 'intake', label: 'Intake' },
    { value: 'actief', label: 'Actief' },
    { value: 'in_behandeling', label: 'In behandeling' },
    { value: 'afgerond', label: 'Afgerond' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Dossiers"
        description={`${alleDossiers.length} dossiers${q || status ? ' gevonden' : ' in het systeem'}`}
        icon="folder"
        actions={
          <ButtonLink href="/admin/dossiers/nieuw" icon="add">
            Nieuw dossier
          </ButtonLink>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <form className="flex-1 min-w-[220px]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Zoek op titel…"
            className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#2563EB]/50 focus:ring-2 focus:ring-[#2563EB]/10"
          />
        </form>
        <div className="flex gap-1 flex-wrap">
          {statussen.map((s) => (
            <Link
              key={s.value}
              href={s.value ? `/admin/dossiers?status=${s.value}` : '/admin/dossiers'}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                status === s.value ? 'bg-[#1E293B] text-white' : 'bg-white border border-[#1E293B]/15 text-[#1E293B]/60 hover:text-[#1E293B]'
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {alleDossiers.length === 0 ? (
        <EmptyState icon="folder" title="Geen dossiers gevonden" description="Maak een nieuw dossier aan of pas je filters aan." />
      ) : (
        <div className="bg-white border border-[#1E293B]/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B]/5 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Dossiernummer</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Titel</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Categorie</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Cliënt</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Aangemaakt op</th>
              </tr>
            </thead>
            <tbody>
              {alleDossiers.map((d, i) => (
                <tr key={d.id} className={`${i < alleDossiers.length - 1 ? 'border-b border-[#1E293B]/5' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <td className="px-5 py-4">
                    <Link href={`/admin/dossiers/${d.id}`} className="text-sm font-bold text-[#2563EB] hover:underline">
                      {d.dossierNummer}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/admin/dossiers/${d.id}`} className="text-sm font-semibold text-[#1E293B] hover:underline">
                      {d.titel}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#1E293B]/60">{CATEGORIE_LABELS[d.categorie] ?? d.categorie}</td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 text-sm text-[#1E293B]/60">{clientMap.get(d.id) ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-[#1E293B]/40">
                    {new Date(d.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
