import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { dossiers } from '@/lib/db/schema'
import { and, eq, desc, ilike } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ data: [] })

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const status = searchParams.get('status')?.trim()
  const categorie = searchParams.get('categorie')?.trim()

  const condities = [eq(dossiers.organisatieId, organisatieId)]
  if (status) condities.push(eq(dossiers.status, status as typeof dossiers.$inferSelect.status))
  if (categorie) condities.push(eq(dossiers.categorie, categorie as typeof dossiers.$inferSelect.categorie))
  if (q) condities.push(ilike(dossiers.titel, `%${q}%`))

  const rijen = await db
    .select()
    .from(dossiers)
    .where(and(...condities))
    .orderBy(desc(dossiers.createdAt))

  return NextResponse.json({ data: rijen })
}

const nieuwDossierSchema = z.object({
  titel: z.string().min(1),
  categorie: z.enum(['wmo', 'participatie', 'jeugd', 'reintegratie', 'overig']),
  samenvatting: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ fout: 'Ongeldig verzoek' }, { status: 400 })
  }
  const parsed = nieuwDossierSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ fout: parsed.error.errors[0]?.message ?? 'Ongeldige invoer' }, { status: 400 })
  }

  const dossierNummer = `${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
  const [dossier] = await db
    .insert(dossiers)
    .values({
      organisatieId,
      dossierNummer,
      titel: parsed.data.titel,
      categorie: parsed.data.categorie,
      status: 'intake',
      samenvatting: parsed.data.samenvatting || null,
      vertrouwelijk: true,
    })
    .returning()

  return NextResponse.json({ data: dossier }, { status: 201 })
}
