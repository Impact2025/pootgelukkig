import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AI_ROLLEN_LIJST, haalRol, isGeldigeRol } from './index'

test('registry bevat de 5 actieve ImpactOS-rollen', () => {
  assert.equal(AI_ROLLEN_LIJST.length, 5)
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

test('rol-ids zijn de actieve ImpactOS-rollen (asiel-specifieke rollen zijn verwijderd)', () => {
  const verwacht = ['social', 'fundraising', 'vrijwilligers', 'rapportage', 'chat']
  assert.deepEqual(AI_ROLLEN_LIJST.map((r) => r.id).sort(), verwacht.sort())
})

test('Sam, Mila en Conny vereisen ALTIJD goedkeuring (human-in-the-loop)', () => {
  for (const id of ['fundraising', 'rapportage', 'social']) {
    assert.equal(haalRol(id)?.vereistGoedkeuring, true, `${id} moet vereistGoedkeuring=true hebben`)
  }
})

test('haalRol retourneert rol of undefined, gedeactiveerde rollen geven undefined', () => {
  assert.equal(haalRol('social')?.naam, 'Conny')
  assert.equal(haalRol('foto'), undefined)
  assert.equal(haalRol('medisch'), undefined)
  assert.equal(haalRol('evenementen'), undefined)
  assert.equal(haalRol('bestaat-niet'), undefined)
})

test('isGeldigeRol valideert correct', () => {
  assert.equal(isGeldigeRol('social'), true)
  assert.equal(isGeldigeRol('foto'), false)
  assert.equal(isGeldigeRol('onzin'), false)
  assert.equal(isGeldigeRol(123), false)
})
