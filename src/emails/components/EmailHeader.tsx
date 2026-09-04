import { Img, Section, Text } from '@react-email/components'
import * as React from 'react'

interface EmailHeaderProps {
  label?: string
}

export function EmailHeader({ label }: EmailHeaderProps) {
  return (
    <Section style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '32px 40px' }}>
      <table width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td>
              <Text style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                ImpactOS
              </Text>
              <Text style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                AI-gestuurd platform voor het sociaal domein
              </Text>
            </td>
            {label && (
              <td style={{ textAlign: 'right' }}>
                <span style={{ background: 'rgba(37,99,235,0.2)', color: '#93C5FD', fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', border: '1px solid rgba(37,99,235,0.3)', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
                  {label}
                </span>
              </td>
            )}
          </tr>
        </tbody>
      </table>
    </Section>
  )
}
