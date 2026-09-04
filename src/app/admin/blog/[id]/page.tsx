export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import BlogEditor from './BlogEditor'

export default async function AdminBlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId
  if (!organisatieId) redirect('/admin/blog')

  const { id } = await params
  // Strikt gescoped: een artikel van een andere organisatie geeft altijd 404, nooit inzage.
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.id, Number(id)), eq(blogPosts.organisatieId, organisatieId)))
    .limit(1)
  if (!post) notFound()

  return <BlogEditor post={post} />
}
