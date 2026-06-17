import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Laad .env.local (zelfde als Next.js doet)
loadEnvConfig(process.cwd())

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Bij voorkeur de directe (unpooled) connectie voor migraties; val terug op
    // de gewone DATABASE_URL als die niet apart is ingesteld.
    url: (process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL)!,
  },
} satisfies Config
