import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'
import { StatCard } from './components/StatCard'

export interface ManagementRapportProps {
  periodeLabel: string
  periodeTitel: string
  stats: {
    nieuweGebruikers: number
    nieuweMatches: number
    nieuweBegeleidingen: number
    verzondenMails: number
  }
  aiKosten: string
  aiCalls: number
  aiPerActie: { actie: string; kosten: string; calls: number }[]
  samenvatting?: string
  trends?: { label: string; waarde: string }[]
  portaalUrl: string
}

const actieLabels: Record<string, string> = {
  matching: 'Matching', copilot: 'AI Copilot', intake: 'Intake',
  'rol-fundraising-subsidie': 'Sam · Fondsen & Subsidies', 'rol-rapportage-rapportage': 'Mila · Rapportage',
  'rol-social-social_post': 'Conny · Communicatie', 'rol-vrijwilligers-briefing': 'Bram · Vrijwilligers',
  'copilot-briefing': 'Copilot-briefing', mgmt: 'Management-analyse',
}

const tekstStijl = { fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }

export function ManagementRapport({
  periodeLabel,
  periodeTitel,
  stats,
  aiKosten,
  aiCalls,
  aiPerActie,
  samenvatting,
  trends,
  portaalUrl,
}: ManagementRapportProps) {
  return (
    <EmailLayout preview={`${periodeTitel} — ${stats.nieuweGebruikers} nieuwe gebruikers, ${aiKosten} AI-kosten`}>
      <EmailHeader label={periodeLabel} />

      <Section style={{ padding: '32px 40px 0' }}>
        <Text style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#1a1a2e', ...tekstStijl }}>
          {periodeTitel}
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#888', ...tekstStijl }}>
          Belangrijkste managementcijfers + systeemanalyse.
        </Text>
      </Section>

      {/* Kerncijfers */}
      <Section style={{ padding: '24px 32px' }}>
        <table width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <StatCard getal={stats.nieuweGebruikers} label="Nieuwe gebruikers" kleur="#22c55e" />
              <StatCard getal={stats.nieuweMatches} label="Nieuwe matches" kleur="#f8aa25" />
              <StatCard getal={stats.nieuweBegeleidingen} label="Begeleidingen" kleur="#3B82F6" />
              <StatCard getal={stats.verzondenMails} label="Mails verzonden" kleur="#33335c" />
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '0 40px' }} />

      {/* AI-kosten */}
      <Section style={{ padding: '28px 40px' }}>
        <Text style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', ...tekstStijl }}>
          AI-kosten &amp; verbruik
        </Text>
        <Text style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 800, color: '#33335c', ...tekstStijl }}>
          {aiKosten} <span style={{ fontSize: '13px', fontWeight: 600, color: '#aaa' }}>· {aiCalls} aanroepen</span>
        </Text>
        {aiPerActie.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: i % 2 === 0 ? '#f8f8fb' : '#fff', borderRadius: '8px', marginBottom: '4px' }}>
            <Text style={{ margin: 0, fontSize: '13px', color: '#555', ...tekstStijl }}>
              {actieLabels[m.actie] ?? m.actie} <span style={{ color: '#bbb' }}>· {m.calls}×</span>
            </Text>
            <Text style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1a1a2e', ...tekstStijl }}>{m.kosten}</Text>
          </div>
        ))}
      </Section>

      {/* Trends (maand) */}
      {trends && trends.length > 0 && (
        <>
          <Hr style={{ borderColor: '#ebebf0', margin: '0 40px' }} />
          <Section style={{ padding: '28px 40px' }}>
            <Text style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', ...tekstStijl }}>
              Trends t.o.v. vorige periode
            </Text>
            {trends.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <Text style={{ margin: 0, fontSize: '13px', color: '#555', ...tekstStijl }}>{t.label}</Text>
                <Text style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1a1a2e', ...tekstStijl }}>{t.waarde}</Text>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* AI-samenvatting */}
      {samenvatting && (
        <>
          <Hr style={{ borderColor: '#ebebf0', margin: '0 40px' }} />
          <Section style={{ padding: '28px 40px' }}>
            <Text style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', ...tekstStijl }}>
              🤖 AI-systeemanalyse
            </Text>
            {samenvatting.split('\n').filter((r) => r.trim()).map((alinea, i) => (
              <Text key={i} style={{ margin: '0 0 10px', fontSize: '14px', lineHeight: '1.6', color: '#444', ...tekstStijl }}>
                {alinea}
              </Text>
            ))}
          </Section>
        </>
      )}

      <Section style={{ padding: '8px 40px 40px', textAlign: 'center' }}>
        <EmailButton href={portaalUrl}>Open het management-dashboard →</EmailButton>
      </Section>
    </EmailLayout>
  )
}

export default ManagementRapport
