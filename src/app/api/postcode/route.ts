import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get('postcode')?.replace(/\s/g, '').toUpperCase()

  if (!postcode || !/^\d{4}[A-Z]{2}$/.test(postcode)) {
    return NextResponse.json({ error: 'Ongeldige postcode (bijv. 1234AB)' }, { status: 400 })
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&country=NL&format=json&limit=1&addressdetails=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PootGelukkig/1.0 (info@pootgelukkig.nl)' },
      next: { revalidate: 86400 }, // 24u cache
    })

    if (!res.ok) throw new Error('Nominatim fout')

    const data = await res.json()
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Postcode niet gevonden' }, { status: 404 })
    }

    const resultaat = data[0]
    const adres = resultaat.address ?? {}
    const stad =
      adres.city ?? adres.town ?? adres.village ?? adres.municipality ?? adres.county ?? ''

    return NextResponse.json({
      stad,
      lat: parseFloat(resultaat.lat),
      lng: parseFloat(resultaat.lon),
    })
  } catch {
    return NextResponse.json({ error: 'Postcode opzoeken mislukt' }, { status: 502 })
  }
}
