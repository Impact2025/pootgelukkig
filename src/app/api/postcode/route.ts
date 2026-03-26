import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const postcode = request.nextUrl.searchParams.get('postcode')?.replace(/\s/g, '').toUpperCase()

  if (!postcode || !/^\d{4}[A-Z]{2}$/.test(postcode)) {
    return NextResponse.json({ error: 'Ongeldige postcode (bijv. 1234AB)' }, { status: 400 })
  }

  try {
    // PDOK Locatieserver — gratis Nederlandse overheids-API
    // Zoek op type:adres met volledige postcode voor woonplaatsnaam
    const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${postcode}&fq=type:adres&rows=1`
    const res = await fetch(url, {
      next: { revalidate: 86400 }, // 24u cache
    })

    if (!res.ok) throw new Error('PDOK fout')

    const data = await res.json()
    const doc = data?.response?.docs?.[0]

    if (!doc) {
      return NextResponse.json({ error: 'Postcode niet gevonden' }, { status: 404 })
    }

    // Coördinaten zitten als WKT: "POINT(lon lat)"
    const wkt = doc.centroide_ll ?? ''
    const match = wkt.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
    const lng = match ? parseFloat(match[1]) : 0
    const lat = match ? parseFloat(match[2]) : 0

    const stad = doc.woonplaatsnaam ?? doc.gemeentenaam ?? ''

    return NextResponse.json({ stad, lat, lng })
  } catch {
    return NextResponse.json({ error: 'Postcode opzoeken mislukt' }, { status: 502 })
  }
}
