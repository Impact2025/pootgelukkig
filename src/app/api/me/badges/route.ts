import { auth } from '@/auth'
import { db } from '@/lib/db'
import { matches, favorieten } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ matches: 0, favorieten: 0 })
  }

  const userId = parseInt(session.user.id)

  const [matchTelling] = await db
    .select({ aantal: count() })
    .from(matches)
    .where(eq(matches.userId, userId))

  const [favorietTelling] = await db
    .select({ aantal: count() })
    .from(favorieten)
    .where(eq(favorieten.userId, userId))

  return NextResponse.json({
    matches: matchTelling?.aantal ?? 0,
    favorieten: favorietTelling?.aantal ?? 0,
  })
}
