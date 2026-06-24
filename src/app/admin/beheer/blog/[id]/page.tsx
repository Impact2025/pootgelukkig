export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import BlogEditor from './BlogEditor'

export default async function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, Number(id))).limit(1)
  if (!post) notFound()

  return <BlogEditor post={post} />
}
