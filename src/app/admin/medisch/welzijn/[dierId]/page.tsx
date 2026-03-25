export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { dieren, welzijnLogs } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import WelzijnClient from './WelzijnClient'

export default async function WelzijnPage({ params }: { params: Promise<{ dierId: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const { dierId } = await params
  const id = parseInt(dierId)
  if (isNaN(id)) redirect('/admin/medisch')

  const [dier] = await db
    .select({
      id: dieren.id,
      naam: dieren.naam,
      hoofdFotoUrl: dieren.hoofdFotoUrl,
      soort: dieren.soort,
    })
    .from(dieren)
    .where(eq(dieren.id, id))
    .limit(1)

  if (!dier) redirect('/admin/medisch')

  const logs = await db
    .select()
    .from(welzijnLogs)
    .where(eq(welzijnLogs.dierId, id))
    .orderBy(desc(welzijnLogs.gelogdOp))
    .limit(14)

  const serialiseerbareLogs = logs.map((l) => ({
    id: l.id,
    voeding: l.voeding,
    gedrag: l.gedrag,
    gezondheid: l.gezondheid,
    notitie: l.notitie,
    gelogdOp: l.gelogdOp.toISOString(),
  }))

  return (
    <WelzijnClient
      dierId={dier.id}
      dierNaam={dier.naam}
      dierFotoUrl={dier.hoofdFotoUrl}
      initialeLogs={serialiseerbareLogs}
    />
  )
}
