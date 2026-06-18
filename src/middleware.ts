import NextAuth from 'next-auth'
import { authConfig } from './auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/pitch', '/auth/wachtwoord-vergeten', '/auth/wachtwoord-reset']
const PUBLIC_API_ROUTES = ['/api/register', '/api/postcode', '/api/cron']
const API_AUTH_PREFIX = '/api/auth'
const ASIEL_ROUTES = ['/admin']
const ADOPTANT_ROUTES = ['/dashboard', '/intake', '/animals', '/favorieten', '/dossier', '/nazorg', '/zoeken', '/profiel', '/chat', '/medical']

function thuisRoute(rol?: string) {
  return rol === 'asiel' || rol === 'admin' ? '/admin' : '/dashboard'
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

  // Publieke routes — ingelogde gebruikers sturen naar hun eigen home
  if (PUBLIC_ROUTES.some((r) => nextUrl.pathname.startsWith(r))) {
    if (isLoggedIn) return NextResponse.redirect(new URL(thuisRoute(rol), req.url))
    return NextResponse.next()
  }

  // Root redirect
  if (nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL(isLoggedIn ? thuisRoute(rol) : '/auth/login', req.url))
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
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Adoptant probeert admin-pagina's te bezoeken → dashboard
  const isAsielRoute = ASIEL_ROUTES.some((r) => nextUrl.pathname.startsWith(r))
  if (isAsielRoute && rol === 'adoptant') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|ico|webp)$).*)'],
}
