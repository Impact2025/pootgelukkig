import type { NextAuthConfig, DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: 'adoptant' | 'asiel' | 'admin'
      asielId?: number
    } & DefaultSession['user']
  }
}

// Edge-compatibele auth configuratie (geen Node.js-specifieke modules)
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      if ((user as { rol?: string })?.rol) token.rol = (user as { rol: string }).rol
      if ((user as { asielId?: number })?.asielId) token.asielId = (user as { asielId: number }).asielId
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      session.user.rol = (token.rol as 'adoptant' | 'asiel' | 'admin') ?? 'adoptant'
      if (token.asielId) session.user.asielId = token.asielId as number
      return session
    },
  },
}
