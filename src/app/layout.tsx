import type { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ToastProvider } from '@/components/ui/Toaster'
import { AIAssistentWidget } from '@/components/AIAssistentWidget'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.pootgelukkig.nl'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'PootGelukkig — Vind jouw perfecte match',
  description: 'AI-gestuurde matching tussen mensen en asieldieren. Bedacht door Maya van Munster.',
  keywords: ['dierenasiel', 'adoptie', 'hond', 'kat', 'matching', 'AI'],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'PootGelukkig',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'PootGelukkig',
    description: 'Vind jouw perfecte asieldier via AI-matching',
    locale: 'nl_NL',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#33335c' },
    { media: '(prefers-color-scheme: light)', color: '#33335c' },
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
          <AIAssistentWidget />
        </Providers>
        <GoogleAnalytics gaId="G-LRTEECBPQN" />
      </body>
    </html>
  )
}
