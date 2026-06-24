export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getManagementKpis, euro } from '@/lib/beheer/stats'
import { PageHeader, StatCard, Card } from '@/components/admin/ui'

function startVanMaand(): Date {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

const moduleLabels: Record<string, string> = {
  matching: 'Matching',
  copilot: 'AI Copilot',
  intake: 'Intake',
  'dier-intake': 'Dier-intake',
  'dier-scan': 'Foto-scan',
  verhaal: 'Verhalen',
  nazorg: 'Nazorg',
  contract: 'Contracten',
  assistent: 'Assistent',
  blog: 'Blog',
  mgmt: 'Management-analyse',
}

export default async function ManagementDashboardPage() {
  const maandStart = startVanMaand()
  const kpis = await getManagementKpis(maandStart)
  const maandNaam = maandStart.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

  const maxModuleKosten = Math.max(...kpis.aiPerModule.map((m) => m.kosten), 0.000001)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Management"
        icon="insights"
        description={`Platformoverzicht — ${maandNaam}`}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Nieuwe gebruikers" value={kpis.nieuweGebruikers} icon="group_add" tone="success" />
        <StatCard label="Nieuwe matches" value={kpis.nieuweMatches} icon="favorite" tone="danger" />
        <StatCard label="Nieuwe adopties" value={kpis.nieuweAdopties} icon="pets" tone="info" />
        <StatCard label="Verzonden mails" value={kpis.verzondenMails} icon="mail" tone="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-[#33335c] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#f8aa25]">smart_toy</span>
            <p className="text-sm font-semibold text-white/70">AI-kosten deze maand</p>
          </div>
          <p className="text-4xl font-extrabold">{euro(kpis.aiKostenEuro)}</p>
          <p className="text-white/50 text-xs font-semibold mt-1">{kpis.aiCalls} AI-aanroepen</p>
        </div>

        <Card className="lg:col-span-2">
          <p className="text-sm font-bold text-[#33335c] mb-4">Kosten per module</p>
          {kpis.aiPerModule.length === 0 ? (
            <p className="text-[#33335c]/40 text-sm">Nog geen AI-gebruik geregistreerd deze maand.</p>
          ) : (
            <div className="space-y-2.5">
              {kpis.aiPerModule.map((m) => (
                <div key={m.module} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#33335c]/70 w-32 flex-shrink-0">
                    {moduleLabels[m.module] ?? m.module}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f8aa25] rounded-full"
                      style={{ width: `${Math.max((m.kosten / maxModuleKosten) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#33335c] w-20 text-right flex-shrink-0">
                    {euro(m.kosten)}
                  </span>
                  <span className="text-[10px] text-[#33335c]/40 w-14 text-right flex-shrink-0">
                    {m.calls}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/admin/beheer/gebruikers', icon: 'group', label: 'Gebruikers', sub: 'Kosten & activiteit' },
          { href: '/admin/beheer/crm', icon: 'contacts', label: 'CRM', sub: 'Leads & deals' },
          { href: '/admin/beheer/blog', icon: 'article', label: 'Blog', sub: 'AI-SEO artikelen' },
          { href: '/admin/beheer/coupons', icon: 'sell', label: 'Coupons', sub: 'Marketingcodes' },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="bg-white rounded-2xl border border-[#33335c]/8 p-5 hover:border-[#33335c]/15 hover:shadow-md transition-all group"
          >
            <span className="material-symbols-outlined text-[#33335c]/30 group-hover:text-[#f8aa25] transition-colors mb-2 block">
              {l.icon}
            </span>
            <p className="font-extrabold text-[#33335c] text-sm">{l.label}</p>
            <p className="text-[#33335c]/40 text-xs">{l.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
