export const dynamic = 'force-dynamic'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { organisaties } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import CopilotClient from './CopilotClient'

export default async function CopilotPage() {
  const session = await auth()
  const organisatieId = session?.user?.organisatieId

  let asielNaam = 'de organisatie'
  if (organisatieId) {
    const [organisatie] = await db.select({ naam: organisaties.naam }).from(organisaties).where(eq(organisaties.id, organisatieId)).limit(1)
    if (organisatie) asielNaam = organisatie.naam
  }

  const gebruikerNaam = session?.user?.name?.split(' ')[0] ?? 'beheerder'

  return <CopilotClient gebruikerNaam={gebruikerNaam} asielNaam={asielNaam} />
}
