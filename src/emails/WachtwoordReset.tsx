import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface WachtwoordResetProps {
  naam: string
  resetUrl: string
  geldigMinuten: number
}

export function WachtwoordReset({ naam, resetUrl, geldigMinuten }: WachtwoordResetProps) {
  return (
    <EmailLayout preview="Stel een nieuw wachtwoord in voor je ImpactOS-account">
      <EmailHeader label="Beveiliging" />

      <Section style={{ padding: '32px 40px 8px' }}>
        <Text style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Wachtwoord opnieuw instellen
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.7', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Hallo {naam},<br /><br />
          Je hebt aangevraagd om je wachtwoord opnieuw in te stellen. Klik op de knop
          hieronder om een nieuw wachtwoord te kiezen. Deze link is{' '}
          <strong>{geldigMinuten} minuten</strong> geldig.
        </Text>
      </Section>

      <Section style={{ padding: '28px 40px', textAlign: 'center' }}>
        <EmailButton href={resetUrl}>Nieuw wachtwoord instellen →</EmailButton>
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '8px 40px 24px' }} />

      <Section style={{ padding: '0 40px 40px' }}>
        <Text style={{ margin: 0, fontSize: '12px', color: '#999', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren — je wachtwoord
          blijft ongewijzigd. Werkt de knop niet? Kopieer dan deze link in je browser:<br />
          <span style={{ color: '#33335c', wordBreak: 'break-all' }}>{resetUrl}</span>
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default WachtwoordReset
