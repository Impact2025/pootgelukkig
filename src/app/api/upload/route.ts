import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import path from 'path'
import fs from 'fs/promises'

export const dynamic = 'force-dynamic'

const ECHTE_BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN &&
  process.env.BLOB_READ_WRITE_TOKEN.length > 30 &&
  !process.env.BLOB_READ_WRITE_TOKEN.includes('...')

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Geen bestand meegegeven' }, { status: 400 })

  const toegestaneTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!toegestaneTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Alleen JPG, PNG en WebP bestanden zijn toegestaan' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Bestand mag maximaal 5MB zijn' }, { status: 400 })
  }

  const bestandsnaam = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '-').toLowerCase()}`

  // Vercel Blob (productie)
  if (ECHTE_BLOB_TOKEN) {
    const { put } = await import('@vercel/blob')
    const blob = await put(`dieren/${bestandsnaam}`, file, { access: 'public' })
    return NextResponse.json({ url: blob.url })
  }

  // Lokale opslag (development zonder Vercel Blob token)
  const uploadDir = path.join(process.cwd(), 'public', 'dieren')
  await fs.mkdir(uploadDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  await fs.writeFile(path.join(uploadDir, bestandsnaam), buffer)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 8700}`
  return NextResponse.json({ url: `${baseUrl}/dieren/${bestandsnaam}` })
}
