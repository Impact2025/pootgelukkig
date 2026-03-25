import { put } from '@vercel/blob'
import { readFileSync } from 'fs'

// Laad .env.local handmatig
const env = readFileSync('.env.local', 'utf-8')
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
}

const bestand = readFileSync('C:/Users/v_mun/Downloads/Peanut.png')
const blob = await put('dieren/peanut.png', bestand, {
  access: 'public',
  contentType: 'image/png',
})

console.log(blob.url)
