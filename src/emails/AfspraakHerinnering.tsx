import { Section, Text, Hr } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/EmailLayout'
import { EmailHeader } from './components/EmailHeader'
import { EmailButton } from './components/EmailButton'

interface AfspraakHerinnering {
  ontvangerNaam: string
  dierNaam: string
  dierSoort: string
  asielNaam: string
  asielAdres: string
  afspraakDatum: Date
  portaalUrl: string
  rol: 'adoptant' | 'asiel'
}

const soortEmoji: Record<string, string> = { hond: '🐕', kat: '🐈', vogel: '🦜', konijn: '🐇', cavia: '🐹', overig: '🐾' }

function formatDatum(datum: Date) {
  return datum.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTijd(datum: Date) {
  return datum.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
}

export function AfspraakHerinnering({
  ontvangerNaam,
  dierNaam,
  dierSoort,
  asielNaam,
  asielAdres,
  afspraakDatum,
  portaalUrl,
  rol,
}: AfspraakHerinnering) {
  const emoji = soortEmoji[dierSoort] ?? '🐾'
  const isAdoptant = rol === 'adoptant'

  return (
    <EmailLayout preview={`Morgen: je afspraak bij ${asielNaam} voor ${dierNaam} om ${formatTijd(afspraakDatum)}`}>
      <EmailHeader label="Afspraak herinnering" />

      {/* Hero */}
      <Section style={{ padding: '40px 40px 24px', textAlign: 'center' }}>
        <Text style={{ margin: '0 0 8px', fontSize: '48px', lineHeight: 1 }}>{emoji}</Text>
        <Text style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          Morgen is het zover, {ontvangerNaam}!
        </Text>
        <Text style={{ margin: 0, fontSize: '14px', color: '#666', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {isAdoptant
            ? `Je ontmoet ${dierNaam} bij ${asielNaam}.`
            : `${ontvangerNaam} komt kennismaken met ${dierNaam}.`}
        </Text>
      </Section>

      {/* Afspraak details */}
      <Section style={{ padding: '0 40px 32px' }}>
        <div style={{ background: '#f8f8fb', borderRadius: '14px', overflow: 'hidden', border: '1px solid #ebebf0' }}>
          {[
            { icon: '📅', label: 'Datum', waarde: formatDatum(afspraakDatum) },
            { icon: '⏰', label: 'Tijd', waarde: formatTijd(afspraakDatum) },
            { icon: '📍', label: 'Locatie', waarde: asielAdres || asielNaam },
          ].map((item, i) => (
            <div key={item.label} style={{ padding: '14px 20px', borderBottom: i < 2 ? '1px solid #ebebf0' : 'none' }}>
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td width="32">
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    </td>
                    <td>
                      <Text style={{ margin: 0, fontSize: '11px', color: '#aaa', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                        {item.label}
                      </Text>
                      <Text style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1a1a2e', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                        {item.waarde}
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </Section>

      {isAdoptant && (
        <Section style={{ padding: '0 40px 32px' }}>
          <div style={{ background: 'rgba(248,170,37,0.06)', borderRadius: '12px', padding: '16px 20px', border: '1px solid rgba(248,170,37,0.2)' }}>
            <Text style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: '#d97706', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
              💡 Tips voor de kennismaking
            </Text>
            <Text style={{ margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.6', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
              Neem rustig de tijd. Laat {dierNaam} zelf naar je toe komen.
              Stel vragen aan de medewerker over het gedrag en de routine van {dierNaam}.
            </Text>
          </div>
        </Section>
      )}

      <Section style={{ padding: '0 40px 40px', textAlign: 'center' }}>
        <EmailButton href={portaalUrl}>Bekijk afspraak in portaal →</EmailButton>
      </Section>
    </EmailLayout>
  )
}

export default AfspraakHerinnering
