export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'

async function haalPost(slug: string) {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'gepubliceerd')))
    .limit(1)
  return post ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await haalPost(slug)
  if (!post) return { title: 'Artikel niet gevonden — PootGelukkig' }

  const ruweTitel = post.metaTitle || post.titel
  // Voorkom dubbele branding als de (AI-)metatitel "PootGelukkig" al bevat
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

  // Strip een eventuele leidende H1 uit de markdown — de titel tonen we los hierboven
  const zonderTitel = post.inhoudMd.replace(/^\s*#\s+.*(\r?\n)+/, '')
  const html = await marked.parse(zonderTitel)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.titel,
    description: post.metaDescription || post.excerpt || undefined,
    image: post.coverUrl || undefined,
    datePublished: post.gepubliceerdOp ? new Date(post.gepubliceerdOp).toISOString() : undefined,
    dateModified: new Date(post.bijgewerktOp).toISOString(),
    author: { '@type': 'Organization', name: 'PootGelukkig' },
    publisher: { '@type': 'Organization', name: 'PootGelukkig' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${APP_URL}/blog/${post.slug}` },
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${APP_URL}/blog` },
      { '@type': 'ListItem', position: 2, name: post.titel, item: `${APP_URL}/blog/${post.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <article className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#33335c]/45 transition-colors hover:text-[#33335c]"
        >
          <span className="material-symbols-outlined text-[1.1rem]">arrow_back</span>
          Alle artikelen
        </Link>

        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#33335c]">
          {post.titel}
        </h1>
        {post.gepubliceerdOp && (
          <p className="mt-3 text-sm font-medium text-[#33335c]/40">
            {new Date(post.gepubliceerdOp).toLocaleDateString('nl-NL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}

        {post.coverUrl && (
          <div className="relative my-8 aspect-[16/9] overflow-hidden rounded-3xl bg-[#f1f1f5]">
            <Image src={post.coverUrl} alt={post.titel} fill className="object-cover" />
          </div>
        )}

        <div
          className="blog-inhoud mt-8 leading-relaxed text-[#33335c]/80"
          dangerouslySetInnerHTML={{ __html: html }}
        />

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
