// Google Calendar-koppeling via Google OAuth 2.0 (authorization code flow).
// OAuth-client: https://console.cloud.google.com → APIs & Services → Credentials.
// Zie .env.example voor de benodigde redirect-URI en scopes.

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email'

export function googleGeconfigureerd(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

function redirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${appUrl}/api/integraties/google/callback`
}

export function bouwAutorisatieUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

export interface TokenSet {
  accessToken: string
  refreshToken: string
  verlooptOver: number // seconden
}

export async function wisselCodeVoorTokens(code: string): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) throw new Error(`Google token-uitwisseling mislukt: ${await res.text()}`)
  const data = await res.json()
  return { accessToken: data.access_token, refreshToken: data.refresh_token, verlooptOver: data.expires_in }
}

export async function vernieuwToken(refreshToken: string): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) throw new Error(`Google token-vernieuwing mislukt: ${await res.text()}`)
  const data = await res.json()
  // Google geeft bij een refresh geen nieuwe refresh_token terug — de oude blijft geldig.
  return { accessToken: data.access_token, refreshToken: refreshToken, verlooptOver: data.expires_in }
}

export async function haalGebruikersEmail(accessToken: string): Promise<string | null> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.email ?? null
}

export interface AgendaItem {
  titel: string
  start: string
  eind: string
  locatie: string | null
}

export async function haalAgendaItems(accessToken: string, aantal = 5): Promise<AgendaItem[]> {
  const params = new URLSearchParams({
    timeMin: new Date().toISOString(),
    maxResults: String(aantal),
    orderBy: 'startTime',
    singleEvents: 'true',
  })
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Google agenda ophalen mislukt: ${await res.text()}`)
  const data = await res.json()
  return (data.items ?? []).map((e: { summary?: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string }; location?: string }) => ({
    titel: e.summary ?? '(geen titel)',
    start: e.start.dateTime ?? e.start.date ?? '',
    eind: e.end.dateTime ?? e.end.date ?? '',
    locatie: e.location ?? null,
  }))
}
