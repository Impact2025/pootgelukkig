export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { PageHeader, EmptyState, StatusBadge, Card } from '@/components/admin/ui'
import BlogNieuw from './BlogNieuw'

function scoreKleur(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-rose-600'
}

export default async function AdminBlogPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  if (!organisatieId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState icon="article" title="Geen organisatie gekoppeld" description="Jouw account is nog niet gekoppeld aan een organisatie." />
      </div>
    )
  }

  // Strikt gescoped op organisatie_id — een organisatie ziet nooit blogartikelen van een andere.
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.organisatieId, organisatieId))
    .orderBy(desc(blogPosts.bijgewerktOp))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Blog Beheer"
        icon="article"
        description={`${posts.length} artikelen · ${posts.filter((p) => p.status === 'gepubliceerd').length} gepubliceerd`}
        actions={<BlogNieuw />}
      />

      {posts.length === 0 ? (
        <EmptyState icon="article" title="Nog geen artikelen" description="Maak een nieuw artikel aan voor de publieke site van jouw organisatie." />
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-[#1E293B]/5">
            {posts.map((p) => (
              <Link key={p.id} href={`/admin/blog/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1E293B] truncate">{p.titel}</p>
                  <p className="text-[#1E293B]/40 text-xs truncate">/{p.slug}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-extrabold ${scoreKleur(p.seoScore)}`}>{p.seoScore}</p>
                  <p className="text-[10px] text-[#1E293B]/30">SEO</p>
                </div>
                <StatusBadge status={p.status} />
                <span className="material-symbols-outlined text-[#1E293B]/30 flex-shrink-0">chevron_right</span>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
