import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { kenniskluisDocumenten } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const ECHTE_BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.BLOB_READ_WRITE_TOKEN.length > 30 &&
  !process.env.BLOB_READ_WRITE_TOKEN.includes('...')

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { id } = await params
  const documentId = Number(id)
  if (!Number.isInteger(documentId)) return NextResponse.json({ fout: 'Ongeldig id' }, { status: 400 })

  const [verwijderd] = await db
    .delete(kenniskluisDocumenten)
    .where(and(eq(kenniskluisDocumenten.id, documentId), eq(kenniskluisDocumenten.organisatieId, organisatieId)))
    .returning({ id: kenniskluisDocumenten.id, blobUrl: kenniskluisDocumenten.blobUrl })

  if (!verwijderd) return NextResponse.json({ fout: 'Document niet gevonden' }, { status: 404 })

  if (ECHTE_BLOB_TOKEN) {
    try {
      const { del } = await import('@vercel/blob')
      await del(verwijderd.blobUrl)
    } catch (error) {
      // Blob-verwijdering mag de API-response niet blokkeren; het DB-record is al weg.
      console.error('Kenniskluis blob verwijderen mislukt:', error)
    }
  }

  return NextResponse.json({ ok: true })
}
