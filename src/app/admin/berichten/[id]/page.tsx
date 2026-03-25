export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { gesprekken, berichten, users, dieren } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import AdminChatClient from './AdminChatClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminChatDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const { id } = await params
  const gesprekId = parseInt(id)
  if (isNaN(gesprekId)) notFound()

  const [gesprek] = await db
    .select({
      id: gesprekken.id,
      asielId: gesprekken.asielId,
      afspraakDatum: gesprekken.afspraakDatum,
      adoptantNaam: users.naam,
      adoptantEmail: users.email,
      dierNaam: dieren.naam,
      dierFotoUrl: dieren.hoofdFotoUrl,
    })
    .from(gesprekken)
    .innerJoin(users, eq(gesprekken.userId, users.id))
    .innerJoin(dieren, eq(gesprekken.dierId, dieren.id))
    .where(eq(gesprekken.id, gesprekId))
    .limit(1)

  if (!gesprek) notFound()

  const msgs = await db
    .select()
    .from(berichten)
    .where(eq(berichten.gesprekId, gesprekId))
    .orderBy(berichten.verstuurdOp)

  // Markeer berichten van adoptant als gelezen
  await db
    .update(berichten)
    .set({ gelezen: true })
    .where(and(eq(berichten.gesprekId, gesprekId), eq(berichten.verzenderType, 'adoptant')))

  return (
    <AdminChatClient
      gesprekId={gesprek.id}
      asielId={gesprek.asielId}
      dierNaam={gesprek.dierNaam}
      dierFotoUrl={gesprek.dierFotoUrl ?? null}
      adoptantNaam={gesprek.adoptantNaam}
      adoptantEmail={gesprek.adoptantEmail}
      initialeBerichten={msgs.map((m) => ({
        id: m.id,
        verzenderType: m.verzenderType,
        inhoud: m.inhoud,
        verstuurdOp: m.verstuurdOp.toISOString(),
      }))}
      afspraakDatum={gesprek.afspraakDatum?.toISOString() ?? null}
    />
  )
}
