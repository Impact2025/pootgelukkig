export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Section, Eyebrow } from '@/components/marketing/ui'

export const metadata: Metadata = {
  title: 'Blog — PootGelukkig',
  description: 'Tips, verhalen en gidsen over het adopteren van asieldieren in Nederland.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog — PootGelukkig',
    description: 'Tips, verhalen en gidsen over het adopteren van asieldieren in Nederland.',
    url: '/blog',
    type: 'website',
  },
}

export default async function BlogIndexPage() {
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.status, 'gepubliceerd'))
    .orderBy(desc(blogPosts.gepubliceerdOp))

  return (
    <Section>
      <div className="max-w-2xl">
        <Eyebrow>Blog</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
          Verhalen, tips en gidsen
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
          Over het adopteren van asieldieren in Nederland. Op zoek naar naslag per onderwerp? Bekijk
          de{' '}
          <Link href="/kennisbank" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">
            kennisbank
          </Link>
          .
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-[#33335c]/40">Er zijn nog geen artikelen gepubliceerd.</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[#33335c]/8 bg-white shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)]"
            >
              {p.coverUrl ? (
                <div className="relative aspect-[16/9] bg-[#f1f1f5]">
                  <Image
                    src={p.coverUrl}
                    alt={p.titel}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-[#33335c] to-[#1a1a3e]">
                  <span className="material-symbols-outlined text-4xl text-[#f8aa25]">pets</span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg font-bold leading-tight text-[#33335c]">{p.titel}</h2>
                {p.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#33335c]/55">{p.excerpt}</p>
                )}
                {p.gepubliceerdOp && (
                  <p className="mt-4 text-xs font-medium text-[#33335c]/35">
                    {new Date(p.gepubliceerdOp).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </Section>
  )
}
