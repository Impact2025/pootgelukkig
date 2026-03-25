import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { berichten, gesprekken } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const gesprekId = parseInt(conversationId)
    if (isNaN(gesprekId)) {
      return NextResponse.json({ error: 'Ongeldig gesprek ID' }, { status: 400 })
    }

    const msgs = await db
      .select()
      .from(berichten)
      .where(eq(berichten.gesprekId, gesprekId))
      .orderBy(berichten.verstuurdOp)

    return NextResponse.json({ data: msgs })
  } catch (error) {
    console.error('Chat GET fout:', error)
    return NextResponse.json({ error: 'Kon berichten niet ophalen' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const gesprekId = parseInt(conversationId)
    const body = await request.json()
    const { inhoud, verzenderType, verzenderId } = body

    if (!inhoud?.trim()) {
      return NextResponse.json({ error: 'Bericht mag niet leeg zijn' }, { status: 400 })
    }

    const [nieuwBericht] = await db
      .insert(berichten)
      .values({ gesprekId, inhoud: inhoud.trim(), verzenderType, verzenderId })
      .returning()

    await db
      .update(gesprekken)
      .set({ laasteBerichtOp: new Date() })
      .where(eq(gesprekken.id, gesprekId))

    return NextResponse.json({ data: nieuwBericht }, { status: 201 })
  } catch (error) {
    console.error('Chat POST fout:', error)
    return NextResponse.json({ error: 'Kon bericht niet versturen' }, { status: 500 })
  }
}
