import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  CATEGORIEEN,
  ARTIKELEN,
  categorieBySlug,
  artikelBySlug,
  artikelenVoorCategorie,
  categorieenPerDoelgroep,
  alleKennisPaden,
} from '../lib/kennisbank/content'

test('categorie-slugs zijn uniek', () => {
  const slugs = CATEGORIEEN.map((c) => c.slug)
  assert.equal(new Set(slugs).size, slugs.length)
})

test('artikel-slugs zijn uniek binnen hun categorie', () => {
  const paden = alleKennisPaden().map((p) => `${p.categorieSlug}/${p.slug}`)
  assert.equal(new Set(paden).size, paden.length)
})

test('elk artikel verwijst naar een bestaande categorie', () => {
  for (const a of ARTIKELEN) {
    assert.ok(categorieBySlug(a.categorieSlug), `categorie ontbreekt voor artikel ${a.slug}`)
  }
})

test('elke categorie heeft minstens één artikel', () => {
  for (const c of CATEGORIEEN) {
    assert.ok(artikelenVoorCategorie(c.slug).length >= 1, `categorie ${c.slug} heeft geen artikelen`)
  }
})

test('elk artikel heeft inhoud en een samenvatting', () => {
  for (const a of ARTIKELEN) {
    assert.ok(a.titel.length > 0)
    assert.ok(a.samenvatting.length > 0)
    assert.ok(a.inhoudMd.length > 50, `artikel ${a.slug} heeft te weinig inhoud`)
  }
})

test('bijgewerkt-datum is een geldige ISO-datum', () => {
  for (const a of ARTIKELEN) {
    assert.match(a.bijgewerkt, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(!Number.isNaN(new Date(a.bijgewerkt).getTime()))
  }
})

test('artikelBySlug vindt bestaand artikel en negeert onbekende', () => {
  const eerste = ARTIKELEN[0]
  assert.ok(artikelBySlug(eerste.categorieSlug, eerste.slug))
  assert.equal(artikelBySlug(eerste.categorieSlug, 'bestaat-niet'), undefined)
})

test('categorieenPerDoelgroep dekt alle categorieën', () => {
  const groepen = categorieenPerDoelgroep()
  const totaal = groepen.reduce((n, g) => n + g.categorieen.length, 0)
  assert.equal(totaal, CATEGORIEEN.length)
})
