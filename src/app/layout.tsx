import type { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ToastProvider } from '@/components/ui/Toaster'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'ImpactOS — Minder bureaucratie, meer maatschappelijke impact',
  description: 'ImpactOS (onderdeel van WeAreImpact) is het AI-gestuurde platform voor sociaal ondernemers en zorgkwartiermakers.',
  keywords: ['sociaal domein', 'maatschappelijk ondernemen', 'AI', 'zorgkwartiermakers', 'impact'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'ImpactOS',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'ImpactOS',
    description: 'Minder bureaucratie, meer maatschappelijke impact',
    locale: 'nl_NL',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
    { media: '(prefers-color-scheme: light)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className="dark">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="bg-bg-dark text-white font-display antialiased">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
        <GoogleAnalytics gaId="G-LRTEECBPQN" />
      </body>
    </html>
  )
}
