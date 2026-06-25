import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import {
  ARTIKELEN,
  CATEGORIEEN,
  categorieBySlug,
  artikelBySlug,
  artikelenVoorCategorie,
} from '@/lib/kennisbank/content'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'

type TocEntry = { id: string; text: string; level: number }

function slugifyHeading(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function analyseerInhoud(inhoudMd: string) {
  const toc: TocEntry[] = []
  const faqItems: { vraag: string; antwoord: string }[] = []
  const howtoSteps: { name: string; text: string }[] = []

  let inFaq = false
  let huidigeFaqVraag = ''
  let huidigeFaqAntwoord = ''

  const lijnen = inhoudMd.split('\n')
  for (let i = 0; i < lijnen.length; i++) {
    const l = lijnen[i]
    const h2Match = l.match(/^##\s+(.+)/)
    const h3Match = l.match(/^###\s+(.+)/)

    if (h2Match) {
      const txt = h2Match[1].replace(/\*\*/g, '').trim()
      toc.push({ id: slugifyHeading(txt), text: txt, level: 2 })
      if (inFaq && huidigeFaqVraag && huidigeFaqAntwoord) {
        faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
      }
      inFaq = /vraag|vragen|faq/i.test(h2Match[1])
      huidigeFaqVraag = ''
      huidigeFaqAntwoord = ''

      // HowTo detectie ook voor H2 (bv. "Stap 1:")
      const volgendeLijnH2 = lijnen[i + 1]?.trim() || ''
      if (volgendeLijnH2.match(/^\d+\.\s/)) {
        let stepText = ''
        let j = i + 1
        while (j < lijnen.length && lijnen[j].trim().match(/^\d+\.\s/)) {
          stepText += lijnen[j].trim().replace(/^\d+\.\s+/, '') + ' '
          j++
        }
        if (stepText) howtoSteps.push({ name: txt, text: stepText.trim().substring(0, 200) })
      }
    }
    if (h3Match) {
      const txt = h3Match[1].replace(/\*\*/g, '').trim()
      toc.push({ id: slugifyHeading(txt), text: txt, level: 3 })
      if (inFaq) {
        if (huidigeFaqVraag && huidigeFaqAntwoord) {
          faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
        }
        huidigeFaqVraag = txt.endsWith('?') ? txt : txt + '?'
        huidigeFaqAntwoord = ''
      }
      const volgendeLijn = lijnen[i + 1]?.trim() || ''
      if (volgendeLijn.match(/^\d+\.\s/)) {
        let stepText = ''
        let j = i + 1
        while (j < lijnen.length && lijnen[j].trim().match(/^\d+\.\s/)) {
          stepText += lijnen[j].trim().replace(/^\d+\.\s+/, '') + ' '
          j++
        }
        if (stepText) howtoSteps.push({ name: txt, text: stepText.trim().substring(0, 200) })
      }
    }
    if (inFaq && huidigeFaqVraag && !l.match(/^#{1,3}\s/) && l.trim() && !l.match(/^>\s/)) {
      huidigeFaqAntwoord += l.trim() + ' '
    }
  }
  if (inFaq && huidigeFaqVraag && huidigeFaqAntwoord) {
    faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
  }
  return { toc, faqItems, howtoSteps }
}

function postProcessHtml(html: string): string {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, (_, content) => {
      const txt = content.replace(/<[^>]*>/g, '')
      return `<h2 id="${slugifyHeading(txt)}">${content}</h2>`
    })
    .replace(/<h3>(.*?)<\/h3>/g, (_, content) => {
      const txt = content.replace(/<[^>]*>/g, '')
      return `<h3 id="${slugifyHeading(txt)}">${content}</h3>`
    })
}

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

  let html = await marked.parse(artikel.inhoudMd)
  html = postProcessHtml(html)

  const { toc, faqItems, howtoSteps } = analyseerInhoud(artikel.inhoudMd)
  const heeftToC = toc.length > 2
  const overige = artikelenVoorCategorie(categorie).filter((a) => a.slug !== slug)

  // Schema
  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: artikel.titel,
      description: artikel.samenvatting,
      dateModified: new Date(artikel.bijgewerkt).toISOString(),
      author: { '@type': 'Organization', name: 'PootGelukkig' },
      publisher: { '@type': 'Organization', name: 'PootGelukkig' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${APP_URL}/kennisbank/${categorie}/${slug}` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Kennisbank', item: `${APP_URL}/kennisbank` },
        { '@type': 'ListItem', position: 2, name: cat.naam, item: `${APP_URL}/kennisbank/${categorie}` },
        { '@type': 'ListItem', position: 3, name: artikel.titel, item: `${APP_URL}/kennisbank/${categorie}/${slug}` },
      ],
    },
  ]

  if (faqItems.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.vraag,
        acceptedAnswer: { '@type': 'Answer', text: f.antwoord.substring(0, 500) },
      })),
    })
  }

  if (howtoSteps.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: artikel.titel,
      description: artikel.samenvatting,
      step: howtoSteps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    })
  }

  const aantallen = CATEGORIEEN.filter((c) => c.doelgroep === cat.doelgroep && c.slug !== cat.slug)
    .map((c) => ({ ...c, count: artikelenVoorCategorie(c.slug).length }))
    .filter((c) => c.count > 0)

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <article className="mx-auto w-full px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <nav aria-label="Kruimelpad" className="mb-6 text-sm font-semibold text-[#33335c]/45">
            <Link href="/kennisbank" className="hover:text-[#33335c]">Kennisbank</Link>
            <span className="px-2">/</span>
            <Link href={`/kennisbank/${categorie}`} className="hover:text-[#33335c]">{cat.naam}</Link>
          </nav>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#33335c]">
            {artikel.titel}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-[#33335c]/40">
            <span>Bijgewerkt: {new Date(artikel.bijgewerkt).toLocaleDateString('nl-NL', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}</span>
            <span className="size-1 rounded-full bg-[#33335c]/20" />
            <span>{Math.ceil(artikel.inhoudMd.split(/\s+/).length / 200)} min lezen</span>
          </div>

          <p className="mt-4 text-lg leading-relaxed text-[#33335c]/65">{artikel.samenvatting}</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl gap-8">
          {heeftToC && (
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-24">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-[#33335c]/35">Inhoud</p>
                <nav className="space-y-1.5">
                  {toc.map((entry) => (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className={`block text-sm leading-snug transition-colors hover:text-[#ee5b2b] ${
                        entry.level === 2 ? 'font-semibold text-[#33335c]/70' : 'pl-4 text-[#33335c]/50'
                      }`}
                    >
                      {entry.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            <div
              className="blog-inhoud leading-relaxed text-[#33335c]/80"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Feedback widget */}
            <div className="mt-10 rounded-2xl border border-[#33335c]/8 bg-[#f9fafb] p-5 text-center">
              <p className="text-sm font-semibold text-[#33335c]/60">
                Was dit artikel nuttig?
              </p>
              <div className="mt-2 flex justify-center gap-3">
                <span className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#33335c]/60 shadow-sm border border-[#33335c]/8">
                  👍 Ja
                </span>
                <span className="inline-flex cursor-default items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-[#33335c]/60 shadow-sm border border-[#33335c]/8">
                  👎 Nee
                </span>
              </div>
            </div>

            {/* Gerelateerde categorieën */}
            {aantallen.length > 0 && (
              <div className="mt-10">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#33335c]/35">Meer in {cat.doelgroep === 'adoptant' ? 'voor adoptanten' : cat.doelgroep === 'asiel' ? 'voor asiels' : 'over PootGelukkig'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {aantallen.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/kennisbank/${c.slug}`}
                      className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#33335c]/60 shadow-sm border border-[#33335c]/8 hover:border-[#33335c]/20 transition-colors"
                    >
                      {c.naam} ({c.count})
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Overige artikelen in deze categorie */}
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

            {/* CTA */}
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
          </div>
        </div>
      </article>
    </>
  )
}
