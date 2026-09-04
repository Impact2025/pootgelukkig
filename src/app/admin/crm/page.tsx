export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { crmContacten } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { EmptyState } from '@/components/admin/ui'
import CrmClient from './CrmClient'

export default async function AdminCrmPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  if (!organisatieId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <EmptyState icon="contacts" title="Geen organisatie gekoppeld" description="Jouw account is nog niet gekoppeld aan een organisatie." />
      </div>
    )
  }

  // Strikt gescoped op organisatie_id — een organisatie ziet nooit CRM-contacten van een andere.
  const contacten = await db
    .select()
    .from(crmContacten)
    .where(eq(crmContacten.organisatieId, organisatieId))
    .orderBy(desc(crmContacten.bijgewerktOp))

  return <CrmClient contacten={contacten} />
}
