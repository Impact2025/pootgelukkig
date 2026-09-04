import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/auth'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { portfolioSameAs } from '@/lib/seo-kit'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl'

export const metadata: Metadata = {
  openGraph: {
    siteName: 'ImpactOS',
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
      name: 'ImpactOS',
      url: APP_URL,
      logo: `${APP_URL}/favicon.svg`,
      description:
        'AI-gestuurd platform voor sociaal ondernemers en zorgkwartiermakers. Minder bureaucratie, meer maatschappelijke impact.',
      parentOrganization: { '@type': 'Organization', name: 'WeAreImpact' },
      sameAs: [...portfolioSameAs],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ImpactOS',
      url: APP_URL,
      inLanguage: 'nl-NL',
    },
  ]

  return (
    <div className="light min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a
        href="#hoofdinhoud"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#1E293B] focus:px-5 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
      >
        Naar hoofdinhoud
      </a>
      <MarketingNav isLoggedIn={Boolean(session?.user)} />
      <main id="hoofdinhoud">{children}</main>
      <MarketingFooter />
    </div>
  )
}
