import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AI_ROLLEN, AI_ROLLEN_LIJST, haalRol, isGeldigeRol } from './index'

test('registry bevat 8 rollen', () => {
  assert.equal(AI_ROLLEN_LIJST.length, 8)
})

test('elke rol heeft naam, titel en minstens 1 actie', () => {
  for (const r of AI_ROLLEN_LIJST) {
    assert.ok(r.naam, `rol ${r.id} mist naam`)
    assert.ok(r.titel, `rol ${r.id} mist titel`)
    assert.ok(r.acties.length >= 1, `rol ${r.id} heeft geen acties`)
    assert.ok(r.bouwContext instanceof Function, `rol ${r.id} mist bouwContext`)
    assert.ok(r.systeemInstructie.length > 0, `rol ${r.id} mist systeemInstructie`)
  }
})

test('rol-ids komen overeen met aiRolEnum-waarden', () => {
  const verwacht = ['social', 'fundraising', 'vrijwilligers', 'evenementen', 'medisch', 'foto', 'rapportage', 'chat']
  assert.deepEqual(AI_ROLLEN_LIJST.map((r) => r.id).sort(), verwacht.sort())
})

test('haalRol retourneert rol of undefined', () => {
  assert.equal(haalRol('social')?.naam, 'Conny')
  assert.equal(haalRol('bestaat-niet'), undefined)
})

test('isGeldigeRol valideert correct', () => {
  assert.equal(isGeldigeRol('social'), true)
  assert.equal(isGeldigeRol('onzin'), false)
  assert.equal(isGeldigeRol(123), false)
})
