export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { gesprekken, dieren } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export default async function StartChatPage({
  params,
}: {
  params: Promise<{ dierId: string }>
}) {
  const { dierId: dierIdStr } = await params
  const dierId = parseInt(dierIdStr)

  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)

  // Zoek bestaand gesprek
  const [bestaand] = await db
    .select({ id: gesprekken.id })
    .from(gesprekken)
    .where(and(eq(gesprekken.userId, userId), eq(gesprekken.dierId, dierId)))
    .limit(1)

  if (bestaand) redirect(`/chat/${bestaand.id}`)

  // Maak nieuw gesprek aan
  const [dier] = await db
    .select({ asielId: dieren.asielId })
    .from(dieren)
    .where(eq(dieren.id, dierId))
    .limit(1)

  if (!dier) redirect('/dashboard')

  const [nieuw] = await db
    .insert(gesprekken)
    .values({ userId, dierId, asielId: dier.asielId })
    .returning({ id: gesprekken.id })

  redirect(`/chat/${nieuw.id}`)
}
