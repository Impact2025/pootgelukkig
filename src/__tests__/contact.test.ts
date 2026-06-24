import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contactSchema } from '../lib/validation/contact'

test('accepteert een geldig contactbericht', () => {
  const r = contactSchema.safeParse({
    naam: 'Maya',
    email: 'maya@example.com',
    bericht: 'Ik heb een vraag over het adoptieproces.',
  })
  assert.equal(r.success, true)
})

test('accepteert optioneel asiel-veld', () => {
  const r = contactSchema.safeParse({
    naam: 'Asiel Amsterdam',
    email: 'info@asiel.nl',
    asiel: 'Dierenopvang Amsterdam',
    bericht: 'We willen graag een demo inplannen.',
  })
  assert.equal(r.success, true)
})

test('weigert een ongeldig e-mailadres', () => {
  const r = contactSchema.safeParse({ naam: 'Test', email: 'geen-email', bericht: 'Dit is lang genoeg.' })
  assert.equal(r.success, false)
})

test('weigert een te kort bericht', () => {
  const r = contactSchema.safeParse({ naam: 'Test', email: 'a@b.nl', bericht: 'kort' })
  assert.equal(r.success, false)
})

test('weigert een te korte naam', () => {
  const r = contactSchema.safeParse({ naam: 'X', email: 'a@b.nl', bericht: 'Dit is lang genoeg.' })
  assert.equal(r.success, false)
})

test('honeypot moet leeg zijn — gevuld veld wordt geweigerd', () => {
  const r = contactSchema.safeParse({
    naam: 'Bot',
    email: 'bot@spam.nl',
    bericht: 'Dit is lang genoeg om te slagen.',
    website: 'http://spam.example',
  })
  assert.equal(r.success, false)
})
