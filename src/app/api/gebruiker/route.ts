import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  }

  const userId = parseInt(session.user.id)
  const body = await request.json()
  const { postcode, stad, lat, lng } = body

  await db
    .update(users)
    .set({
      postcode: postcode ?? null,
      stad: stad ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      bijgewerktOp: new Date(),
    })
    .where(eq(users.id, userId))

  return NextResponse.json({ succes: true })
}
