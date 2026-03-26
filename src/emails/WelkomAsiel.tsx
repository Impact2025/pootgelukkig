import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface WelkomAsielProps {
  asielNaam: string
  contactpersoonNaam: string
  loginUrl: string
}

const stappen = [
  { nummer: '1', titel: 'Voeg je dieren toe', beschrijving: 'Per dier vul je een gedragsprofiel in. De AI gebruikt dit voor de matching.' },
  { nummer: '2', titel: 'Adoptanten doen intake', beschrijving: 'Mensen die bij jullie willen adopteren doorlopen onze AI-intake.' },
  { nummer: '3', titel: 'Matches komen vanzelf', beschrijving: 'Jullie krijgen een melding zodra er een hoge match is. Geen telefoon, geen papierwerk.' },
]

export function WelkomAsiel({ asielNaam, contactpersoonNaam, loginUrl }: WelkomAsielProps) {
  return (
    <EmailLayout preview={`Welkom bij PootGelukkig, ${asielNaam}! Zo werkt het platform.`}>
      <EmailHeader label="Welkom" />

      {/* Hero */}
      <Section style={{ background: 'linear-gradient(135deg, #33335c 0%, #1a1a3e 100%)', padding: '0 40px 40px', textAlign: 'center' }}>
        <Text style={{ margin: 0, fontSize: '40px', lineHeight: 1 }}>🎉</Text>
        <Text style={{ margin: '12px 0 8px', fontSize: '24px', fontWeight: 800, color: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {asielNaam} is live!
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Hallo {contactpersoonNaam}, jullie asiel staat nu in PootGelukkig.<br />
          Zo werkt het platform in 3 stappen.
        </Text>
      </Section>

      {/* Stappen */}
      <Section style={{ padding: '32px 40px 8px' }}>
        {stappen.map((stap) => (
          <div key={stap.nummer} style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flexShrink: 0, width: '36px', height: '36px', borderRadius: '10px', background: '#f8aa25', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#33335c', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>{stap.nummer}</span>
            </div>
            <div>
              <Text style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {stap.titel}
              </Text>
              <Text style={{ margin: 0, fontSize: '13px', color: '#666', lineHeight: '1.5', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                {stap.beschrijving}
              </Text>
            </div>
          </div>
        ))}
      </Section>

      <Hr style={{ borderColor: '#ebebf0', margin: '8px 40px 28px' }} />

      {/* USP */}
      <Section style={{ padding: '0 40px 32px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(248,170,37,0.08), rgba(248,170,37,0.04))', borderRadius: '12px', padding: '20px', border: '1px solid rgba(248,170,37,0.2)' }}>
          <Text style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#f8aa25', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            💡 Waarom PootGelukkig werkt
          </Text>
          <Text style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
            Wij matchen op gedrag en leefstijl — niet op uiterlijk of impuls. Dat betekent minder terugplaatsingen,
            minder werkdruk voor jullie team, en gelukkigere adopties.
          </Text>
        </div>
      </Section>

      <Section style={{ padding: '0 40px 40px', textAlign: 'center' }}>
        <EmailButton href={loginUrl}>Open het asiel portaal →</EmailButton>
      </Section>
    </EmailLayout>
  )
}

export default WelkomAsiel
