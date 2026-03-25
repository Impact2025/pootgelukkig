export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { gesprekken, berichten, dieren, asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import ChatClient from './ChatClient'

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gesprekId = parseInt(id)
  if (isNaN(gesprekId)) notFound()

  const session = await auth()
  if (!session?.user) redirect('/auth/login')

  const userId = parseInt(session.user.id)

  // Gesprek ophalen met dier + asiel info
  const [gesprek] = await db
    .select({
      id: gesprekken.id,
      userId: gesprekken.userId,
      dierNaam: dieren.naam,
      dierFotoUrl: dieren.hoofdFotoUrl,
      asielNaam: asielen.naam,
      afspraakDatum: gesprekken.afspraakDatum,
    })
    .from(gesprekken)
    .innerJoin(dieren, eq(gesprekken.dierId, dieren.id))
    .innerJoin(asielen, eq(gesprekken.asielId, asielen.id))
    .where(eq(gesprekken.id, gesprekId))
    .limit(1)

  if (!gesprek || gesprek.userId !== userId) notFound()

  // Berichten ophalen
  const msgs = await db
    .select()
    .from(berichten)
    .where(eq(berichten.gesprekId, gesprekId))
    .orderBy(berichten.verstuurdOp)

  return (
    <ChatClient
      gesprekId={gesprekId}
      userId={userId}
      dierNaam={gesprek.dierNaam}
      dierFotoUrl={gesprek.dierFotoUrl ?? null}
      asielNaam={gesprek.asielNaam}
      initialeBerichten={msgs.map((m) => ({
        id: m.id,
        verzenderType: m.verzenderType,
        inhoud: m.inhoud,
        verstuurdOp: m.verstuurdOp.toISOString(),
        gelezen: m.gelezen ?? false,
      }))}
      initieleAfspraak={gesprek.afspraakDatum?.toISOString() ?? null}
    />
  )
}
