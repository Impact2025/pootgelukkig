export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGebruikerDetail, euro } from '@/lib/beheer/stats'
import { StatCard, Card, Badge } from '@/components/admin/ui'
import type { StatusTone } from '@/components/admin/nav'

const moduleLabels: Record<string, string> = {
  matching: 'Matching', copilot: 'AI Copilot', intake: 'Intake', 'dier-intake': 'Dier-intake',
  'dier-scan': 'Foto-scan', verhaal: 'Verhalen', nazorg: 'Nazorg', contract: 'Contracten',
  assistent: 'Assistent', blog: 'Blog', mgmt: 'Management-analyse',
}

const MAIL_STATUS_TONE: Record<string, StatusTone> = {
  verzonden: 'success',
  geopend: 'info',
  gefaald: 'danger',
  gebounced: 'warning',
}

export default async function GebruikerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getGebruikerDetail(Number(id))
  if (!detail) notFound()

  const { user, aiPerActie, aiKostenTotaal, recenteMails, matchesAantal, begeleidingenAantal, aantalDossiers } = detail

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <Link
        href="/management/gebruikers"
        className="inline-flex items-center gap-1 text-[#33335c]/40 hover:text-[#33335c] text-sm font-semibold transition-colors"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Terug naar gebruikers
      </Link>

      <Card>
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-[#33335c] flex items-center justify-center flex-shrink-0">
            <span className="text-[#f8aa25] font-extrabold text-xl">{user.naam.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#33335c]">{user.naam}</h1>
            <p className="text-[#33335c]/40 text-sm">
              {user.email} · {user.rol}{user.stad ? ` · ${user.stad}` : ''}
            </p>
            <p className="text-[#33335c]/30 text-xs mt-0.5">
              Aangemeld{' '}
              {new Date(user.aangemeldOp).toLocaleDateString('nl-NL', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="AI-kosten" value={euro(aiKostenTotaal)} icon="psychology" tone="warning" />
        <StatCard label="Dieren" value={aantalDossiers} icon="pets" tone="neutral" />
        <StatCard label="Matches" value={matchesAantal} icon="auto_awesome" tone="info" />
        <StatCard label="Adopties" value={begeleidingenAantal} icon="favorite" tone="success" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-bold text-[#33335c] mb-3">AI-kosten per module</p>
          {aiPerActie.length === 0 ? (
            <p className="text-[#33335c]/40 text-sm">Geen AI-gebruik geregistreerd.</p>
          ) : (
            <div className="space-y-2">
              {aiPerActie.map((m) => (
                <div key={m.actie} className="flex items-center justify-between text-sm">
                  <span className="text-[#33335c]/70 font-medium">
                    {moduleLabels[m.actie] ?? m.actie}
                  </span>
                  <span className="text-[#33335c]/40 text-xs">
                    {m.calls}×{' '}
                    <span className="font-bold text-[#33335c]">{euro(m.kosten)}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <p className="text-sm font-bold text-[#33335c] mb-3">Recente e-mails</p>
          {recenteMails.length === 0 ? (
            <p className="text-[#33335c]/40 text-sm">Geen e-mails verzonden.</p>
          ) : (
            <div className="space-y-2">
              {recenteMails.map((m, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-[#33335c]/70 truncate">{m.onderwerp}</span>
                  <Badge tone={MAIL_STATUS_TONE[m.status] ?? 'neutral'}>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
