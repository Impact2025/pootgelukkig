import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { asielen } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const { id } = await params
  const asielId = parseInt(id)

  // Asiel-gebruikers mogen alleen hun eigen asiel bewerken
  if (session.user.rol === 'asiel' && session.user.asielId !== asielId) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await request.json()
  const {
    naam, stad, regio, adres, postcode, lat, lng,
    telefoon, email, website, beschrijving, logoUrl,
    openingstijden, socialMedia, asielConfig,
  } = body

  const updates: Record<string, unknown> = {}
  if (naam !== undefined) updates.naam = naam
  if (stad !== undefined) updates.stad = stad
  if (regio !== undefined) updates.regio = regio
  if (adres !== undefined) updates.adres = adres
  if (postcode !== undefined) updates.postcode = postcode
  if (lat !== undefined) updates.lat = lat
  if (lng !== undefined) updates.lng = lng
  if (telefoon !== undefined) updates.telefoon = telefoon
  if (email !== undefined) updates.email = email
  if (website !== undefined) updates.website = website
  if (beschrijving !== undefined) updates.beschrijving = beschrijving
  if (logoUrl !== undefined) updates.logoUrl = logoUrl
  if (openingstijden !== undefined) updates.openingstijden = openingstijden
  if (socialMedia !== undefined) updates.socialMedia = socialMedia
  if (asielConfig !== undefined) updates.asielConfig = asielConfig

  await db.update(asielen).set(updates).where(eq(asielen.id, asielId))

  return NextResponse.json({ succes: true })
}
