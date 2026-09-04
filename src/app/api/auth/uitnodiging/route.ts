import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users, teamUitnodigingen, organisaties } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

async function haalGeldigeUitnodiging(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const [uitnodiging] = await db
    .select({
      id: teamUitnodigingen.id,
      email: teamUitnodigingen.email,
      organisatieId: teamUitnodigingen.organisatieId,
    })
    .from(teamUitnodigingen)
    .where(
      and(
        eq(teamUitnodigingen.tokenHash, tokenHash),
        eq(teamUitnodigingen.status, 'open'),
        gt(teamUitnodigingen.verlooptOp, new Date())
      )
    )
    .limit(1)
  return uitnodiging
}

// GET ?token=... — valideert een uitnodigingslink en toont om welke organisatie/e-mail het gaat.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Geen token meegegeven' }, { status: 400 })

  const uitnodiging = await haalGeldigeUitnodiging(token)
  if (!uitnodiging) {
    return NextResponse.json({ error: 'Deze uitnodiging is ongeldig, ingetrokken of verlopen.' }, { status: 400 })
  }

  const [organisatie] = await db.select({ naam: organisaties.naam }).from(organisaties).where(eq(organisaties.id, uitnodiging.organisatieId)).limit(1)

  return NextResponse.json({ email: uitnodiging.email, organisatieNaam: organisatie?.naam ?? 'je organisatie' })
}

const accepteerSchema = z.object({
  token: z.string().min(1),
  naam: z.string().min(2, 'Vul je naam in').max(120),
  wachtwoord: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
})

// POST — accepteert de uitnodiging: maakt het account aan en markeert de uitnodiging als geaccepteerd.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = accepteerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }
  const { token, naam, wachtwoord } = parsed.data

  const uitnodiging = await haalGeldigeUitnodiging(token)
  if (!uitnodiging) {
    return NextResponse.json({ error: 'Deze uitnodiging is ongeldig, ingetrokken of verlopen.' }, { status: 400 })
  }

  const [bestaandeGebruiker] = await db.select({ id: users.id }).from(users).where(eq(users.email, uitnodiging.email)).limit(1)
  if (bestaandeGebruiker) {
    return NextResponse.json({ error: 'Er bestaat al een account met dit e-mailadres. Log in plaats daarvan in.' }, { status: 409 })
  }

  const wachtwoordHash = await bcrypt.hash(wachtwoord, 10)

  await db.insert(users).values({
    naam,
    email: uitnodiging.email,
    wachtwoordHash,
    rol: 'asiel',
    organisatieId: uitnodiging.organisatieId,
    profielVoltooid: true,
  })

  await db
    .update(teamUitnodigingen)
    .set({ status: 'geaccepteerd', geaccepteerdOp: new Date() })
    .where(eq(teamUitnodigingen.id, uitnodiging.id))

  return NextResponse.json({ ok: true })
}
