import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseJsonAntwoord } from './client'

// Regressietests voor een bug die tijdens de chat-onboarding live is gevonden: modellen houden
// zich niet altijd aan response_format: json_object en leveren soms een markdown-codeblok of
// (bij een lang antwoord) zelfs platte tekst zonder JSON erin.

test('parseJsonAntwoord parsed kale JSON direct', () => {
  const resultaat = parseJsonAntwoord<{ ok: boolean }>('{"ok": true}')
  assert.deepEqual(resultaat, { ok: true })
})

test('parseJsonAntwoord strip een ```json-codeblok eromheen', () => {
  const resultaat = parseJsonAntwoord<{ bericht: string }>('```json\n{"bericht": "hoi"}\n```')
  assert.deepEqual(resultaat, { bericht: 'hoi' })
})

test('parseJsonAntwoord strip een kaal ```-codeblok (zonder taal-tag)', () => {
  const resultaat = parseJsonAntwoord<{ x: number }>('```\n{"x": 1}\n```')
  assert.deepEqual(resultaat, { x: 1 })
})

test('parseJsonAntwoord pakt het eerste {...}-blok uit omringende tekst', () => {
  const resultaat = parseJsonAntwoord<{ a: number }>('Hier is het antwoord:\n{"a": 42}\nHopelijk duidelijk.')
  assert.deepEqual(resultaat, { a: 42 })
})

test('parseJsonAntwoord gooit een duidelijke fout bij platte tekst zonder JSON', () => {
  assert.throws(() => parseJsonAntwoord('Dit is gewoon een zin zonder JSON erin.'), /Ongeldige JSON/)
})
