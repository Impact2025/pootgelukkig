import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>

// Lazy initialisatie: DB wordt pas aangemaakt bij eerste gebruik
let _db: DrizzleDb | undefined

function getDb(): DrizzleDb {
  if (!_db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error(
        'DATABASE_URL niet geconfigureerd. Kopieer .env.example naar .env.local en vul je Neon connection string in.'
      )
    }
    const sql = neon(url)
    _db = drizzle(sql, { schema })
  }
  return _db
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop)
  },
})

export type Database = DrizzleDb
