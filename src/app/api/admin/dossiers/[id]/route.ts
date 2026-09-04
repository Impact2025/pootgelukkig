import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dossiers, begeleidingen, clienten, welzijnLogs } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { id } = await params

  const [dossier] = await db
    .select()
    .from(dossiers)
    .where(and(eq(dossiers.id, id), eq(dossiers.organisatieId, organisatieId)))
    .limit(1)

  if (!dossier) return NextResponse.json({ fout: 'Dossier niet gevonden' }, { status: 404 })

  const gekoppeldeBegeleidingen = await db
    .select({
      id: begeleidingen.id,
      status: begeleidingen.status,
      startDatum: begeleidingen.startDatum,
      evaluatieNotities: begeleidingen.evaluatieNotities,
      clientId: clienten.id,
      clientVoornaam: clienten.voornaam,
      clientAchternaam: clienten.achternaam,
    })
    .from(begeleidingen)
    .innerJoin(clienten, eq(begeleidingen.clientId, clienten.id))
    .where(eq(begeleidingen.dossierId, id))
    .orderBy(desc(begeleidingen.createdAt))

  const veldlogs = await db
    .select()
    .from(welzijnLogs)
    .where(eq(welzijnLogs.dossierId, id))
    .orderBy(desc(welzijnLogs.gelogdOp))
    .limit(20)

  return NextResponse.json({ data: { dossier, begeleidingen: gekoppeldeBegeleidingen, veldlogs } })
}

const updateSchema = z.object({
  status: z.enum(['intake', 'actief', 'in_behandeling', 'afgerond']).optional(),
  titel: z.string().min(1).optional(),
  samenvatting: z.string().nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ fout: parsed.error.errors[0]?.message ?? 'Ongeldige invoer' }, { status: 400 })
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ fout: 'Niets te wijzigen' }, { status: 400 })
  }

  const [bijgewerkt] = await db
    .update(dossiers)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(dossiers.id, id), eq(dossiers.organisatieId, organisatieId)))
    .returning()

  if (!bijgewerkt) return NextResponse.json({ fout: 'Dossier niet gevonden' }, { status: 404 })
  return NextResponse.json({ data: bijgewerkt })
}
