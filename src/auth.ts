import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1)

          if (!user?.wachtwoordHash) return null

          const valid = await bcrypt.compare(password, user.wachtwoordHash)
          if (!valid) return null

          return {
            id: String(user.id),
            name: user.naam,
            email: user.email,
            image: user.avatarUrl ?? undefined,
            rol: user.rol,
            asielId: user.asielId ?? undefined,
          }
        } catch {
          return null
        }
      },
    }),
  ],
})
