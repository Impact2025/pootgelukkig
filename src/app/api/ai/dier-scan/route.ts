import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { chatCompletion } from '@/lib/ai/client'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.asielId) {
    return NextResponse.json({ error: 'Niet bevoegd' }, { status: 401 })
  }

  const { fotoUrl } = await req.json()
  if (!fotoUrl) return NextResponse.json({ error: 'fotoUrl vereist' }, { status: 400 })

  const prompt = `Analyseer deze foto van een dier en geef een JSON object terug.

Bepaal:
- soort: "hond" | "kat" | "konijn" | "vogel" | "cavia" | "hamster" | "overig"
- ras: het ras indien herkenbaar, anders null
- geschatteLeeftijd: schatting in jaren als integer, null als onmogelijk
- geslacht: "man" | "vrouw" | null (alleen als duidelijk zichtbaar)
- energieNiveau: "laag" | "normaal" | "hoog" | "zeer_hoog" — baseer op houding/bouw
- tags: array van 2-4 Nederlandse persoonlijkheidstags op basis van uiterlijk/houding (bijv. "vrolijk", "speels", "rustig", "alert", "knuffelig", "nieuwsgierig")
- verhaal: 2-3 zinnen in warm, persoonlijk Nederlands voor adoptanten. Begin NIET met de naam. Focus op karakter en wat dit dier bijzonder maakt.

Geef ALLEEN dit JSON object terug, geen uitleg:
{"soort":"...","ras":null,"geschatteLeeftijd":null,"geslacht":null,"energieNiveau":"normaal","tags":[],"verhaal":"..."}`

  try {
    const tekst = await chatCompletion([
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: fotoUrl } },
        ],
      },
    ], { maxTokens: 400, model: 'anthropic/claude-sonnet-4-5' })

    const start = tekst.indexOf('{')
    const end = tekst.lastIndexOf('}')
    if (start === -1 || end === -1) throw new Error('Geen JSON')

    const resultaat = JSON.parse(tekst.slice(start, end + 1))
    return NextResponse.json({ data: resultaat })
  } catch (err) {
    console.error('Dier scan fout:', err)
    return NextResponse.json({ error: 'Analyse mislukt' }, { status: 500 })
  }
}
