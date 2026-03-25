import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { adopties, nazorgDagen } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ adoptionId: string; dag: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { adoptionId: adoptionIdStr, dag: dagStr } = await params
  const adoptionId = parseInt(adoptionIdStr)
  const dagNummer = parseInt(dagStr)
  const userId = parseInt(session.user.id)

  // Verificeer eigenaarschap
  const [adoptie] = await db
    .select({ id: adopties.id })
    .from(adopties)
    .where(and(eq(adopties.id, adoptionId), eq(adopties.userId, userId)))
    .limit(1)

  if (!adoptie) return NextResponse.json({ error: 'Adoptie niet gevonden' }, { status: 404 })

  const [dag] = await db
    .select()
    .from(nazorgDagen)
    .where(and(eq(nazorgDagen.adoptieId, adoptionId), eq(nazorgDagen.dagNummer, dagNummer)))
    .limit(1)

  if (!dag) return NextResponse.json({ error: 'Dag niet gevonden' }, { status: 404 })

  return NextResponse.json({ data: dag })
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { adoptionId: adoptionIdStr, dag: dagStr } = await params
  const adoptionId = parseInt(adoptionIdStr)
  const dagNummer = parseInt(dagStr)
  const userId = parseInt(session.user.id)

  const body = await request.json()
  const { checklist, aantekeningenGebruiker, checklistVoltooid } = body

  // Verificeer eigenaarschap
  const [adoptie] = await db
    .select({ id: adopties.id })
    .from(adopties)
    .where(and(eq(adopties.id, adoptionId), eq(adopties.userId, userId)))
    .limit(1)

  if (!adoptie) return NextResponse.json({ error: 'Adoptie niet gevonden' }, { status: 404 })

  const updates: Record<string, unknown> = { bijgewerktOp: new Date() }
  if (checklist !== undefined) updates.checklist = checklist
  if (aantekeningenGebruiker !== undefined) updates.aantekeningenGebruiker = aantekeningenGebruiker
  if (checklistVoltooid !== undefined) updates.checklistVoltooid = checklistVoltooid

  const [updated] = await db
    .update(nazorgDagen)
    .set(updates)
    .where(and(eq(nazorgDagen.adoptieId, adoptionId), eq(nazorgDagen.dagNummer, dagNummer)))
    .returning()

  return NextResponse.json({ data: updated })
}
