import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { chatCompletion } from '@/lib/ai/client'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.asielId) {
    return NextResponse.json({ error: 'Niet bevoegd' }, { status: 401 })
  }

  const { naam, soort, ras, energieNiveau, alleenThuis, kindvriendelijk, katVriendelijk, hondenVriendelijk, tags, leeftijdJaren } = await req.json()

  const kenmerken = [
    kindvriendelijk && 'kindvriendelijk',
    katVriendelijk && 'kat-vriendelijk',
    hondenVriendelijk && 'honden-vriendelijk',
  ].filter(Boolean).join(', ')

  const prompt = `Schrijf een warm, persoonlijk adoptieverhaal van 3 zinnen in het Nederlands voor een dier met deze kenmerken:

Naam: ${naam}
Soort: ${ras ? `${ras} (${soort})` : soort}
Leeftijd: ${leeftijdJaren ? `${leeftijdJaren} jaar` : 'onbekend'}
Energieniveau: ${energieNiveau}
Alleen thuis: ${alleenThuis === 'slecht' ? 'moeilijk' : alleenThuis === 'matig' ? 'redelijk' : 'goed zelfstandig'}
${kenmerken ? `Compatibel met: ${kenmerken}` : ''}
${tags?.length ? `Karakter: ${tags.join(', ')}` : ''}

Regels:
- Schrijf vanuit het perspectief van het asiel, warm en persoonlijk
- Gebruik de naam ${naam} één keer
- Vertel wat ${naam} zoekt in een thuis
- Geen clichés als "op zoek naar een forever home"
- Max 60 woorden

Geef ALLEEN de tekst terug, geen aanhalingstekens of uitleg.`

  try {
    const verhaal = await chatCompletion([
      { role: 'user', content: prompt }
    ], { maxTokens: 150 })

    return NextResponse.json({ data: { verhaal: verhaal.trim() } })
  } catch (err) {
    console.error('Verhaal genereer fout:', err)
    return NextResponse.json({ error: 'Genereren mislukt' }, { status: 500 })
  }
}
