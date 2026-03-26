import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'
import { StatCard } from './components/StatCard'

interface WeekelijkseDigestProps {
  asielNaam: string
  contactpersoonNaam: string
  week: string // bijv. "week 13"
  stats: {
    nieuweMatches: number
    nieuweBeichten: number
    actieveDieren: number
    adopties: number
  }
  topMatches: Array<{ dierNaam: string; adoptantNaam: string; score: number }>
  portaalUrl: string
}

function begroeting() {
  const uur = new Date().getHours()
  if (uur < 12) return 'Goedemorgen'
  if (uur < 18) return 'Goedemiddag'
  return 'Goedenavond'
}

export function WeekelijkseDigest({
  asielNaam,
  contactpersoonNaam,
  week,
  stats,
  topMatches,
  portaalUrl,
}: WeekelijkseDigestProps) {
  return (
    <EmailLayout preview={`${week} voor ${asielNaam}: ${stats.nieuweMatches} nieuwe matches, ${stats.nieuweBeichten} berichten`}>
      <EmailHeader label={week} />

      {/* Greeting */}
      <Section style={{ padding: '32px 40px 0' }}>
        <Text style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {begroeting()}, {contactpersoonNaam} 👋
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#888', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Hier is het weekoverzicht van {asielNaam}.
        </Text>
      </Section>

      {/* Stats */}
      <Section style={{ padding: '24px 32px' }}>
        <table width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <StatCard getal={stats.nieuweMatches} label="Nieuwe matches" kleur="#22c55e" />
              <StatCard getal={stats.nieuweBeichten} label="Ongelezen berichten" kleur="#f8aa25" />
              <StatCard getal={stats.actieveDieren} label="Dieren online" kleur="#33335c" />
              <StatCard getal={stats.adopties} label="Adopties" kleur="#E2725B" />
            </tr>
          </tbody>
        </table>
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '0 40px' }} />

      {/* Top matches */}
      {topMatches.length > 0 && (
        <Section style={{ padding: '28px 40px' }}>
          <Text style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            Beste matches deze week
          </Text>
          {topMatches.map((match, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: i % 2 === 0 ? '#f8f8fb' : '#fff', borderRadius: '10px', marginBottom: '6px' }}>
              <div>
                <Text style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                  {match.dierNaam}
                </Text>
                <Text style={{ margin: 0, fontSize: '12px', color: '#888', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                  {match.adoptantNaam}
                </Text>
              </div>
              <span style={{ background: match.score >= 85 ? '#22c55e15' : '#f8aa2515', color: match.score >= 85 ? '#16a34a' : '#d97706', fontSize: '13px', fontWeight: 800, padding: '4px 12px', borderRadius: '100px', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {match.score}%
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* CTA */}
      <Section style={{ padding: '0 40px 40px', textAlign: 'center' }}>
        <EmailButton href={portaalUrl}>Open het portaal →</EmailButton>
        <Text style={{ margin: '16px 0 0', fontSize: '12px', color: '#bbb', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Je ontvangt dit elke maandag. Pas voorkeuren aan in je instellingen.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default WeekelijkseDigest
