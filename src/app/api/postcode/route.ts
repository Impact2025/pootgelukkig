import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get('postcode')?.replace(/\s/g, '').toUpperCase()

  if (!postcode || !/^\d{4}[A-Z]{2}$/.test(postcode)) {
    return NextResponse.json({ error: 'Ongeldige postcode (bijv. 1234AB)' }, { status: 400 })
  }

  try {
    // Nominatim (OpenStreetMap) — betrouwbaar voor Nederlandse postcode lookups
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${postcode}&countrycodes=NL&format=json&limit=1&addressdetails=1&accept-language=nl`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PootGelukkig/1.0 (pootgelukkig.nl)' },
      next: { revalidate: 86400 }, // 24u cache
    })

    if (!res.ok) throw new Error('Nominatim fout')

    const data = await res.json()
    const item = data?.[0]

    if (!item) {
      return NextResponse.json({ error: 'Postcode niet gevonden' }, { status: 404 })
    }

    const addr = item.address
    const stad = addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? ''
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)

    return NextResponse.json({ stad, lat, lng })
  } catch {
    return NextResponse.json({ error: 'Postcode opzoeken mislukt' }, { status: 502 })
  }
}
