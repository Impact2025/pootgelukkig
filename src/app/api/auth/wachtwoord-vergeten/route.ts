import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { db } from '@/lib/db'
import { users, wachtwoordResets } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { stuurWachtwoordReset } from '@/lib/email'

export const dynamic = 'force-dynamic'

const GELDIG_MINUTEN = 60

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  // Altijd dezelfde respons, ook bij ongeldige invoer of onbekend e-mailadres
  // (voorkomt dat aanvallers kunnen achterhalen welke e-mails bestaan).
  const okResponse = NextResponse.json({
    ok: true,
    bericht: 'Als dit e-mailadres bij ons bekend is, ontvang je een resetlink.',
  })

  if (!parsed.success) return okResponse
  const email = parsed.data.email.toLowerCase()

  try {
    const [user] = await db
      .select({ id: users.id, naam: users.naam, email: users.email, hash: users.wachtwoordHash })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    // Geen account, of account zonder wachtwoord (bv. alleen magic link) → stil stoppen
    if (!user?.hash) return okResponse

    // Eerdere ongebruikte tokens van deze gebruiker ongeldig maken
    await db
      .update(wachtwoordResets)
      .set({ gebruiktOp: new Date() })
      .where(and(eq(wachtwoordResets.userId, user.id), isNull(wachtwoordResets.gebruiktOp)))

    // Nieuw token genereren: ruwe token in de mail, alleen de hash in de database
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

    await db.insert(wachtwoordResets).values({
      userId: user.id,
      tokenHash,
      verlooptOp: new Date(Date.now() + GELDIG_MINUTEN * 60 * 1000),
    })

    await stuurWachtwoordReset({
      email: user.email,
      naam: user.naam,
      token,
      geldigMinuten: GELDIG_MINUTEN,
    })
  } catch (err) {
    console.error('[Wachtwoord vergeten] Fout:', err)
    // Bewust geen foutdetails teruggeven
  }

  return okResponse
}
