import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

export type NazorgFase = 'dag3' | 'week3' | 'maand3'

interface NazorgEmailProps {
  adoptantNaam: string
  dierNaam: string
  dierSoort: string
  fase: NazorgFase
  aiTips: string[]
  nazorgUrl: string
}

const soortEmoji: Record<string, string> = { hond: '🐕', kat: '🐈', vogel: '🦜', konijn: '🐇', cavia: '🐹', overig: '🐾' }

const faseConfig: Record<NazorgFase, { titel: string; subtitel: string; label: string; kleur: string; intro: string }> = {
  dag3: {
    titel: 'Dag 3 — Hoe gaat het?',
    subtitel: 'De eerste dagen thuis zijn spannend — voor jou én voor {dierNaam}.',
    label: 'Dag 3',
    kleur: '#f8aa25',
    intro: 'De eerste drie dagen zijn de zwaarste. {dierNaam} is aan het ontdekken waar hij of zij terechtgekomen is. Dat is normaal — geef de tijd.',
  },
  week3: {
    titel: 'Week 3 — Op de goede weg',
    subtitel: '{dierNaam} begint z\'n plek te voelen. Goed gedaan!',
    label: 'Week 3',
    kleur: '#22c55e',
    intro: 'Na drie weken begint {dierNaam} te snappen hoe het werkt bij jullie thuis. Je ziet waarschijnlijk al meer van de echte persoonlijkheid.',
  },
  maand3: {
    titel: 'Maand 3 — Jullie zijn er doorheen! 🎉',
    subtitel: 'Na drie maanden zijn jullie een team. De moeilijkste fase is voorbij.',
    label: 'Maand 3',
    kleur: '#E2725B',
    intro: 'Drie maanden geleden gaf {dierNaam} het beste moment van z\'n leven een kans. En jij ook. De 3-3-3 regel is doorstaan — nu begint pas het echte plezier.',
  },
}

export function NazorgEmail({ adoptantNaam, dierNaam, dierSoort, fase, aiTips, nazorgUrl }: NazorgEmailProps) {
  const config = faseConfig[fase]
  const emoji = soortEmoji[dierSoort] ?? '🐾'
  const vervang = (tekst: string) => tekst.replace(/{dierNaam}/g, dierNaam)

  return (
    <EmailLayout preview={`${vervang(config.titel)} — ${dierNaam} is bij jou thuis`}>
      <EmailHeader label={config.label} />

      {/* Hero */}
      <Section style={{ background: `linear-gradient(135deg, ${config.kleur}15, ${config.kleur}08)`, borderBottom: `3px solid ${config.kleur}`, padding: '36px 40px', textAlign: 'center' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '44px', lineHeight: 1 }}>{emoji}</Text>
        <Text style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {vervang(config.titel)}
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#666', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {vervang(config.subtitel)}
        </Text>
      </Section>

      {/* Intro */}
      <Section style={{ padding: '32px 40px 0' }}>
        <Text style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#33335c', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Hoi {adoptantNaam},
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.7', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {vervang(config.intro)}
        </Text>
      </Section>

      {/* AI Tips */}
      {aiTips.length > 0 && (
        <Section style={{ padding: '24px 40px' }}>
          <Text style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            Tips voor deze fase
          </Text>
          {aiTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '8px', background: config.kleur, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 800, fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>{i + 1}</span>
              </div>
              <Text style={{ margin: 0, fontSize: '13px', color: '#444', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {tip}
              </Text>
            </div>
          ))}
        </Section>
      )}

      <Hr style={{ borderColor: '#ebebf0', margin: '0 40px' }} />

      {/* 3-3-3 progress */}
      <Section style={{ padding: '24px 40px' }}>
        <Text style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          De 3-3-3 regel
        </Text>
        <table width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              {(['dag3', 'week3', 'maand3'] as NazorgFase[]).map((f) => {
                const isVoltooid = ['dag3', 'week3', 'maand3'].indexOf(f) <= ['dag3', 'week3', 'maand3'].indexOf(fase)
                const labels: Record<NazorgFase, string> = { dag3: '3 dagen', week3: '3 weken', maand3: '3 maanden' }
                return (
                  <td key={f} style={{ textAlign: 'center', padding: '0 4px' }}>
                    <div style={{ background: isVoltooid ? config.kleur : '#ebebf0', borderRadius: '8px', padding: '8px 4px' }}>
                      <Text style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: isVoltooid ? '#fff' : '#bbb', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                        {isVoltooid ? '✓ ' : ''}{labels[f]}
                      </Text>
                    </div>
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </Section>

      <Section style={{ padding: '0 40px 40px', textAlign: 'center' }}>
        <EmailButton href={nazorgUrl}>Open de nazorg module →</EmailButton>
      </Section>
    </EmailLayout>
  )
}

export default NazorgEmail
