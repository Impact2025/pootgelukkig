import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Laad .env.local (zelfde als Next.js doet)
loadEnvConfig(process.cwd())

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
} satisfies Config
