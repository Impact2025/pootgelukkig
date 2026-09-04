import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { randomBytes } from 'crypto'
import { isGeldigeProvider, haalProviderModule } from '@/lib/integraties/registry'

export const dynamic = 'force-dynamic'

// GET — start de OAuth-flow: zet een CSRF-state-cookie en redirect naar de consent-pagina.
export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const session = await auth()
  if (!session?.user || !['asiel', 'admin'].includes(session.user.rol)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (!session.user.organisatieId) {
    return NextResponse.redirect(new URL('/admin/instellingen?integratie_fout=geen_organisatie', request.url))
  }

  const { provider } = await params
  if (!isGeldigeProvider(provider)) {
    return NextResponse.json({ fout: 'Onbekende provider' }, { status: 400 })
  }

  const mod = haalProviderModule(provider)
  if (!mod.geconfigureerd()) {
    return NextResponse.redirect(new URL(`/admin/instellingen?integratie_fout=niet_geconfigureerd&provider=${provider}`, request.url))
  }

  const state = randomBytes(24).toString('hex')
  const response = NextResponse.redirect(mod.bouwAutorisatieUrl(state))
  response.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minuten — ruim voldoende voor de consent-flow
    path: '/',
  })
  return response
}
