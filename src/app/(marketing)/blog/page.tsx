export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { blogPosts, blogCategorieen } from '@/lib/db/schema'
import { eq, desc, and, isNull } from 'drizzle-orm'
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

async function haalCategorieen() {
  return db.select().from(blogCategorieen).orderBy(blogCategorieen.id)
}

export default async function BlogIndexPage(props: {
  searchParams?: Promise<{ categorie?: string }>
}) {
  const searchParams = await props.searchParams
  const catSlug = searchParams?.categorie || null

  const alleCats = await haalCategorieen()

  // Build query met of zonder filter
  let filterCategorieId: number | null = null
  if (catSlug) {
    const gevonden = alleCats.find((c) => c.slug === catSlug)
    if (gevonden) filterCategorieId = gevonden.id
  }

  const whereClause = filterCategorieId
    ? and(eq(blogPosts.status, 'gepubliceerd'), eq(blogPosts.categorieId, filterCategorieId))
    : and(eq(blogPosts.status, 'gepubliceerd'))

  const posts = await db
    .select()
    .from(blogPosts)
    .where(whereClause)
    .orderBy(desc(blogPosts.gepubliceerdOp))

  // Koppel categorie naam aan posts
  const catMap = new Map(alleCats.map((c) => [c.id, c]))

  return (
    <Section>
      <div className="max-w-2xl">
        <Eyebrow>Blog</Eyebrow>
        <h1 className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#33335c] sm:text-5xl">
          {catSlug
            ? alleCats.find((c) => c.slug === catSlug)?.naam || 'Verhalen, tips en gidsen'
            : 'Verhalen, tips en gidsen'}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#33335c]/65">
          {catSlug
            ? `Artikelen in de categorie "${alleCats.find((c) => c.slug === catSlug)?.naam}".`
            : 'Over het adopteren van asieldieren in Nederland. Op zoek naar naslag per onderwerp? Bekijk de '}
          {!catSlug && (
            <>
              <Link href="/kennisbank" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">
                kennisbank
              </Link>
              .
            </>
          )}
          {catSlug && (
            <Link href="/blog" className="font-semibold text-[#ee5b2b] hover:text-[#d94e22]">
              Alle artikelen bekijken →
            </Link>
          )}
        </p>
      </div>

      {/* Categorie filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            !catSlug ? 'bg-[#33335c] text-white' : 'bg-[#33335c]/8 text-[#33335c]/60 hover:bg-[#33335c]/15 hover:text-[#33335c]'
          }`}
        >
          Alle
        </Link>
        {alleCats.map((c) => (
          <Link
            key={c.id}
            href={`/blog?categorie=${c.slug}`}
            className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              catSlug === c.slug ? 'bg-[#33335c] text-white' : 'bg-[#33335c]/8 text-[#33335c]/60 hover:bg-[#33335c]/15 hover:text-[#33335c]'
            }`}
          >
            {c.naam}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-[#33335c]/40">Er zijn nog geen artikelen in deze categorie.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => {
            const postCat = p.categorieId ? catMap.get(p.categorieId) : null
            return (
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
                <div className="flex flex-1 flex-col p-5">
                  {/* Categorie tag + leestijd */}
                  <div className="mb-3 flex items-center gap-2">
                    {postCat && (
                      <span className="inline-block rounded-full bg-[#9db99d]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#3b543b]">
                        {postCat.naam}
                      </span>
                    )}
                    {p.leestijd > 0 && (
                      <span className="text-[10px] font-semibold text-[#33335c]/35">{p.leestijd} min</span>
                    )}
                  </div>
                  <h2 className="text-base font-bold leading-tight text-[#33335c]">{p.titel}</h2>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#33335c]/55">{p.excerpt}</p>
                  )}
                  {p.gepubliceerdOp && (
                    <p className="mt-auto pt-4 text-xs font-medium text-[#33335c]/35">
                      {new Date(p.gepubliceerdOp).toLocaleDateString('nl-NL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Section>
  )
}
