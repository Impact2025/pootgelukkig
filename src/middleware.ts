import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/pitch', '/auth/wachtwoord-vergeten', '/auth/wachtwoord-reset']
const PUBLIC_API_ROUTES = ['/api/register', '/api/postcode', '/api/cron', '/api/coupons/valideer', '/api/blog/agent-os']
const API_AUTH_PREFIX = '/api/auth'
const ASIEL_ROUTES = ['/admin']
const MANAGEMENT_ROUTES = ['/management']
const ADOPTANT_ROUTES = ['/dashboard', '/intake', '/favorieten', '/dossier', '/nazorg', '/zoeken', '/profiel', '/chat', '/medical']
// Publieke marketing-site — altijd toegankelijk, ook uitgelogd
const MARKETING_ROUTES = ['/werkwijze', '/voor-asielen', '/prijzen', '/ai-assistent', '/over-ons', '/faq', '/kennisbank', '/contact', '/demo-aanvragen']
// Publieke content-pagina's: dier- en asielprofielen. Volledig indexeerbaar voor SEO.
// Renderen zonder sessie (alleen publieke dier/asiel-data); ingelogde adoptanten
// krijgen dezelfde pagina verrijkt met matchscore, favorieten en afspraken.
const PUBLIC_CONTENT_ROUTES = ['/animals', '/asielen']

function thuisRoute(rol?: string) {
  return rol === 'admin' ? '/management' : rol === 'asiel' ? '/admin' : '/dashboard'
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const rol = req.auth?.user?.rol as string | undefined

  // ── Onderhoudsmodus ──────────────────────────────────────────────────────
  if (process.env.MAINTENANCE_MODE === '1') {
    // Laat de onderhoudspagina en statische assets altijd door
    if (!nextUrl.pathname.startsWith('/onderhoud') && !nextUrl.pathname.startsWith(API_AUTH_PREFIX)) {
      return NextResponse.redirect(new URL('/onderhoud', req.url))
    }
    return NextResponse.next()
  }
  // ────────────────────────────────────────────────────────────────────────

  if (nextUrl.pathname.startsWith(API_AUTH_PREFIX)) return NextResponse.next()
  if (PUBLIC_API_ROUTES.some((r) => nextUrl.pathname.startsWith(r))) return NextResponse.next()

  // Publieke blog + SEO-bestanden: altijd toegankelijk, ook uitgelogd, zonder redirect.
  // OG-/twitter-images (next/og) hebben geen bestandsextensie en moeten voor crawlers
  // bereikbaar zijn zonder login.
  if (
    nextUrl.pathname === '/blog' ||
    nextUrl.pathname.startsWith('/blog/') ||
    nextUrl.pathname === '/sitemap.xml' ||
    nextUrl.pathname === '/robots.txt' ||
    nextUrl.pathname.includes('opengraph-image') ||
    nextUrl.pathname.includes('twitter-image')
  ) {
    return NextResponse.next()
  }

  // Marketing-subpagina's: altijd publiek, ook voor ingelogde gebruikers
  if (MARKETING_ROUTES.some((r) => nextUrl.pathname === r || nextUrl.pathname.startsWith(r + '/'))) {
    return NextResponse.next()
  }

  // Publieke dier- en asielprofielen: altijd toegankelijk (ook uitgelogd, voor SEO)
  if (PUBLIC_CONTENT_ROUTES.some((r) => nextUrl.pathname === r || nextUrl.pathname.startsWith(r + '/'))) {
    return NextResponse.next()
  }

  // Publieke routes — ingelogde gebruikers sturen naar hun eigen home
  if (PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r))) {
    if (isLoggedIn) return NextResponse.redirect(new URL(thuisRoute(rol), req.url))
    return NextResponse.next()
  }

  // Root: uitgelogde bezoekers zien de marketing-homepage; ingelogde gebruikers
  // gaan naar hun eigen home (dashboard of admin).
  if (nextUrl.pathname === '/') {
    if (isLoggedIn) return NextResponse.redirect(new URL(thuisRoute(rol), req.url))
    return NextResponse.next()
  }

  // Niet ingelogd → login
  if (!isLoggedIn) {
    const url = new URL('/auth/login', req.url)
    url.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Asiel-gebruiker probeert adoptant-pagina's te bezoeken → admin
  const isAdoptantRoute = ADOPTANT_ROUTES.some((r) => nextUrl.pathname.startsWith(r))
  if (isAdoptantRoute && (rol === 'asiel' || rol === 'admin')) {
    return NextResponse.redirect(new URL(rol === 'admin' ? '/management' : '/admin', req.url))
  }

  // Adoptant probeert admin-pagina's te bezoeken → dashboard
  const isAsielRoute = ASIEL_ROUTES.some((r) => nextUrl.pathname.startsWith(r))
  if (isAsielRoute && rol === 'adoptant') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Admin hoort in het management-portaal; /admin is voor asielen.
  if (isAsielRoute && rol === 'admin') {
    return NextResponse.redirect(new URL('/management', req.url))
  }

  // Asiel mag niet in het management-portaal.
  const isManagementRoute = MANAGEMENT_ROUTES.some((r) => nextUrl.pathname.startsWith(r))
  if (isManagementRoute && rol !== 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|ico|webp)$).*)'],
}
