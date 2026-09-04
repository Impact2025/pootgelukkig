// Generieke opslag/vernieuwing van agenda-koppelingen (Microsoft/Google), onafhankelijk
// van de provider-specifieke OAuth-details in microsoft.ts / google.ts.

import { db } from '@/lib/db'
import { externeKoppelingen } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { versleutel, ontsleutel } from './crypto'
import * as microsoft from './microsoft'
import * as google from './google'

export type Provider = 'microsoft' | 'google'

interface TokenSet {
  accessToken: string
  refreshToken: string
  verlooptOver: number
}

const PROVIDERS = {
  microsoft: { vernieuwToken: microsoft.vernieuwToken },
  google: { vernieuwToken: google.vernieuwToken },
} satisfies Record<Provider, { vernieuwToken: (refreshToken: string) => Promise<TokenSet> }>

export async function slaKoppelingOp(
  organisatieId: string,
  provider: Provider,
  tokens: TokenSet,
  accountEmail: string | null
): Promise<void> {
  const verlooptOp = new Date(Date.now() + tokens.verlooptOver * 1000)
  await db
    .insert(externeKoppelingen)
    .values({
      organisatieId,
      provider,
      accountEmail,
      accessTokenVersleuteld: versleutel(tokens.accessToken),
      refreshTokenVersleuteld: versleutel(tokens.refreshToken),
      verlooptOp,
    })
    .onConflictDoUpdate({
      target: [externeKoppelingen.organisatieId, externeKoppelingen.provider],
      set: {
        accountEmail,
        accessTokenVersleuteld: versleutel(tokens.accessToken),
        refreshTokenVersleuteld: versleutel(tokens.refreshToken),
        verlooptOp,
        bijgewerktOp: new Date(),
      },
    })
}

export async function verwijderKoppeling(organisatieId: string, provider: Provider): Promise<boolean> {
  const rijen = await db
    .delete(externeKoppelingen)
    .where(and(eq(externeKoppelingen.organisatieId, organisatieId), eq(externeKoppelingen.provider, provider)))
    .returning({ organisatieId: externeKoppelingen.organisatieId })
  return rijen.length > 0
}

export interface KoppelingStatus {
  gekoppeld: boolean
  accountEmail: string | null
  gekoppeldOp: Date | null
}

export async function haalKoppelingStatus(organisatieId: string, provider: Provider): Promise<KoppelingStatus> {
  const [rij] = await db
    .select({ accountEmail: externeKoppelingen.accountEmail, gekoppeldOp: externeKoppelingen.gekoppeldOp })
    .from(externeKoppelingen)
    .where(and(eq(externeKoppelingen.organisatieId, organisatieId), eq(externeKoppelingen.provider, provider)))
    .limit(1)
  if (!rij) return { gekoppeld: false, accountEmail: null, gekoppeldOp: null }
  return { gekoppeld: true, accountEmail: rij.accountEmail, gekoppeldOp: rij.gekoppeldOp }
}

/**
 * Geeft een geldig access-token terug voor de koppeling, en vernieuwt 'm automatisch
 * (en slaat de nieuwe tokens versleuteld op) als hij binnen 2 minuten verloopt.
 * Retourneert `null` als er geen koppeling bestaat.
 */
export async function haalGeldigeAccessToken(organisatieId: string, provider: Provider): Promise<string | null> {
  const [rij] = await db
    .select()
    .from(externeKoppelingen)
    .where(and(eq(externeKoppelingen.organisatieId, organisatieId), eq(externeKoppelingen.provider, provider)))
    .limit(1)
  if (!rij) return null

  const bijnaVerlopen = rij.verlooptOp.getTime() - Date.now() < 2 * 60 * 1000
  if (!bijnaVerlopen) {
    return ontsleutel(rij.accessTokenVersleuteld)
  }

  const refreshToken = ontsleutel(rij.refreshTokenVersleuteld)
  const nieuweTokens = await PROVIDERS[provider].vernieuwToken(refreshToken)
  await slaKoppelingOp(organisatieId, provider, nieuweTokens, rij.accountEmail)
  return nieuweTokens.accessToken
}
