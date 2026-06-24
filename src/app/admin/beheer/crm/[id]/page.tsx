export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { crmContacten, crmDeals, crmActiviteiten } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import ContactDetail from './ContactDetail'

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const contactId = Number(id)

  const [contact] = await db.select().from(crmContacten).where(eq(crmContacten.id, contactId)).limit(1)
  if (!contact) notFound()

  const [deals, activiteiten] = await Promise.all([
    db.select().from(crmDeals).where(eq(crmDeals.contactId, contactId)).orderBy(desc(crmDeals.bijgewerktOp)),
    db
      .select()
      .from(crmActiviteiten)
      .where(eq(crmActiviteiten.contactId, contactId))
      .orderBy(desc(crmActiviteiten.aangemaaktOp)),
  ])

  return <ContactDetail contact={contact} deals={deals} activiteiten={activiteiten} />
}
