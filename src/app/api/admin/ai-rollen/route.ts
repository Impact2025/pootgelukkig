import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { aiRollenConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AI_ROLLEN_LIJST, isGeldigeRol } from '@/lib/ai/rollen'

export const dynamic = 'force-dynamic'

// GET: lijst alle actieve ImpactOS-rollen met hun aan/uit-status en eventuele custom system-prompt voor deze organisatie
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ rollen: [] })

  const configs = await db
    .select({ rol: aiRollenConfig.rol, actief: aiRollenConfig.actief, systemPrompt: aiRollenConfig.systemPrompt })
    .from(aiRollenConfig)
    .where(eq(aiRollenConfig.organisatieId, organisatieId))

  const configMap = new Map(configs.map((c) => [c.rol, c]))
  const rollen = AI_ROLLEN_LIJST.map((r) => ({
    id: r.id,
    naam: r.naam,
    titel: r.titel,
    icoon: r.icoon,
    kleur: r.kleur,
    beschrijving: r.beschrijving,
    modelKlasse: r.modelKlasse,
    vereistGoedkeuring: r.vereistGoedkeuring,
    actief: configMap.get(r.id)?.actief ?? false,
    systemPrompt: configMap.get(r.id)?.systemPrompt ?? null,
  }))

  return NextResponse.json({ rollen })
}

// PATCH: zet één rol aan/uit en/of stel een organisatie-specifieke system-prompt in (upsert in ai_rollen_config)
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) {
    return NextResponse.json({ error: 'Geen organisatie gekoppeld aan dit account' }, { status: 400 })
  }

  let body: { rol?: unknown; actief?: unknown; systemPrompt?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }

  if (!isGeldigeRol(body.rol)) {
    return NextResponse.json({ error: 'Onbekende of gedeactiveerde rol' }, { status: 400 })
  }
  const rol = body.rol
  const actief = Boolean(body.actief)
  const systemPrompt = typeof body.systemPrompt === 'string' ? body.systemPrompt.slice(0, 4000) : null

  await db
    .insert(aiRollenConfig)
    .values({ organisatieId, rol, actief, systemPrompt })
    .onConflictDoUpdate({
      target: [aiRollenConfig.organisatieId, aiRollenConfig.rol],
      set: { actief, systemPrompt },
    })

  return NextResponse.json({ rol, actief, systemPrompt })
}
