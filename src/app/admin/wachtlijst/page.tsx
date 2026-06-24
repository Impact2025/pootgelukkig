export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { wachtlijst } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { PageHeader, EmptyState, Card } from '@/components/admin/ui'
import WachtlijstActies from './WachtlijstActies'

const SOORT_LABELS: Record<string, string> = {
  hond: 'Hond',
  kat: 'Kat',
  vogel: 'Vogel',
  konijn: 'Konijn',
  cavia: 'Cavia',
  hamster: 'Hamster',
  overig: 'Overig',
}

export default async function WachtlijstPage() {
  const entries = await db
    .select()
    .from(wachtlijst)
    .where(eq(wachtlijst.actief, true))
    .orderBy(desc(wachtlijst.aangemeldOp))

  const telPerSoort = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.soort] = (acc[e.soort] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Wachtlijst"
        icon="format_list_bulleted"
        description={`${entries.length} actieve ${entries.length === 1 ? 'aanmelding' : 'aanmeldingen'}`}
      />

      {entries.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(telPerSoort).map(([soort, aantal]) => (
            <div
              key={soort}
              className="flex items-center gap-1.5 bg-white border border-[#33335c]/8 rounded-xl px-3 py-1.5 text-sm font-semibold text-[#33335c]"
            >
              <span className="material-symbols-outlined text-sm text-[#33335c]/50">pets</span>
              <span>{SOORT_LABELS[soort] ?? soort}</span>
              <span className="bg-[#33335c] text-[#f8aa25] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {aantal}
              </span>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon="format_list_bulleted"
          title="Wachtlijst is leeg"
          description="Mensen kunnen zich aanmelden via de website."
        />
      ) : (
        <Card padding={false}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#33335c]/5 bg-gray-50/60">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                  Naam
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                  Diersoort
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                  Ras
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                  Leeftijdswens
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-[#33335c]/40 uppercase tracking-wider">
                  Aangemeld
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`${i < entries.length - 1 ? 'border-b border-[#33335c]/5' : ''} hover:bg-gray-50/50 transition-colors`}
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#33335c] text-sm">{entry.naam}</p>
                    {entry.notities && (
                      <p className="text-[#33335c]/40 text-xs mt-0.5 truncate max-w-[180px]">{entry.notities}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <a
                      href={`mailto:${entry.email}`}
                      className="text-sm text-[#33335c]/70 hover:text-[#33335c] transition-colors"
                    >
                      {entry.email}
                    </a>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-[#33335c]">
                      <span className="material-symbols-outlined text-sm text-[#33335c]/50">pets</span>
                      {SOORT_LABELS[entry.soort] ?? entry.soort}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#33335c]/60">{entry.ras ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-[#33335c]/60">{entry.leeftijdVoorkeur ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-[#33335c]/40">
                    {new Date(entry.aangemeldOp).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <WachtlijstActies id={entry.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
