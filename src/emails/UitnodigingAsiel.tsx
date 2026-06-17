import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface UitnodigingAsielProps {
  asielNaam: string
  stad: string
  aanmeldUrl: string
  afmeldUrl: string
}

const voordelen = [
  {
    icon: '🎯',
    titel: 'Matchen op gedrag, niet op uiterlijk',
    beschrijving: 'Adoptanten doorlopen een AI-intake over hun leefstijl. Wij koppelen ze aan het dier dat écht past — minder terugplaatsingen.',
  },
  {
    icon: '⏱️',
    titel: 'Minder werkdruk voor jullie team',
    beschrijving: 'Geen eindeloze telefoontjes meer. Jullie krijgen alleen een melding bij een sterke match.',
  },
  {
    icon: '💚',
    titel: 'Gratis voor asielen',
    beschrijving: 'PootGelukkig is een initiatief om adoptie te verbeteren. Aanmelden kost niets.',
  },
]

export function UitnodigingAsiel({ asielNaam, stad, aanmeldUrl, afmeldUrl }: UitnodigingAsielProps) {
  return (
    <EmailLayout preview={`${asielNaam} — help dieren sneller aan het juiste thuis met PootGelukkig`}>
      <EmailHeader label="Uitnodiging" />

      {/* Hero */}
      <Section style={{ background: 'linear-gradient(135deg, #33335c 0%, #1a1a3e 100%)', padding: '0 40px 40px', textAlign: 'center' }}>
        <Text style={{ margin: 0, fontSize: '40px', lineHeight: 1 }}>🐾</Text>
        <Text style={{ margin: '12px 0 8px', fontSize: '24px', fontWeight: 800, color: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Doen jullie mee, {asielNaam}?
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          PootGelukkig koppelt asieldieren in {stad} aan adoptiegezinnen die écht
          bij ze passen — met behulp van AI.
        </Text>
      </Section>

      {/* Intro */}
      <Section style={{ padding: '32px 40px 8px' }}>
        <Text style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.7', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          PootGelukkig is bedacht door de 13-jarige Maya van Munster en gebouwd door
          WeAreImpact. Ons doel: minder dieren die terugkomen, meer adopties die voor
          altijd zijn. We nodigen {asielNaam} graag uit om kosteloos aan te sluiten.
        </Text>
      </Section>

      {/* Voordelen */}
      <Section style={{ padding: '24px 40px 8px' }}>
        {voordelen.map((v) => (
          <div key={v.titel} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: '#f8aa25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px' }}>{v.icon}</span>
            </div>
            <div>
              <Text style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {v.titel}
              </Text>
              <Text style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {v.beschrijving}
              </Text>
            </div>
          </div>
        ))}
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '8px 40px 28px' }} />

      <Section style={{ padding: '0 40px 32px', textAlign: 'center' }}>
        <EmailButton href={aanmeldUrl}>Asiel gratis aanmelden →</EmailButton>
      </Section>

      {/* Afmelden */}
      <Section style={{ padding: '0 40px 40px' }}>
        <Text style={{ margin: 0, fontSize: '11px', color: '#aaa', lineHeight: '1.5', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Je ontvangt deze eenmalige uitnodiging omdat {asielNaam} een erkend
          dierenasiel is. Geen interesse?{' '}
          <a href={afmeldUrl} style={{ color: '#999', textDecoration: 'underline' }}>
            Klik hier om je af te melden
          </a>{' '}
          — dan benaderen we je niet meer.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default UitnodigingAsiel
