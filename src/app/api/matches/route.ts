import { NextRequest, NextResponse } from 'next/server'
import { berekenMatch, type AdopterProfiel, type DierProfiel } from '@/lib/ai/matching'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adopterProfiel, dieren } = body as {
      adopterProfiel: AdopterProfiel
      dieren: DierProfiel[]
    }

    if (!adopterProfiel || !dieren?.length) {
      return NextResponse.json(
        { error: 'Adopter profiel en dieren zijn verplicht' },
        { status: 400 }
      )
    }

    // Bereken match voor elk dier parallel
    const matchResultaten = await Promise.all(
      dieren.map((dier) => berekenMatch(adopterProfiel, dier))
    )

    // Sorteer op score (hoogste eerst)
    const gesorteerd = matchResultaten
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ data: gesorteerd })
  } catch (error) {
    console.error('Matching API fout:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het berekenen van matches' },
      { status: 500 }
    )
  }
}
