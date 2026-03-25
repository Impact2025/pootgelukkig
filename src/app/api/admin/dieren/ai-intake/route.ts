import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { chatCompletion } from '@/lib/ai/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
  }

  const body = await req.json() as { naam?: string; soort?: string; beschrijving?: string }
  const { naam, soort, beschrijving } = body

  if (!naam || !soort) {
    return NextResponse.json({ error: 'Naam en soort zijn verplicht' }, { status: 400 })
  }

  const prompt = `Je bent een ervaren medewerker van een Nederlands dierenasiel. Genereer een professioneel intakeprofiel voor het volgende dier.

Naam: ${naam}
Soort: ${soort}
Beschrijving door medewerker: ${beschrijving ?? 'geen aanvullende informatie'}

Genereer de volgende onderdelen en return ALLEEN geldig JSON (geen markdown, geen uitleg):
{
  "verhaal": "Een warm, persoonlijk verhaal van 3-4 zinnen over dit dier. Geschreven vanuit het perspectief van het asiel. Spreek de lezer direct aan.",
  "gedragsProfiel": {
    "energieNiveau": "laag|normaal|hoog|zeer_hoog",
    "kindvriendelijk": true,
    "katVriendelijk": true,
    "hondenVriendelijk": true,
    "alleenThuis": "goed|matig|slecht",
    "trainbaarheid": "laag|normaal|hoog",
    "blaffen": "weinig|normaal|veel",
    "speelsheid": "laag|normaal|hoog",
    "tags": ["maximaal 5 relevante eigenschappen in het Nederlands"]
  },
  "medischPlan": "Korte aanbeveling voor medische checks en vaccinaties passend bij dit diersoort, max 2 zinnen.",
  "plaatsingsTips": "2 concrete tips voor een goede plaatsing van dit specifieke dier, max 2 zinnen."
}`

  const raw = await chatCompletion(
    [{ role: 'user', content: prompt }],
    { maxTokens: 1000 }
  )

  let profiel: unknown
  try {
    // Strip mogelijke markdown code blocks
    const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
    profiel = JSON.parse(cleaned)
  } catch {
    return NextResponse.json({ error: 'AI kon geen geldig profiel genereren. Probeer opnieuw.' }, { status: 500 })
  }

  return NextResponse.json({ data: profiel })
}
