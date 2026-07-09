export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { PageHeader, EmptyState, StatusBadge, Card } from '@/components/admin/ui'
import BlogActies from './BlogActies'

function scoreKleur(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-rose-600'
}

export default async function BlogPage() {
  const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.bijgewerktOp))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Blog"
        icon="article"
        description={`${posts.length} artikelen · ${posts.filter((p) => p.status === 'gepubliceerd').length} gepubliceerd`}
        actions={<BlogActies />}
      />

      {posts.length === 0 ? (
        <EmptyState
          icon="article"
          title="Nog geen artikelen"
          description="Laat de AI een wereldklasse SEO-artikel schrijven."
        />
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-[#33335c]/5">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/management/blog/${p.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#33335c] truncate">{p.titel}</p>
                  <p className="text-[#33335c]/40 text-xs truncate">
                    /{p.slug}
                    {p.focusKeyword ? ` · Keyword: ${p.focusKeyword}` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-extrabold ${scoreKleur(p.seoScore)}`}>{p.seoScore}</p>
                  <p className="text-[10px] text-[#33335c]/30">SEO</p>
                </div>
                <StatusBadge status={p.status} />
                <span className="material-symbols-outlined text-[#33335c]/30 flex-shrink-0">chevron_right</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
