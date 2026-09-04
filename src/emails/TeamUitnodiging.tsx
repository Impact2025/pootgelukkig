import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface TeamUitnodigingProps {
  organisatieNaam: string
  uitgenodigdDoorNaam: string
  accepteerUrl: string
  geldigDagen: number
}

export function TeamUitnodiging({ organisatieNaam, uitgenodigdDoorNaam, accepteerUrl, geldigDagen }: TeamUitnodigingProps) {
  return (
    <EmailLayout preview={`${uitgenodigdDoorNaam} nodigt je uit voor ${organisatieNaam} op ImpactOS`}>
      <EmailHeader label="Teamuitnodiging" />

      <Section style={{ padding: '32px 40px 8px' }}>
        <Text style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 800, color: '#1E293B', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Je bent uitgenodigd voor {organisatieNaam}
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.7', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {uitgenodigdDoorNaam} heeft je uitgenodigd om samen te werken in ImpactOS namens{' '}
          <strong>{organisatieNaam}</strong>. Klik op de knop hieronder om je account aan te maken
          en meteen aan de slag te gaan met de dossiers, cliënten en AI-collega&apos;s van jullie
          organisatie. Deze uitnodiging is <strong>{geldigDagen} dagen</strong> geldig.
        </Text>
      </Section>

      <Section style={{ padding: '28px 40px', textAlign: 'center' }}>
        <EmailButton href={accepteerUrl}>Account aanmaken →</EmailButton>
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '8px 40px 24px' }} />

      <Section style={{ padding: '0 40px 40px' }}>
        <Text style={{ margin: 0, fontSize: '12px', color: '#999', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Verwachtte je deze uitnodiging niet? Dan kun je deze e-mail negeren. Werkt de knop niet?
          Kopieer dan deze link in je browser:<br />
          <span style={{ color: '#1E293B', wordBreak: 'break-all' }}>{accepteerUrl}</span>
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default TeamUitnodiging
