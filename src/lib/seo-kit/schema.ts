// ─────────────────────────────────────────────────────────────────────────
// seo-kit — drop-in JSON-LD builders (geen dependencies)
// Copy deze map naar ELKE Next.js-site: src/lib/seo-kit/
// Render elk object via:
//   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
// ─────────────────────────────────────────────────────────────────────────

export interface FaqItem {
  question: string
  answer: string
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface ArticleInput {
  url: string
  headline: string
  description: string
  image: string
  datePublished: string
  dateModified: string
  authorName: string
  publisherName: string
  publisherLogo: string
}

export function organizationSchema(i: {
  name: string
  url: string
  logo: string
  description: string
  email?: string
  foundingDate?: string
  areaServed?: string
  founderName?: string
  founderUrl?: string
  sameAs?: string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: i.name,
    url: i.url,
    logo: i.logo,
    description: i.description,
    ...(i.email ? { email: i.email } : {}),
    ...(i.foundingDate ? { foundingDate: i.foundingDate } : {}),
    ...(i.areaServed ? { areaServed: i.areaServed } : {}),
    ...(i.founderName
      ? {
          founder: {
            '@type': 'Person',
            name: i.founderName,
            ...(i.founderUrl ? { url: i.founderUrl } : {}),
          },
        }
      : {}),
    ...(i.sameAs?.length ? { sameAs: i.sameAs } : {}),
  }
}

export function websiteSchema(i: {
  name: string
  url: string
  description: string
  searchUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: i.name,
    url: i.url,
    description: i.description,
    ...(i.searchUrl
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${i.searchUrl}?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }
      : {}),
  }
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  }
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

export function articleSchema(i: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: i.headline,
    description: i.description,
    image: i.image,
    datePublished: i.datePublished,
    dateModified: i.dateModified,
    author: { '@type': 'Person', name: i.authorName },
    publisher: {
      '@type': 'Organization',
      name: i.publisherName,
      logo: { '@type': 'ImageObject', url: i.publisherLogo },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': i.url },
  }
}
