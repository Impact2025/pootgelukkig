export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { adopties, berichten, gesprekken, medischeRecords, wachtlijst, afspraken } from '@/lib/db/schema'
import { and, eq, count, lt } from 'drizzle-orm'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const asielId = session.user.asielId
  const now = new Date()

  const [openstaandResult] = await db
    .select({ aantal: count() })
    .from(adopties)
    .where(
      asielId
        ? and(eq(adopties.status, 'aangevraagd'), eq(adopties.asielId, asielId))
        : eq(adopties.status, 'aangevraagd')
    )

  const [onglezenResult] = await db
    .select({ aantal: count() })
    .from(berichten)
    .innerJoin(gesprekken, eq(berichten.gesprekId, gesprekken.id))
    .where(and(eq(berichten.verzenderType, 'adoptant'), eq(berichten.gelezen, false)))

  // Achterstallige medische records
  const [medischResult] = await db
    .select({ aantal: count() })
    .from(medischeRecords)
    .where(
      and(
        eq(medischeRecords.status, 'aankomend'),
        lt(medischeRecords.volgendeDatum, now)
      )
    )

  // Actieve wachtlijst entries
  const [wachtlijstResult] = await db
    .select({ aantal: count() })
    .from(wachtlijst)
    .where(eq(wachtlijst.actief, true))

  // Aangevraagde afspraken
  const [afsprakenResult] = await db
    .select({ aantal: count() })
    .from(afspraken)
    .where(
      asielId
        ? and(eq(afspraken.status, 'aangevraagd'), eq(afspraken.asielId, asielId))
        : eq(afspraken.status, 'aangevraagd')
    )

  return (
    <AdminShell
      user={{
        naam: session.user.name ?? 'Beheerder',
        email: session.user.email ?? '',
        rol: session.user.rol,
      }}
      counts={{
        openstaand: openstaandResult?.aantal ?? 0,
        ongelezen: Number(onglezenResult?.aantal ?? 0),
        medisch: Number(medischResult?.aantal ?? 0),
        wachtlijst: Number(wachtlijstResult?.aantal ?? 0),
        afspraken: Number(afsprakenResult?.aantal ?? 0),
      }}
    >
      {children}
    </AdminShell>
  )
}
