import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiRollenConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AI_ROLLEN_LIJST } from '@/lib/ai/rollen'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }

  const asielId = session.user.asielId
  const actief = asielId
    ? await db
        .select({ rol: aiRollenConfig.rol, actief: aiRollenConfig.actief })
        .from(aiRollenConfig)
        .where(eq(aiRollenConfig.asielId, asielId))
    : []
  const actiefMap = new Map(actief.map((a) => [a.rol, a.actief]))

  const rollen = AI_ROLLEN_LIJST.map((r) => ({
    id: r.id,
    naam: r.naam,
    titel: r.titel,
    icoon: r.icoon,
    kleur: r.kleur,
    beschrijving: r.beschrijving,
    actief: actiefMap.get(r.id) ?? false,
    acties: r.acties.map((a) => ({
      id: a.id,
      label: a.label,
      icoon: a.icoon,
      prompt: a.prompt,
      sideEffect: a.sideEffect ?? false,
      endpoint: a.endpoint ?? null,
    })),
  }))

  return NextResponse.json({ rollen })
}
