import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isGeldigeProvider, haalProviderModule } from '@/lib/integraties/registry'
import { haalKoppelingStatus, haalGeldigeAccessToken, verwijderKoppeling } from '@/lib/integraties/store'

export const dynamic = 'force-dynamic'

// GET — status van de koppeling + (indien gekoppeld) de eerstvolgende agenda-items.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { provider } = await params
  if (!isGeldigeProvider(provider)) {
    return NextResponse.json({ fout: 'Onbekende provider' }, { status: 400 })
  }

  const status = await haalKoppelingStatus(organisatieId, provider)
  if (!status.gekoppeld) {
    return NextResponse.json({ ...status, geconfigureerd: haalProviderModule(provider).geconfigureerd(), agendaItems: [] })
  }

  try {
    const accessToken = await haalGeldigeAccessToken(organisatieId, provider)
    const agendaItems = accessToken ? await haalProviderModule(provider).haalAgendaItems(accessToken) : []
    return NextResponse.json({ ...status, geconfigureerd: true, agendaItems })
  } catch (error) {
    console.error(`Agenda ophalen (${provider}) mislukt:`, error)
    return NextResponse.json({ ...status, geconfigureerd: true, agendaItems: [], agendaFout: 'Kon de agenda niet ophalen' })
  }
}

// DELETE — koppeling verbreken (tokens worden verwijderd, niets herroepen aan de providerkant).
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.json({ fout: 'Geen toegang' }, { status: 401 })
  }
  const organisatieId = session.user.organisatieId
  if (!organisatieId) return NextResponse.json({ fout: 'Geen organisatie gekoppeld' }, { status: 400 })

  const { provider } = await params
  if (!isGeldigeProvider(provider)) {
    return NextResponse.json({ fout: 'Onbekende provider' }, { status: 400 })
  }

  const verwijderd = await verwijderKoppeling(organisatieId, provider)
  if (!verwijderd) return NextResponse.json({ fout: 'Geen koppeling gevonden' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
