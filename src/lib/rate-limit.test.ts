import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkRateLimit } from './rate-limit'

test('staat verzoeken toe tot het maximum binnen het venster', () => {
  const key = `test:${Math.random()}`
  for (let i = 0; i < 3; i++) {
    const r = checkRateLimit(key, 3, 60_000)
    assert.equal(r.allowed, true, `verzoek ${i + 1} zou toegestaan moeten zijn`)
  }
})

test('blokkeert zodra het maximum is bereikt, met een positieve retryAfterSec', () => {
  const key = `test:${Math.random()}`
  checkRateLimit(key, 2, 60_000)
  checkRateLimit(key, 2, 60_000)
  const derde = checkRateLimit(key, 2, 60_000)
  assert.equal(derde.allowed, false)
  assert.equal(derde.remaining, 0)
  assert.ok(derde.retryAfterSec > 0)
})

test('verschillende keys hebben onafhankelijke tellers', () => {
  const a = `test:a:${Math.random()}`
  const b = `test:b:${Math.random()}`
  checkRateLimit(a, 1, 60_000)
  const bResultaat = checkRateLimit(b, 1, 60_000)
  assert.equal(bResultaat.allowed, true, 'key b mag niet meetellen met key a')
})

test('reset na afloop van het venster', () => {
  const key = `test:${Math.random()}`
  checkRateLimit(key, 1, 10)
  const geblokkeerd = checkRateLimit(key, 1, 10)
  assert.equal(geblokkeerd.allowed, false)
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const naReset = checkRateLimit(key, 1, 10)
      assert.equal(naReset.allowed, true)
      resolve()
    }, 20)
  })
})
