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

export default async function BlogArtikelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await haalPost(slug)
  if (!post) notFound()

  const zonderTitel = post.inhoudMd.replace(/^\s*#\s+.*(\r?\n)+/, '')
  const html = await marked.parse(zonderTitel)

  const cat = await haalCategorie(post.categorieId)
  const gerelateerd = await haalGerelateerd(post.categorieId, post.id)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titel,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverUrl || undefined,
    datePublished: post.gepubliceerdOp ? new Date(post.gepubliceerdOp).toISOString() : undefined,
    dateModified: new Date(post.bijgewerktOp).toISOString(),
    author: { '@type': 'Person', name: 'Vincent van Munster' },
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

  // Social share URLs
  const shareUrl = encodeURIComponent(`${APP_URL}/blog/${post.slug}`)
  const shareText = encodeURIComponent(post.titel)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#33335c]/45">
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

        {/* Meta: date + reading time */}
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

        {/* Cover image */}
        {post.coverUrl && (
          <div className="relative my-8 aspect-[16/9] overflow-hidden rounded-3xl bg-[#f1f1f5]">
            <Image src={post.coverUrl} alt={post.titel} fill className="object-cover" priority />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-inhoud mt-8 leading-relaxed text-[#33335c]/80"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Author block */}
        <div className="mt-12 rounded-2xl border border-[#33335c]/8 bg-[#f9fafb] p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#33335c] text-sm font-bold text-white">
              VM
            </div>
            <div>
              <p className="font-bold text-[#33335c]">Vincent van Munster</p>
              <p className="mt-0.5 text-sm leading-relaxed text-[#33335c]/60">
                Oprichter van WeAreImpact en PootGelukkig. Bouwt AI-gedreven oplossingen
                die de asielsector efficiënter maken, zonder de menselijke maat uit het oog te verliezen.
              </p>
            </div>
          </div>
        </div>

        {/* Social share */}
        <div className="mt-8 flex items-center gap-3">
          <span className="text-sm font-semibold text-[#33335c]/50">Delen:</span>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-9 items-center justify-center rounded-full bg-[#0a66c2]/10 text-sm font-bold text-[#0a66c2] transition-colors hover:bg-[#0a66c2]/20"
            aria-label="Deel op LinkedIn"
          >
            in
          </a>
          <a
            href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-9 items-center justify-center rounded-full bg-[#25D366]/10 text-sm font-bold text-[#25D366] transition-colors hover:bg-[#25D366]/20"
            aria-label="Deel op WhatsApp"
          >
            WA
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-9 items-center justify-center rounded-full bg-[#33335c]/10 text-sm font-bold text-[#33335c] transition-colors hover:bg-[#33335c]/20"
            aria-label="Deel op X"
          >
            X
          </a>
        </div>

        {/* Related articles */}
        {gerelateerd.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-extrabold text-[#33335c]">Verder lezen</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {gerelateerd.map((r) => (
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
