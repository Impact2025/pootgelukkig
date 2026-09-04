import type { NextAuthConfig, DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      rol: 'adoptant' | 'asiel' | 'admin'
      organisatieId?: string
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
      if ((user as { organisatieId?: string })?.organisatieId) token.organisatieId = (user as { organisatieId: string }).organisatieId
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      session.user.rol = (token.rol as 'adoptant' | 'asiel' | 'admin') ?? 'adoptant'
      if (token.organisatieId) session.user.organisatieId = token.organisatieId as string
      return session
    },
  },
}
