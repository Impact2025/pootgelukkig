import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users, wachtwoordResets } from '@/lib/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  token: z.string().min(1),
  wachtwoord: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { token, wachtwoord } = parsed.data
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  try {
    // Geldig token: niet gebruikt én nog niet verlopen
    const [reset] = await db
      .select()
      .from(wachtwoordResets)
      .where(
        and(
          eq(wachtwoordResets.tokenHash, tokenHash),
          isNull(wachtwoordResets.gebruiktOp),
          gt(wachtwoordResets.verlooptOp, new Date())
        )
      )
      .limit(1)

    if (!reset) {
      return NextResponse.json(
        { error: 'Deze resetlink is ongeldig of verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(wachtwoord, 10)

    // Wachtwoord bijwerken en token markeren als gebruikt
    await db.update(users).set({ wachtwoordHash: hash }).where(eq(users.id, reset.userId))
    await db
      .update(wachtwoordResets)
      .set({ gebruiktOp: new Date() })
      .where(eq(wachtwoordResets.id, reset.id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Wachtwoord reset] Fout:', err)
    return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
  }
}
