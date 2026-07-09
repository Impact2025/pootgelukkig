export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getGebruikersOverzicht, euro } from '@/lib/beheer/stats'
import { PageHeader, Card, Badge, EmptyState } from '@/components/admin/ui'
import type { StatusTone } from '@/components/admin/nav'

const ROL_TONE: Record<string, StatusTone> = {
  admin: 'neutral',
  asiel: 'info',
  adoptant: 'success',
}

const ROL_LABELS: Record<string, string> = {
  admin: 'Admin',
  asiel: 'Asiel',
  adoptant: 'Adoptant',
}

export default async function BeheerGebruikersPage() {
  const rijen = await getGebruikersOverzicht()

  const totaalAiKosten = rijen.reduce((s, r) => s + r.aiKostenEuro, 0)
  const totaalMails = rijen.reduce((s, r) => s + r.mailVolume, 0)
  const totaalDieren = rijen.reduce((s, r) => s + r.aantalDieren, 0)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Gebruikers"
        icon="group"
        description={`${rijen.length} gebruikers · ${totaalDieren} dieren · ${euro(totaalAiKosten)} AI-kosten · ${totaalMails} mails`}
      />

      {rijen.length === 0 ? (
        <EmptyState icon="group" title="Nog geen gebruikers" />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#33335c]/5 text-left">
                  <th className="px-5 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">
                    Gebruiker
                  </th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider text-right">
                    Dieren
                  </th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider text-right">
                    AI-kosten
                  </th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider text-right">
                    Mails
                  </th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider text-right">
                    Matches
                  </th>
                  <th className="px-4 py-3 font-bold text-[#33335c]/50 text-xs uppercase tracking-wider text-right">
                    Adopties
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rijen.map((r) => (
                  <tr key={r.id} className="border-b border-[#33335c]/5 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-bold text-[#33335c]">{r.naam}</p>
                      <p className="text-[#33335c]/40 text-xs">
                        {r.email}
                        {r.stad ? ` · ${r.stad}` : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={ROL_TONE[r.rol] ?? 'neutral'}>{ROL_LABELS[r.rol] ?? r.rol}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#33335c]">
                      {r.aantalDieren || '–'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#33335c]">
                      {r.aiKostenEuro > 0 ? euro(r.aiKostenEuro) : '–'}
                    </td>
                    <td className="px-4 py-3 text-right text-[#33335c]/70">{r.mailVolume || '–'}</td>
                    <td className="px-4 py-3 text-right text-[#33335c]/70">{r.matchesAantal || '–'}</td>
                    <td className="px-4 py-3 text-right text-[#33335c]/70">{r.adoptiesAantal || '–'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/management/gebruikers/${r.id}`}
                        className="text-[#33335c]/40 hover:text-[#33335c] transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
