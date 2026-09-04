export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { aiContentQueue } from '@/lib/db/schema'
import { and, eq, count } from 'drizzle-orm'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    redirect('/auth/login')
  }

  const organisatieId = session.user.organisatieId

  const [wachtrijResult] = await db
    .select({ aantal: count() })
    .from(aiContentQueue)
    .where(
      organisatieId
        ? and(eq(aiContentQueue.status, 'pending'), eq(aiContentQueue.organisatieId, organisatieId))
        : eq(aiContentQueue.status, 'pending')
    )

  return (
    <AdminShell
      user={{
        naam: session.user.name ?? 'Beheerder',
        email: session.user.email ?? '',
        rol: session.user.rol,
      }}
      counts={{
        wachtrij: Number(wachtrijResult?.aantal ?? 0),
      }}
    >
      {children}
    </AdminShell>
  )
}
