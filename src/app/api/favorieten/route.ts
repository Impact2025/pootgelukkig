import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { favorieten } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { dierId } = await request.json()
  const userId = parseInt(session.user.id)

  // Check of al favoriet
  const [bestaand] = await db
    .select({ id: favorieten.id })
    .from(favorieten)
    .where(and(eq(favorieten.userId, userId), eq(favorieten.dierId, dierId)))
    .limit(1)

  if (bestaand) {
    // Verwijder favoriet
    await db
      .delete(favorieten)
      .where(and(eq(favorieten.userId, userId), eq(favorieten.dierId, dierId)))
    return NextResponse.json({ data: { gefavoriet: false } })
  }

  // Voeg toe als favoriet
  await db.insert(favorieten).values({ userId, dierId })
  return NextResponse.json({ data: { gefavoriet: true } }, { status: 201 })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ data: [] })

  const userId = parseInt(session.user.id)
  const url = new URL(request.url)
  const dierId = url.searchParams.get('dierId')

  if (dierId) {
    const [fav] = await db
      .select({ id: favorieten.id })
      .from(favorieten)
      .where(and(eq(favorieten.userId, userId), eq(favorieten.dierId, parseInt(dierId))))
      .limit(1)
    return NextResponse.json({ data: { gefavoriet: !!fav } })
  }

  const allesFavorieten = await db
    .select({ dierId: favorieten.dierId })
    .from(favorieten)
    .where(eq(favorieten.userId, userId))

  return NextResponse.json({ data: allesFavorieten.map((f) => f.dierId) })
}
