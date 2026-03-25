import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf-8')
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
}

const sql = neon(process.env.DATABASE_URL)

const result = await sql`
  UPDATE dieren
  SET hoofd_foto_url = '/dieren/peanut.png', bijgewerkt_op = NOW()
  WHERE naam = 'Peanut' AND soort = 'cavia'
  RETURNING id, naam, hoofd_foto_url
`

if (result.length === 0) {
  console.log('Peanut niet gevonden in de database — voer eerst npm run db:seed uit.')
} else {
  console.log(`✓ Bijgewerkt: ${result[0].naam} (id ${result[0].id}) → ${result[0].hoofd_foto_url}`)
}
