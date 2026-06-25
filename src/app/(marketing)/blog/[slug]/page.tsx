export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { db } from '@/lib/db'
import { blogPosts, blogCategorieen } from '@/lib/db/schema'
import { and, eq, desc, ne } from 'drizzle-orm'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function haalPost(slug: string) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'gepubliceerd')))
    .limit(1)
  return post ?? null
}

async function haalCategorie(id: number | null) {
  if (!id) return null
  const [cat] = await db
    .select()
    .from(blogCategorieen)
    .where(eq(blogCategorieen.id, id))
    .limit(1)
  return cat ?? null
}

async function haalGerelateerd(categorieId: number | null, huidigId: number) {
  if (!categorieId) return []
  return db
    .select({ id: blogPosts.id, titel: blogPosts.titel, slug: blogPosts.slug, coverUrl: blogPosts.coverUrl })
    .from(blogPosts)
    .where(and(eq(blogPosts.categorieId, categorieId), ne(blogPosts.id, huidigId), eq(blogPosts.status, 'gepubliceerd')))
    .orderBy(desc(blogPosts.gepubliceerdOp))
    .limit(3)
}

/** Haal alle gepubliceerde posts voor "verder lezen" cross-category */
async function haalRecentePosts(huidigId: number, limit = 3) {
  return db
    .select({ id: blogPosts.id, titel: blogPosts.titel, slug: blogPosts.slug, coverUrl: blogPosts.coverUrl })
    .from(blogPosts)
    .where(and(ne(blogPosts.id, huidigId), eq(blogPosts.status, 'gepubliceerd')))
    .orderBy(desc(blogPosts.gepubliceerdOp))
    .limit(limit)
}

type TocEntry = { id: string; text: string; level: number }

/** Bouw ToC + faq/howto schema uit de markdown */
function analyseerInhoud(inhoudMd: string, titel: string) {
  const zonderH1 = inhoudMd.replace(/^\s*#\s+.*(\r?\n)+/, '')
  const toc: TocEntry[] = []
  const faqItems: { vraag: string; antwoord: string }[] = []
  const howtoSteps: { name: string; text: string }[] = []

  let inFaq = false
  let huidigeFaqVraag = ''
  let huidigeFaqAntwoord = ''

  const lijnen = zonderH1.split('\n')
  for (let i = 0; i < lijnen.length; i++) {
    const l = lijnen[i]

    // ToC extractie
    const h2Match = l.match(/^##\s+(.+)/)
    const h3Match = l.match(/^###\s+(.+)/)
    if (h2Match) {
      const txt = h2Match[1].replace(/\*\*/g, '').trim()
      const id = slugifyHeading(txt)
      toc.push({ id, text: txt, level: 2 })
      // Reset FAQ state bij nieuwe H2
      if (inFaq && huidigeFaqVraag && huidigeFaqAntwoord) {
        faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
      }
      inFaq = h2Match[1].toLowerCase().includes('vraag') || h2Match[1].toLowerCase().includes('faq')
      huidigeFaqVraag = ''
      huidigeFaqAntwoord = ''
    }
    if (h3Match) {
      const txt = h3Match[1].replace(/\*\*/g, '').trim()
      const id = slugifyHeading(txt)
      toc.push({ id, text: txt, level: 3 })

      if (inFaq) {
        if (huidigeFaqVraag && huidigeFaqAntwoord) {
          faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
          huidigeFaqVraag = ''
          huidigeFaqAntwoord = ''
        }
        // Vraag is H3 in FAQ-sectie
        huidigeFaqVraag = txt.endsWith('?') ? txt : txt + '?'
      }

      // HowTo detectie: H3 gevolgd door genummerde lijst
      const volgendeLijn = lijnen[i + 1]?.trim() || ''
      if (volgendeLijn.match(/^\d+\.\s/)) {
        let stepText = ''
        let j = i + 1
        while (j < lijnen.length && lijnen[j].trim().match(/^\d+\.\s/)) {
          stepText += lijnen[j].trim().replace(/^\d+\.\s+/, '') + ' '
          j++
        }
        if (stepText) {
          howtoSteps.push({ name: txt, text: stepText.trim().substring(0, 200) })
        }
      }
    }

    // FAQ antwoord ophalen (paragraaf na H3 in FAQ-sectie)
    if (inFaq && huidigeFaqVraag && !l.match(/^#{1,3}\s/) && l.trim() && !l.match(/^>\s/)) {
      huidigeFaqAntwoord += l.trim() + ' '
    }
  }

  // Laatste FAQ item afsluiten
  if (inFaq && huidigeFaqVraag && huidigeFaqAntwoord) {
    faqItems.push({ vraag: huidigeFaqVraag, antwoord: huidigeFaqAntwoord.trim() })
  }

  return { toc, faqItems, howtoSteps }
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function postProcessHtml(html: string): string {
  // Voeg id's toe aan H2/H3 voor ToC anchors
  return html
    .replace(/<h2 id="([^"]*)">/g, (m, id) => {
      return m // already has id from marked
    })
    .replace(/<h2>(.*?)<\/h2>/g, (m, content) => {
      const txt = content.replace(/<[^>]*>/g, '')
      const id = slugifyHeading(txt)
      return `<h2 id="${id}">${content}</h2>`
    })
    .replace(/<h3>(.*?)<\/h3>/g, (m, content) => {
      const txt = content.replace(/<[^>]*>/g, '')
      const id = slugifyHeading(txt)
      return `<h3 id="${id}">${content}</h3>`
    })
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await haalPost(slug)
  if (!post) return { title: 'Artikel niet gevonden — PootGelukkig' }

  const ruweTitel = post.metaTitle || post.titel
  const titel = /pootgelukkig/i.test(ruweTitel) ? ruweTitel : `${ruweTitel} — PootGelukkig`
  const omschrijving = post.metaDescription || post.excerpt || ''
  const url = `${APP_URL}/blog/${post.slug}`

  return {
    title: titel,
    description: omschrijving,
    keywords: post.focusKeyword ? [post.focusKeyword] : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: titel,
      description: omschrijving,
      url,
      type: 'article',
      publishedTime: post.gepubliceerdOp ? new Date(post.gepubliceerdOp).toISOString() : undefined,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: titel,
      description: omschrijving,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await haalPost(slug)
  if (!post) notFound()

  const cat = await haalCategorie(post.categorieId)
  const gerelateerd = await haalGerelateerd(post.categorieId, post.id)
  const recent = gerelateerd.length < 3 ? await haalRecentePosts(post.id, 3 - gerelateerd.length) : []

  // Parse markdown
  const zonderTitel = post.inhoudMd.replace(/^\s*#\s+.*(\r?\n)+/, '')
  let html = await marked.parse(zonderTitel)
  html = postProcessHtml(html)

  // Analyseer voor ToC + schema
  const { toc, faqItems, howtoSteps } = analyseerInhoud(post.inhoudMd, post.titel)
  const heeftToC = toc.length > 2

  // Schema.org blokken
  const jsonLdArtikel = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titel,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverUrl || undefined,
    datePublished: post.gepubliceerdOp ? new Date(post.gepubliceerdOp).toISOString() : undefined,
    dateModified: new Date(post.bijgewerktOp).toISOString(),
    author: { '@type': 'Person', name: 'Vincent van Munster', url: `${APP_URL}/over-ons` },
    publisher: { '@type': 'Organization', name: 'PootGelukkig', logo: { '@type': 'ImageObject', url: `${APP_URL}/logo.png` } },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${APP_URL}/blog/${post.slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${APP_URL}/blog` },
      ...(cat ? [{ '@type': 'ListItem' as const, position: 2, name: cat.naam, item: `${APP_URL}/blog?categorie=${cat.slug}` }] : []),
      { '@type': 'ListItem', position: cat ? 3 : 2, name: post.titel, item: `${APP_URL}/blog/${post.slug}` },
    ],
  }

  const schemas: any[] = [jsonLdArtikel, breadcrumbLd]

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
      name: post.titel,
      description: post.excerpt || '',
      step: howtoSteps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.name,
        text: s.text,
      })),
    })
  }

  const shareUrl = encodeURIComponent(`${APP_URL}/blog/${post.slug}`)
  const shareText = encodeURIComponent(post.titel)
  const heeftCover = !!post.coverUrl

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <article className="mx-auto w-full px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb */}
          <nav aria-label="Kruimelpad" className="mb-6 flex items-center gap-2 text-sm text-[#33335c]/45">
            <Link href="/blog" className="hover:text-[#33335c] transition-colors">Blog</Link>
            {cat && (
              <>
                <span>/</span>
                <Link href={`/blog?categorie=${cat.slug}`} className="hover:text-[#33335c] transition-colors">{cat.naam}</Link>
              </>
            )}
          </nav>

          {/* Title */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#33335c]">
            {post.titel}
          </h1>

          {/* Meta: date + reading time + category */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-[#33335c]/40">
            {post.gepubliceerdOp && (
              <time dateTime={new Date(post.gepubliceerdOp).toISOString()}>
                {new Date(post.gepubliceerdOp).toLocaleDateString('nl-NL', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </time>
            )}
            {post.leestijd > 0 && (
              <>
                <span className="size-1 rounded-full bg-[#33335c]/20" />
                <span>{post.leestijd} min lezen</span>
              </>
            )}
            {cat && (
              <>
                <span className="size-1 rounded-full bg-[#33335c]/20" />
                <Link
                  href={`/blog?categorie=${cat.slug}`}
                  className="inline-block rounded-full bg-[#9db99d]/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#3b543b] hover:bg-[#9db99d]/30 transition-colors"
                >
                  {cat.naam}
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Cover image — full width buiten de tekstkolom */}
        {heeftCover && (
          <div className="relative mx-auto mt-8 w-full max-w-4xl aspect-[16/9] overflow-hidden rounded-3xl bg-[#f1f1f5]">
            <Image src={post.coverUrl!} alt={post.titel} fill className="object-cover" priority />
          </div>
        )}

        <div className="mx-auto mt-8 flex max-w-5xl gap-8">
          {/* Table of Contents (sidebar) */}
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
                        entry.level === 2
                          ? 'font-semibold text-[#33335c]/70'
                          : 'pl-4 text-[#33335c]/50'
                      }`}
                    >
                      {entry.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div
              className="blog-inhoud leading-relaxed text-[#33335c]/80"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Author block — enhanced E-E-A-T */}
            <div className="mt-12 rounded-2xl border border-[#33335c]/8 bg-[#f9fafb] p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#33335c] text-lg font-bold text-white">
                  VM
                </div>
                <div>
                  <p className="font-bold text-[#33335c]">Vincent van Munster</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#33335c]/60">
                    Oprichter van WeAreImpact en PootGelukkig. Met 25 jaar ervaring in bestuur en innovatie in het sociaal domein
                    bouw ik AI-gedreven oplossingen die de asielsector efficiënter maken,
                    zonder de menselijke maat uit het oog te verliezen. Elke week schrijf ik over adoptie, digitalisering en dierenwelzijn.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Link href="/over-ons" className="text-xs font-semibold text-[#ee5b2b] hover:text-[#d94e22] transition-colors">
                      Over mij →
                    </Link>
                    <Link href="/blog" className="text-xs font-semibold text-[#ee5b2b] hover:text-[#d94e22] transition-colors">
                      Alle artikelen →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Social share */}
            <div className="mt-8 flex items-center gap-3">
              <span className="text-sm font-semibold text-[#33335c]/50">Delen:</span>
              {[
                { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, color: '#0a66c2', icon: 'in' },
                { label: 'WhatsApp', href: `https://wa.me/?text=${shareText}%20${shareUrl}`, color: '#25D366', icon: 'WA' },
                { label: 'X', href: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, color: '#33335c', icon: 'X' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors"
                  style={{ backgroundColor: `${s.color}10`, color: s.color }}
                  aria-label={`Deel op ${s.label}`}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Related articles */}
        {(gerelateerd.length > 0 || recent.length > 0) && (
          <div className="mx-auto mt-14 max-w-5xl">
            <h2 className="text-xl font-extrabold text-[#33335c]">Verder lezen</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...gerelateerd, ...recent].slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group rounded-2xl border border-[#33335c]/8 bg-white p-4 transition-shadow hover:shadow-[0_4px_20px_rgba(51,51,92,0.06)]"
                >
                  {r.coverUrl ? (
                    <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-xl bg-[#f1f1f5]">
                      <Image src={r.coverUrl} alt={r.titel} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="mb-3 flex aspect-[16/9] items-center justify-center rounded-xl bg-gradient-to-br from-[#33335c] to-[#1a1a3e]">
                      <span className="material-symbols-outlined text-2xl text-[#f8aa25]">pets</span>
                    </div>
                  )}
                  <h3 className="text-sm font-bold leading-snug text-[#33335c] group-hover:text-[#ee5b2b] transition-colors">
                    {r.titel}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mx-auto mt-14 max-w-2xl rounded-[2rem] bg-[#33335c] p-8 text-center">
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
