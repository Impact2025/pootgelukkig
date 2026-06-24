import { auth } from '@/auth'

export interface AdminSessie {
  userId: number
  naam: string
  email: string
}

/**
 * Controleert of de huidige gebruiker een admin is.
 * Returnt de sessiegegevens, of null als er geen admin-toegang is.
 */
export async function vereisAdmin(): Promise<AdminSessie | null> {
  const session = await auth()
  if (!session?.user || session.user.rol !== 'admin') return null
  return {
    userId: Number(session.user.id),
    naam: session.user.name ?? 'Beheerder',
    email: session.user.email ?? '',
  }
}
