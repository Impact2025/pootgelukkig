import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Font,
} from '@react-email/components'
import * as React from 'react'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="nl">
      <Head>
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Plus Jakarta Sans"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_pw7NSg.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body style={{ backgroundColor: '#f4f4f7', margin: 0, padding: 0, fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          <Container style={{ maxWidth: '560px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            {children}
          </Container>
          <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 0 48px' }}>
            <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', margin: 0 }}>
              ImpactOS · Een initiatief van WeAreImpact
            </p>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
