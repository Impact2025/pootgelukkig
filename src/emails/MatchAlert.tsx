import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface MatchAlertProps {
  asielNaam: string
  dierNaam: string
  dierSoort: string
  adoptantNaam: string
  matchScore: number
  analyseTekst: string
  dierUrl: string
}

export function MatchAlert({
  asielNaam,
  dierNaam,
  dierSoort,
  adoptantNaam,
  matchScore,
  analyseTekst,
  dierUrl,
}: MatchAlertProps) {
  const scoreKleur = matchScore >= 85 ? '#22c55e' : matchScore >= 70 ? '#f8aa25' : '#E2725B'
  const soortEmoji: Record<string, string> = { hond: '🐕', kat: '🐈', vogel: '🦜', konijn: '🐇', cavia: '🐹', overig: '🐾' }
  const emoji = soortEmoji[dierSoort] ?? '🐾'

  return (
    <EmailLayout preview={`${adoptantNaam} matcht voor ${Math.round(matchScore)}% met ${dierNaam} — bekijk het profiel`}>
      <EmailHeader label="Nieuwe match" />

      {/* Score banner */}
      <Section style={{ background: `linear-gradient(135deg, ${scoreKleur}15, ${scoreKleur}08)`, borderBottom: `3px solid ${scoreKleur}`, padding: '24px 40px', textAlign: 'center' }}>
        <Text style={{ margin: 0, fontSize: '48px', fontWeight: 800, color: scoreKleur, lineHeight: 1, fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {Math.round(matchScore)}%
        </Text>
        <Text style={{ margin: '4px 0 0', fontSize: '13px', color: '#666', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          match score
        </Text>
      </Section>

      {/* Body */}
      <Section style={{ padding: '32px 40px' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Goed nieuws voor {asielNaam}! {emoji}
        </Text>
        <Text style={{ margin: '0 0 24px', fontSize: '15px', color: '#555', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          <strong style={{ color: '#33335c' }}>{adoptantNaam}</strong> heeft de AI-intake afgerond en matcht voor{' '}
          <strong style={{ color: scoreKleur }}>{Math.round(matchScore)}%</strong> met{' '}
          <strong style={{ color: '#33335c' }}>{dierNaam}</strong>.
        </Text>

        {/* Analyse */}
        <div style={{ background: '#f8f8fb', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${scoreKleur}`, marginBottom: '28px' }}>
          <Text style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            AI analyse
          </Text>
          <Text style={{ margin: 0, fontSize: '14px', color: '#444', lineHeight: '1.6', fontStyle: 'italic', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            "{analyseTekst}"
          </Text>
        </div>

        <EmailButton href={dierUrl}>Bekijk match in het portaal →</EmailButton>
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '0 40px' }} />

      <Section style={{ padding: '20px 40px' }}>
        <Text style={{ margin: 0, fontSize: '12px', color: '#aaa', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Je ontvangt deze melding omdat {adoptantNaam} een hoge AI-match heeft met een dier in jouw asiel.
          Login op{' '}
          <a href={process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pootgelukkig.nl'} style={{ color: '#33335c' }}>
            pootgelukkig.nl
          </a>{' '}
          om te reageren.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default MatchAlert
