import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'

export const metadata: Metadata = {
  openGraph: {
    siteName: 'PootGelukkig',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'PootGelukkig',
      url: APP_URL,
      logo: `${APP_URL}/favicon.svg`,
      description:
        'AI-gestuurde matching die asiels helpt om de juiste adoptant bij het juiste dier te vinden.',
      parentOrganization: { '@type': 'Organization', name: 'WeAreImpact' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'PootGelukkig',
      url: APP_URL,
      inLanguage: 'nl-NL',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${APP_URL}/zoeken?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ]

  return (
    <div className="light min-h-screen bg-[#f9fafb] text-[#33335c]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#33335c] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        Naar hoofdinhoud
      </a>
      <MarketingNav isLoggedIn={Boolean(session?.user)} />
      <main id="hoofdinhoud">{children}</main>
      <MarketingFooter />
    </div>
  )
}
