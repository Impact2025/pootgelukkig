// Symmetrische versleuteling (AES-256-GCM) voor OAuth-tokens van externe agenda-koppelingen.
// Tokens geven toegang tot een Outlook- of Google-agenda en mogen nooit in platte tekst
// in de database staan.

import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto'

function haalSleutel(): Buffer {
  const secret = process.env.INTEGRATIE_ENCRYPTIE_SLEUTEL
  if (!secret) {
    throw new Error('INTEGRATIE_ENCRYPTIE_SLEUTEL niet geconfigureerd. Voeg hem toe aan je .env.local.')
  }
  // scrypt leidt altijd een geldige 32-byte AES-sleutel af, ongeacht de invoerlengte.
  return scryptSync(secret, 'impactos-integraties', 32)
}

/** Versleutelt een string naar `<iv>:<authTag>:<ciphertext>` (allemaal hex). */
export function versleutel(waarde: string): string {
  const sleutel = haalSleutel()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', sleutel, iv)
  const ciphertext = Buffer.concat([cipher.update(waarde, 'utf-8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${ciphertext.toString('hex')}`
}

/** Ontsleutelt een string die met `versleutel()` is gemaakt. */
export function ontsleutel(waarde: string): string {
  const sleutel = haalSleutel()
  const [ivHex, authTagHex, ciphertextHex] = waarde.split(':')
  if (!ivHex || !authTagHex || !ciphertextHex) {
    throw new Error('Ongeldig versleuteld token-formaat')
  }
  const decipher = createDecipheriv('aes-256-gcm', sleutel, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextHex, 'hex')), decipher.final()])
  return plaintext.toString('utf-8')
}
