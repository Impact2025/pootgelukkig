// Outlook/Microsoft 365-agenda-koppeling via Microsoft Graph (OAuth 2.0 authorization code flow).
// App-registratie: https://portal.azure.com → App registrations. Zie .env.example voor de
// benodigde redirect-URI en permissions.

const AUTHORIZE_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'
const SCOPES = 'offline_access User.Read Calendars.Read'

export function microsoftGeconfigureerd(): boolean {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
}

function redirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${appUrl}/api/integraties/microsoft/callback`
}

export function bouwAutorisatieUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: redirectUri(),
    response_mode: 'query',
    scope: SCOPES,
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
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
      scope: SCOPES,
    }),
  })
  if (!res.ok) throw new Error(`Microsoft token-uitwisseling mislukt: ${await res.text()}`)
  const data = await res.json()
  return { accessToken: data.access_token, refreshToken: data.refresh_token, verlooptOver: data.expires_in }
}

export async function vernieuwToken(refreshToken: string): Promise<TokenSet> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  })
  if (!res.ok) throw new Error(`Microsoft token-vernieuwing mislukt: ${await res.text()}`)
  const data = await res.json()
  // Microsoft geeft niet altijd een nieuwe refresh_token terug — val dan terug op de oude.
  return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken, verlooptOver: data.expires_in }
}

export async function haalGebruikersEmail(accessToken: string): Promise<string | null> {
  const res = await fetch(`${GRAPH_BASE}/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) return null
  const data = await res.json()
  return data.mail ?? data.userPrincipalName ?? null
}

export interface AgendaItem {
  titel: string
  start: string
  eind: string
  locatie: string | null
}

export async function haalAgendaItems(accessToken: string, aantal = 5): Promise<AgendaItem[]> {
  const nu = new Date()
  const overEenMaand = new Date(nu.getTime() + 30 * 24 * 60 * 60 * 1000)
  const params = new URLSearchParams({
    startDateTime: nu.toISOString(),
    endDateTime: overEenMaand.toISOString(),
    $orderby: 'start/dateTime',
    $top: String(aantal),
  })
  const res = await fetch(`${GRAPH_BASE}/me/calendarview?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}`, Prefer: 'outlook.timezone="Europe/Amsterdam"' },
  })
  if (!res.ok) throw new Error(`Microsoft agenda ophalen mislukt: ${await res.text()}`)
  const data = await res.json()
  return (data.value ?? []).map((e: { subject: string; start: { dateTime: string }; end: { dateTime: string }; location?: { displayName?: string } }) => ({
    titel: e.subject,
    start: e.start.dateTime,
    eind: e.end.dateTime,
    locatie: e.location?.displayName ?? null,
  }))
}
