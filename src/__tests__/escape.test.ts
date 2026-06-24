import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escapeHtml } from '../lib/security/escape'

test('escapet alle gevaarlijke HTML-tekens', () => {
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;')
  assert.equal(escapeHtml('a & b'), 'a &amp; b')
  assert.equal(escapeHtml(`"'`), '&quot;&#39;')
})

test('laat veilige tekst ongemoeid', () => {
  assert.equal(escapeHtml('Hallo, ik heb een vraag over Bram.'), 'Hallo, ik heb een vraag over Bram.')
})

test('voorkomt dubbele escaping niet — & wordt eerst vervangen', () => {
  // Belangrijk: & moet als eerste worden vervangen, anders ontstaat &amp;lt;
  assert.equal(escapeHtml('<'), '&lt;')
  assert.equal(escapeHtml('&lt;'), '&amp;lt;')
})
