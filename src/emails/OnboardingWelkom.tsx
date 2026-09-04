import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface OnboardingWelkomProps {
  organisatieNaam: string
  contactNaam: string
  geactiveerdeRollen: string[]
  dashboardUrl: string
}

export function OnboardingWelkom({ organisatieNaam, contactNaam, geactiveerdeRollen, dashboardUrl }: OnboardingWelkomProps) {
  return (
    <EmailLayout preview={`${organisatieNaam} is ingericht op ImpactOS — je AI-collega's staan klaar`}>
      <EmailHeader label="Onboarding afgerond" />

      <Section style={{ padding: '32px 40px 8px' }}>
        <Text style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 800, color: '#1E293B', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Welkom bij ImpactOS, {contactNaam}
        </Text>
        <Text style={{ margin: '0 0 16px', fontSize: '14px', color: '#555', lineHeight: '1.7', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Noor heeft het intakegesprek met {organisatieNaam} afgerond en het platform op basis
          daarvan ingericht. Op basis van wat je vertelde staan deze AI-collega&apos;s klaar:
        </Text>
        {geactiveerdeRollen.length > 0 && (
          <Text style={{ margin: '0 0 16px', fontSize: '14px', color: '#1E293B', lineHeight: '1.9', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            {geactiveerdeRollen.map((r) => `• ${r}`).join('\n')}
          </Text>
        )}
        <Text style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.7', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Elk concept dat ze schrijven — een rapportage, een subsidieaanvraag, een social post —
          wacht op jouw akkoord in de wachtrij voor het de deur uitgaat. Niets vertrekt automatisch.
        </Text>
      </Section>

      <Section style={{ padding: '28px 40px', textAlign: 'center' }}>
        <EmailButton href={dashboardUrl}>Naar het dashboard →</EmailButton>
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '8px 40px 24px' }} />

      <Section style={{ padding: '0 40px 40px' }}>
        <Text style={{ margin: 0, fontSize: '12px', color: '#999', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Profiel niet helemaal kloppend? Je past het gesprek met Noor op elk moment aan via
          Instellingen. Werkt de knop niet? Kopieer dan deze link in je browser:<br />
          <span style={{ color: '#1E293B', wordBreak: 'break-all' }}>{dashboardUrl}</span>
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default OnboardingWelkom
