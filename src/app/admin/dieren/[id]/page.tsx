export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dieren } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import BewerkDierForm from './BewerkDierForm'

export default async function BewerkDierPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.rol !== 'asiel' && session.user.rol !== 'admin')) {
    redirect('/auth/login')
  }

  const { id } = await params
  const dierId = parseInt(id)

  const [dier] = await db
    .select()
    .from(dieren)
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (!dier) notFound()

  return <BewerkDierForm dier={dier} />
}
