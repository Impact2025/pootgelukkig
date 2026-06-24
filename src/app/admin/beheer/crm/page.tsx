export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { crmContacten, crmDeals } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import CrmBoard from './CrmBoard'

export default async function CrmPage() {
  const [contacten, deals] = await Promise.all([
    db.select().from(crmContacten).orderBy(desc(crmContacten.bijgewerktOp)),
    db
      .select({
        id: crmDeals.id,
        contactId: crmDeals.contactId,
        titel: crmDeals.titel,
        fase: crmDeals.fase,
        waarde: crmDeals.waarde,
        contactNaam: crmContacten.naam,
      })
      .from(crmDeals)
      .leftJoin(crmContacten, eq(crmDeals.contactId, crmContacten.id))
      .orderBy(crmDeals.volgorde),
  ])

  return <CrmBoard contacten={contacten} deals={deals} />
}
