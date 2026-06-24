import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import {
  ARTIKELEN,
  categorieBySlug,
  artikelBySlug,
  artikelenVoorCategorie,
} from '@/lib/kennisbank/content'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'

export function generateStaticParams() {
  return ARTIKELEN.map((a) => ({ categorie: a.categorieSlug, slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorie: string; slug: string }>
}): Promise<Metadata> {
  const { categorie, slug } = await params
  const artikel = artikelBySlug(categorie, slug)
  if (!artikel) return { title: 'Artikel niet gevonden — PootGelukkig' }
  const url = `${APP_URL}/kennisbank/${categorie}/${slug}`
  return {
    title: `${artikel.titel} — Kennisbank — PootGelukkig`,
    description: artikel.samenvatting,
    alternates: { canonical: url },
    openGraph: {
      title: artikel.titel,
      description: artikel.samenvatting,
      url,
      type: 'article',
    },
  }
}

export default async function KennisArtikelPage({
  params,
}: {
  params: Promise<{ categorie: string; slug: string }>
}) {
  const { categorie, slug } = await params
  const cat = categorieBySlug(categorie)
  const artikel = artikelBySlug(categorie, slug)
  if (!cat || !artikel) notFound()

  const html = await marked.parse(artikel.inhoudMd)
  const overige = artikelenVoorCategorie(categorie).filter((a) => a.slug !== slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: artikel.titel,
    description: artikel.samenvatting,
    dateModified: new Date(artikel.bijgewerkt).toISOString(),
    author: { '@type': 'Organization', name: 'PootGelukkig' },
    publisher: { '@type': 'Organization', name: 'PootGelukkig' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${APP_URL}/kennisbank/${categorie}/${slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kennisbank', item: `${APP_URL}/kennisbank` },
      { '@type': 'ListItem', position: 2, name: cat.naam, item: `${APP_URL}/kennisbank/${categorie}` },
      { '@type': 'ListItem', position: 3, name: artikel.titel, item: `${APP_URL}/kennisbank/${categorie}/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
        <nav aria-label="Kruimelpad" className="text-sm font-semibold text-[#33335c]/45">
          <Link href="/kennisbank" className="hover:text-[#33335c]">Kennisbank</Link>
          <span className="px-2">/</span>
          <Link href={`/kennisbank/${categorie}`} className="hover:text-[#33335c]">{cat.naam}</Link>
        </nav>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#33335c]">
          {artikel.titel}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[#33335c]/65">{artikel.samenvatting}</p>

        <div
          className="blog-inhoud mt-8 leading-relaxed text-[#33335c]/80"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {overige.length > 0 && (
          <div className="mt-14 border-t border-[#33335c]/8 pt-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#33335c]/40">
              Meer in {cat.naam}
            </h2>
            <div className="mt-4 space-y-2">
              {overige.map((a) => (
                <Link
                  key={a.slug}
                  href={`/kennisbank/${categorie}/${a.slug}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#33335c]/8 bg-white px-5 py-4 transition-colors hover:border-[#33335c]/20"
                >
                  <span className="text-[15px] font-semibold text-[#33335c]">{a.titel}</span>
                  <span className="material-symbols-outlined text-[#33335c]/40">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-14 rounded-[2rem] bg-[#33335c] p-8 text-center">
          <p className="text-lg font-extrabold text-white">Klaar om jouw maatje te vinden?</p>
          <p className="mb-5 mt-1 text-sm text-white/60">
            Doe de gratis intake en ontdek welk asieldier bij jou past.
          </p>
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 rounded-full bg-[#ee5b2b] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#d94e22]"
          >
            Start de intake
            <span className="material-symbols-outlined text-[1.1rem]">arrow_forward</span>
          </Link>
        </div>
      </article>
    </>
  )
}
