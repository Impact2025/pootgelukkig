export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import CopilotClient from './CopilotClient'

export default async function CopilotPage() {
  const session = await auth()
  const asielId = session?.user?.asielId

  let asielNaam = 'het asiel'
  if (asielId) {
    const [asiel] = await db.select({ naam: asielen.naam }).from(asielen).where(eq(asielen.id, asielId)).limit(1)
    if (asiel) asielNaam = asiel.naam
  }

  const gebruikerNaam = session?.user?.name?.split(' ')[0] ?? 'beheerder'

  return <CopilotClient gebruikerNaam={gebruikerNaam} asielNaam={asielNaam} />
}
