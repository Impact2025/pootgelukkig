import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { adopties, dieren, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { stuurEmail, adoptieStatusHtml } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // TODO: admin auth check wanneer admin-sessies zijn ingesteld
  const { id } = await params
  const adoptieId = parseInt(id)
  if (isNaN(adoptieId)) return NextResponse.json({ error: 'Ongeldig ID' }, { status: 400 })

  const { status } = await request.json()
  const toegestaan = ['goedgekeurd', 'afgerond', 'afgewezen', 'geannuleerd']
  if (!toegestaan.includes(status)) {
    return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
  }

  const [adoptie] = await db
    .select({ dierId: adopties.dierId })
    .from(adopties)
    .where(eq(adopties.id, adoptieId))
    .limit(1)

  if (!adoptie) return NextResponse.json({ error: 'Adoptie niet gevonden' }, { status: 404 })

  const updates: Record<string, unknown> = { status, bijgewerktOp: new Date() }
  if (status === 'afgerond') updates.adoptieDatum = new Date()

  const [updated] = await db
    .update(adopties)
    .set(updates)
    .where(eq(adopties.id, adoptieId))
    .returning()

  // Email naar adoptant sturen
  const [adoptieInfo] = await db
    .select({ userId: adopties.userId, dierId: adopties.dierId })
    .from(adopties)
    .where(eq(adopties.id, adoptieId))
    .limit(1)

  if (adoptieInfo) {
    const [userInfo] = await db
      .select({ naam: users.naam, email: users.email })
      .from(users)
      .where(eq(users.id, adoptieInfo.userId))
      .limit(1)

    const [dierInfo] = await db
      .select({ naam: dieren.naam })
      .from(dieren)
      .where(eq(dieren.id, adoptieInfo.dierId))
      .limit(1)

    if (userInfo?.email && ['goedgekeurd', 'afgewezen', 'afgerond'].includes(status)) {
      stuurEmail({
        naar: userInfo.email,
        onderwerp: `Update over jouw adoptie van ${dierInfo?.naam}`,
        html: adoptieStatusHtml(dierInfo?.naam ?? 'een dier', status, userInfo.naam),
      })
    }
  }

  // Dier status synchroniseren
  const dierStatus =
    status === 'afgerond'
      ? 'geadopteerd'
      : status === 'afgewezen' || status === 'geannuleerd'
        ? 'beschikbaar'
        : 'in_behandeling'

  await db
    .update(dieren)
    .set({ status: dierStatus, bijgewerktOp: new Date() })
    .where(eq(dieren.id, adoptie.dierId))

  return NextResponse.json({ data: updated })
}
