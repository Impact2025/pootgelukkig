import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { kenniskluisDocumenten } from '@/lib/db/schema'
import { and, eq, count, desc } from 'drizzle-orm'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

const TOEGESTANE_TYPES = ['application/pdf', 'text/plain', 'text/markdown']
const MAX_BESTANDSGROOTTE = 15 * 1024 * 1024 // 15MB
const MAX_DOCUMENTEN_PER_ORGANISATIE = 10
// Ingekort per document zodat de kenniskluis-context van meerdere PDF's samen
// nog binnen een redelijk prompt-budget blijft (zie rollen/context.ts).
const MAX_TEKST_LENGTE = 20_000

const ECHTE_BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.BLOB_READ_WRITE_TOKEN.length > 30 &&
  !process.env.BLOB_READ_WRITE_TOKEN.includes('...')

// GET — lijst kenniskluis-documenten voor de eigen organisatie.
export async function GET() {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ items: [] })

  const items = await db
    .select({
      id: kenniskluisDocumenten.id,
      bestandsnaam: kenniskluisDocumenten.bestandsnaam,
      mimeType: kenniskluisDocumenten.mimeType,
      grootteBytes: kenniskluisDocumenten.grootteBytes,
      status: kenniskluisDocumenten.status,
      foutmelding: kenniskluisDocumenten.foutmelding,
      aangemaaktOp: kenniskluisDocumenten.aangemaaktOp,
      blobUrl: kenniskluisDocumenten.blobUrl,
    })
    .from(kenniskluisDocumenten)
    .where(eq(kenniskluisDocumenten.organisatieId, organisatieId))
    .orderBy(desc(kenniskluisDocumenten.aangemaaktOp))

  return NextResponse.json({ items })
}

async function extraheerTekst(bestand: File): Promise<{ tekst: string | null; fout: string | null }> {
  try {
    const buffer = Buffer.from(await bestand.arrayBuffer())

    if (bestand.type === 'application/pdf') {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      try {
        const resultaat = await parser.getText()
        return { tekst: resultaat.text.slice(0, MAX_TEKST_LENGTE), fout: null }
      } finally {
        await parser.destroy()
      }
    }

    // text/plain, text/markdown
    return { tekst: buffer.toString('utf-8').slice(0, MAX_TEKST_LENGTE), fout: null }
  } catch (error) {
    console.error('Kenniskluis tekst-extractie mislukt:', error)
    return { tekst: null, fout: 'Kon geen tekst uit dit bestand halen (mogelijk gescand of beveiligd document).' }
  }
}

async function slaBlobOp(bestand: File, bestandsnaam: string): Promise<string> {
  if (ECHTE_BLOB_TOKEN) {
    const { put } = await import('@vercel/blob')
    const blob = await put(`kenniskluis/${bestandsnaam}`, bestand, { access: 'public' })
    return blob.url
  }

  if (process.env.VERCEL) {
    throw new Error('BLOB_READ_WRITE_TOKEN is niet ingesteld in Vercel environment variables')
  }

  // Lokale opslag (development zonder Vercel Blob token)
  const uploadDir = path.join(process.cwd(), 'public', 'kenniskluis')
  await fs.mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await bestand.arrayBuffer())
  await fs.writeFile(path.join(uploadDir, bestandsnaam), buffer)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 8700}`
  return `${baseUrl}/kenniskluis/${bestandsnaam}`
}

// POST — upload een document naar de kenniskluis (PDF of tekst), extraheer de tekst
// en maak die direct beschikbaar als context voor Sam, Mila en Conny.
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const [aantalResult] = await db
    .select({ aantal: count() })
    .from(kenniskluisDocumenten)
    .where(eq(kenniskluisDocumenten.organisatieId, organisatieId))
  if ((aantalResult?.aantal ?? 0) >= MAX_DOCUMENTEN_PER_ORGANISATIE) {
    return NextResponse.json(
      { fout: `Maximaal ${MAX_DOCUMENTEN_PER_ORGANISATIE} documenten in de kenniskluis. Verwijder eerst een document.` },
      { status: 400 }
    )
  }

  const formData = await request.formData()
  const bestand = formData.get('bestand') as File | null
  if (!bestand) return NextResponse.json({ fout: 'Geen bestand meegegeven' }, { status: 400 })

  if (!TOEGESTANE_TYPES.includes(bestand.type)) {
    return NextResponse.json({ fout: 'Alleen PDF, TXT en Markdown-bestanden zijn toegestaan' }, { status: 400 })
  }
  if (bestand.size > MAX_BESTANDSGROOTTE) {
    return NextResponse.json({ fout: 'Bestand mag maximaal 15MB zijn' }, { status: 400 })
  }

  const veiligeNaam = `${Date.now()}-${bestand.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase()}`

  let blobUrl: string
  try {
    blobUrl = await slaBlobOp(bestand, veiligeNaam)
  } catch (error) {
    console.error('Kenniskluis upload mislukt:', error)
    return NextResponse.json({ fout: 'Upload mislukt. Probeer opnieuw.' }, { status: 500 })
  }

  const { tekst, fout: extractieFout } = await extraheerTekst(bestand)

  const [document] = await db
    .insert(kenniskluisDocumenten)
    .values({
      organisatieId,
      bestandsnaam: bestand.name,
      blobUrl,
      mimeType: bestand.type,
      grootteBytes: bestand.size,
      tekstInhoud: tekst,
      status: tekst ? 'verwerkt' : 'mislukt',
      foutmelding: extractieFout,
    })
    .returning()

  return NextResponse.json({ data: document }, { status: 201 })
}
