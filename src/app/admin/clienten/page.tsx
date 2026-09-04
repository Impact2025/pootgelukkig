export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { clienten } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import { PageHeader, ButtonLink, EmptyState, StatusBadge } from '@/components/admin/ui'

export default async function ClientenPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  const alleClienten = organisatieId
    ? await db
        .select()
        .from(clienten)
        .where(eq(clienten.organisatieId, organisatieId))
        .orderBy(desc(clienten.createdAt))
    : []

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Cliënten"
        description={`${alleClienten.length} cliënten in het systeem`}
        icon="group"
        actions={
          <ButtonLink href="/intake" icon="add">
            Nieuwe intake
          </ButtonLink>
        }
      />

      {alleClienten.length === 0 ? (
        <EmptyState icon="group" title="Nog geen cliënten" description="Start een nieuwe intake om de eerste cliënt aan te maken." />
      ) : (
        <div className="bg-white border border-[#1E293B]/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1E293B]/5 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Naam</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Hulpvraag</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Contact</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#1E293B]/40 uppercase tracking-wider">Aangemeld op</th>
              </tr>
            </thead>
            <tbody>
              {alleClienten.map((c, i) => (
                <tr key={c.id} className={`${i < alleClienten.length - 1 ? 'border-b border-[#1E293B]/5' : ''} hover:bg-gray-50/50 transition-colors`}>
                  <td className="px-5 py-4 text-sm font-semibold text-[#1E293B]">{c.voornaam} {c.achternaam}</td>
                  <td className="px-5 py-4 text-sm text-[#1E293B]/60 max-w-xs truncate">{c.hulpvraagOmschrijving ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-[#1E293B]/60">
                    {c.email ? <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a> : '—'}
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4 text-sm text-[#1E293B]/40">
                    {new Date(c.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-[#1E293B]/30">
        Wil je snel een cliënt toevoegen zonder direct een dossier te starten? Ga naar{' '}
        <Link href="/intake" className="underline">de intake</Link>.
      </p>
    </div>
  )
}
