// ─────────────────────────────────────────────────────────────────────────
// seo-kit / entity-graph.ts — cross-site entity map (WV4: cross-site authority)
// Eén bron van waarheid voor de Vincent van Munster / WeAreImpact-entiteit en
// het hele portfolio. Importeer in elke site's Organization-schema als `sameAs`
// zodat Google de sites als één autoriteits-netwerk ziet.
//
// Gebruik:
//   import { portfolioSameAs, weAreImpactEntity } from '@/lib/seo-kit/entity-graph'
//   sameAs: [...portfolioSameAs]   // in je Organization JSON-LD
// ─────────────────────────────────────────────────────────────────────────

export const VINCENT = {
  '@type': 'Person',
  name: 'Vincent van Munster',
  url: 'https://weareimpact.nl',
  sameAs: [
    'https://www.linkedin.com/in/vincentvanmunster',
    // voeg eventueel andere profielen toe
  ],
} as const

// Het portfolio als één netwerk: elke site linkt naar de andere via sameAs.
export const portfolioSameAs: string[] = [
  'https://weareimpact.nl',
  'https://pootgelukkig.nl',
  'https://bewaardvoorjou.nl',
  'https://ictusgo.nl',
  'https://daar.nl',
  'https://skillkaart.nl',
  'https://bijeen.app',
  'https://steentjebijsteentje.nl',
  'https://vrijwilligersmatch.nl',
  'https://liefdevooriedereen.nl',
  'https://teambuildingmetimpact.nl',
  'https://datingassistent.nl',
  'https://vaarsamen.nl',
  'https://welzijnsklik.nl',
  'https://samenmakers.nl',
]

// Moeder-entiteit voor sub-merken (Pootgelukkig, BewaardVoorJou, IctusGo, etc.)
export const weAreImpactEntity = {
  '@type': 'Organization',
  name: 'WeAreImpact',
  url: 'https://weareimpact.nl',
  sameAs: portfolioSameAs,
} as const
