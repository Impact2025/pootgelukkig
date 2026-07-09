import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiRollenConfig } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AI_ROLLEN_LIJST, isGeldigeRol } from '@/lib/ai/rollen'

export const dynamic = 'force-dynamic'

// GET: lijst alle rollen met hun actieve status voor dit asiel
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }
  const asielId = Number(session.user.asielId)
  const actief = await db
    .select({ rol: aiRollenConfig.rol, actief: aiRollenConfig.actief })
    .from(aiRollenConfig)
    .where(eq(aiRollenConfig.asielId, asielId))

  const actiefMap = new Map(actief.map((a) => [a.rol, a.actief]))
  const rollen = AI_ROLLEN_LIJST.map((r) => ({
    id: r.id,
    naam: r.naam,
    titel: r.titel,
    icoon: r.icoon,
    kleur: r.kleur,
    beschrijving: r.beschrijving,
    actief: actiefMap.get(r.id) ?? false,
  }))

  return NextResponse.json({ rollen })
}

// PATCH: zet één rol aan/uit (upsert in ai_rollen_config)
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }
  const asielId = Number(session.user.asielId)

  let body: { rol?: unknown; actief?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!isGeldigeRol(body.rol)) {
    return NextResponse.json({ error: 'Onbekende rol' }, { status: 400 })
  }
  const rol = body.rol
  const actief = Boolean(body.actief)

  await db
    .insert(aiRollenConfig)
    .values({ asielId, rol, actief })
    .onConflictDoUpdate({
      target: [aiRollenConfig.asielId, aiRollenConfig.rol],
      set: { actief },
    })

  return NextResponse.json({ rol, actief })
}
