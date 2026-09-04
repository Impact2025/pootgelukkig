import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  deriveBreadcrumbs,
  filterCommandItems,
  buildCommandItems,
  statusTone,
  statusLabel,
} from '../components/admin/nav'

test('breadcrumbs voor dashboard', () => {
  const c = deriveBreadcrumbs('/admin')
  assert.equal(c.length, 1)
  assert.deepEqual(c[0], { label: 'Admin', href: '/admin', isLast: true })
})

test('breadcrumbs met id-segment tonen Detail en juiste hrefs', () => {
  const c = deriveBreadcrumbs('/admin/dossiers/123')
  assert.deepEqual(c.map((x) => x.label), ['Admin', 'Dossiers', 'Detail'])
  assert.deepEqual(c.map((x) => x.href), ['/admin', '/admin/dossiers', '/admin/dossiers/123'])
  assert.equal(c[c.length - 1].isLast, true)
  assert.equal(c[0].isLast, false)
})

test('breadcrumbs gebruiken nette labels voor bekende segmenten', () => {
  const c = deriveBreadcrumbs('/admin/asielen-werving')
  assert.equal(c[1].label, 'Organisaties werving')
})

test('statuskleuren en labels kloppen', () => {
  assert.equal(statusTone('afgerond'), 'success')
  assert.equal(statusTone('pending'), 'warning')
  assert.equal(statusTone('rejected'), 'danger')
  assert.equal(statusTone('gestopt'), 'danger')
  assert.equal(statusTone('onbekend'), 'neutral')
  assert.equal(statusLabel('in_behandeling'), 'In behandeling')
})

test('command items respecteren de rol', () => {
  const alsAsiel = buildCommandItems(false)
  const alsAdmin = buildCommandItems(true)
  assert.ok(!alsAsiel.some((i) => i.href === '/management/crm'), 'asiel ziet geen management-CRM')
  assert.ok(alsAdmin.some((i) => i.href === '/management/crm'), 'admin ziet management-CRM')
  assert.ok(!alsAdmin.some((i) => i.href === '/admin/dossiers'), 'admin ziet geen organisatie-operatie')
})

test('lege query geeft alle items terug', () => {
  const items = buildCommandItems(true)
  assert.equal(filterCommandItems('', items).length, items.length)
})

test('filter vindt acties en navigatie op trefwoord', () => {
  const items = buildCommandItems(false) // organisatie-portaal
  const dossier = filterCommandItems('dossier', items)
  assert.ok(dossier.some((i) => i.href === '/admin/dossiers/nieuw'))
  assert.ok(dossier.some((i) => i.href === '/admin/dossiers'))
})

test('filter met meerdere woorden vereist alle woorden', () => {
  const items = buildCommandItems(true)
  assert.equal(filterCommandItems('nieuwe client', items).some((i) => i.href === '/intake'), true)
  assert.equal(filterCommandItems('nieuw zebra', items).length, 0)
})
