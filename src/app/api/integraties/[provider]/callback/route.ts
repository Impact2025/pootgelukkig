import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isGeldigeProvider, haalProviderModule } from '@/lib/integraties/registry'
import { slaKoppelingOp } from '@/lib/integraties/store'

export const dynamic = 'force-dynamic'

// GET — OAuth-callback: wisselt de code voor tokens, versleutelt en slaat ze op.
export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth()
  if (!session?.user || !session.user.organisatieId) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const { provider } = await params
  if (!isGeldigeProvider(provider)) {
    return NextResponse.json({ fout: 'Onbekende provider' }, { status: 400 })
  }

  const terugNaarInstellingen = (query: string) => NextResponse.redirect(new URL(`/admin/instellingen${query}`, request.url))

  const { searchParams } = request.nextUrl
  const fout = searchParams.get('error')
  if (fout) {
    return terugNaarInstellingen(`?integratie_fout=geweigerd&provider=${provider}`)
  }

  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const stateCookie = request.cookies.get(`oauth_state_${provider}`)?.value

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return terugNaarInstellingen(`?integratie_fout=ongeldige_state&provider=${provider}`)
  }

  const mod = haalProviderModule(provider)
  try {
    const tokens = await mod.wisselCodeVoorTokens(code)
    const accountEmail = await mod.haalGebruikersEmail(tokens.accessToken)
    await slaKoppelingOp(session.user.organisatieId, provider, tokens, accountEmail)
  } catch (error) {
    console.error(`OAuth-koppeling (${provider}) mislukt:`, error)
    return terugNaarInstellingen(`?integratie_fout=koppelen_mislukt&provider=${provider}`)
  }

  const response = terugNaarInstellingen(`?integratie_gekoppeld=${provider}`)
  response.cookies.delete(`oauth_state_${provider}`)
  return response
}
