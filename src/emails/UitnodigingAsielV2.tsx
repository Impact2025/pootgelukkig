import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface UitnodigingAsielV2Props {
  asielNaam: string
  stad: string
  aanmeldUrl: string
  demoUrl: string
  afmeldUrl: string
}

const voordelen = [
  {
    icon: '🎯',
    titel: 'Minder telefoontjes',
    beschrijving: 'Adoptanten doorlopen een AI-intake over hun leefstijl. Jullie krijgen alleen een melding bij een sterke match — geen tijdverspilling meer.',
  },
  {
    icon: '⚡',
    titel: 'Sneller beslissen',
    beschrijving: 'Per aanvraag zie je een match-score met uitleg. Je herkent in één oogopslag de kansrijke kandidaten.',
  },
  {
    icon: '💚',
    titel: 'Gratis voor asielen',
    beschrijving: 'PootGelukkig is een initiatief van WeAreImpact. Aanmelden kost niets, opzeggen kan altijd.',
  },
]

export function UitnodigingAsielV2({ asielNaam, stad, aanmeldUrl, demoUrl, afmeldUrl }: UitnodigingAsielV2Props) {
  return (
    <EmailLayout preview={`${asielNaam} — 2 minuten die jullie werkdag veranderen 🐾`}>
      <EmailHeader label="Uitnodiging" />

      {/* Hero */}
      <Section style={{ background: 'linear-gradient(135deg, #33335c 0%, #1a1a3e 100%)', padding: '0 40px 40px', textAlign: 'center' }}>
        <Text style={{ margin: 0, fontSize: '40px', lineHeight: 1 }}>🐾</Text>
        <Text style={{ margin: '12px 0 8px', fontSize: '24px', fontWeight: 800, color: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Doen jullie mee, {asielNaam}?
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          PootGelukkig koppelt asieldieren in {stad} aan adoptiegezinnen die écht
          bij ze passen — met AI-matching, minder telefoontjes en gratis voor asielen.
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

      {/* Demo video CTA */}
      <Section style={{ padding: '0 40px 24px', textAlign: 'center' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ background: '#f9fafb', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <Text style={{ margin: '0 0 4px', fontSize: '18px', lineHeight: 1 }}>🎬</Text>
              <Text style={{ margin: '8px 0 4px', fontSize: '15px', fontWeight: 700, color: '#33335c', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                Bekijk de demo (2 minuten)
              </Text>
              <Text style={{ margin: '0 0 12px', fontSize: '13px', color: '#666', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                Zie hoe het dashboard eruit ziet voor een asiel — dier toevoegen,
                aanvraag binnen, match-score bekijken.
              </Text>
              <EmailButton href={demoUrl}>🎬 Demo bekijken →</EmailButton>
            </td>
          </tr>
        </table>
      </Section>

      {/* Voordelen */}
      <Section style={{ padding: '8px 40px 8px' }}>
        <Text style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#33335c', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Wat het jullie oplevert:
        </Text>
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
        <Text style={{ margin: '0 0 16px', fontSize: '14px', color: '#555', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Klinkt goed? Meld je asiel direct aan — het duurt 30 seconden.
        </Text>
        <EmailButton href={aanmeldUrl}>Gratis asiel aanmelden →</EmailButton>
      </Section>

      {/* Afmelden */}
      <Section style={{ padding: '0 40px 40px' }}>
        <Text style={{ margin: 0, fontSize: '11px', color: '#aaa', lineHeight: '1.5', textAlign: 'center', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Je ontvangt deze uitnodiging omdat {asielNaam} een erkend
          dierenasiel is. Geen interesse?{' '}
          <a href={afmeldUrl} style={{ color: '#999', textDecoration: 'underline' }}>
            Klik hier om je af te melden
          </a>
          {' '}— dan benaderen we je niet meer.
        </Text>
      </Section>
    </EmailLayout>
  )
}

export default UitnodigingAsielV2
