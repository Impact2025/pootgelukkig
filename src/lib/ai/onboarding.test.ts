import { test } from 'node:test'
import assert from 'node:assert/strict'
import { alsAiRolIds, ONBOARDING_AANBEVEELBARE_ROLLEN, WERKVELD_CATEGORIEEN } from './onboarding'

test('alsAiRolIds laat alleen geldige, actieve rollen door', () => {
  assert.deepEqual(alsAiRolIds(['fundraising', 'rapportage']), ['fundraising', 'rapportage'])
})

test('alsAiRolIds filtert onbekende of gedeactiveerde rollen weg', () => {
  // 'medisch'/'foto'/'evenementen' bestaan nog als enum-waarde in de database (voor
  // compatibiliteit) maar zijn geen geldige onboarding-aanbeveling meer.
  assert.deepEqual(alsAiRolIds(['fundraising', 'medisch', 'onzin']), ['fundraising'])
})

test('alsAiRolIds geeft een lege lijst terug bij een lege invoer', () => {
  assert.deepEqual(alsAiRolIds([]), [])
})

test('ONBOARDING_AANBEVEELBARE_ROLLEN bevat precies de 5 actieve ImpactOS-rollen', () => {
  assert.deepEqual(
    [...ONBOARDING_AANBEVEELBARE_ROLLEN].sort(),
    ['chat', 'fundraising', 'rapportage', 'social', 'vrijwilligers'].sort()
  )
})

test('WERKVELD_CATEGORIEEN komt overeen met de dossier-categorieën in het schema', () => {
  assert.deepEqual([...WERKVELD_CATEGORIEEN].sort(), ['jeugd', 'overig', 'participatie', 'reintegratie', 'wmo'].sort())
})
