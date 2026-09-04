/**
 * ImpactOS — "Samen" chat-widget loader.
 * Insluiten op een externe site (WordPress, Wix, etc.):
 *
 *   <script src="https://www.impactos.nl/widget-loader.js" data-org="jouw-organisatie-slug" async></script>
 *
 * Plaatst een floating chatbubbel rechtsonder die bij een klik het /widget?org=<slug>
 * paneel toont in een iframe. Geen dependencies, werkt op elke site.
 */
(function () {
  'use strict'

  var script = document.currentScript
  if (!script) return

  var org = script.getAttribute('data-org')
  if (!org) {
    console.error('[ImpactOS widget] data-org ontbreekt op de <script>-tag')
    return
  }

  var origin = new URL(script.src).origin
  var open = false

  var bubble = document.createElement('button')
  bubble.setAttribute('aria-label', 'Chat openen')
  bubble.style.cssText =
    'position:fixed;bottom:20px;right:20px;z-index:2147483000;width:56px;height:56px;' +
    'border-radius:9999px;border:0;background:#2563EB;color:#fff;cursor:pointer;' +
    'box-shadow:0 8px 24px rgba(37,99,235,.35);display:flex;align-items:center;justify-content:center;' +
    'font-family:system-ui,sans-serif;transition:transform .15s ease;'
  bubble.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M4 4h16v12H7l-3 3V4z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>'
  bubble.onmouseenter = function () { bubble.style.transform = 'scale(1.06)' }
  bubble.onmouseleave = function () { bubble.style.transform = 'scale(1)' }

  var panel = document.createElement('div')
  panel.style.cssText =
    'position:fixed;bottom:90px;right:20px;z-index:2147483000;width:380px;max-width:calc(100vw - 32px);' +
    'height:560px;max-height:calc(100vh - 120px);border-radius:20px;overflow:hidden;' +
    'box-shadow:0 20px 60px rgba(15,23,42,.25);display:none;background:#fff;'

  var iframe = document.createElement('iframe')
  iframe.src = origin + '/widget?org=' + encodeURIComponent(org)
  iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;'
  iframe.title = 'Chat met Samen'
  panel.appendChild(iframe)

  function toggle() {
    open = !open
    panel.style.display = open ? 'block' : 'none'
    bubble.setAttribute('aria-label', open ? 'Chat sluiten' : 'Chat openen')
    bubble.innerHTML = open
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M6 6l12 12M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M4 4h16v12H7l-3 3V4z" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>'
  }

  bubble.addEventListener('click', toggle)

  function mount() {
    document.body.appendChild(panel)
    document.body.appendChild(bubble)
  }
  if (document.body) mount()
  else document.addEventListener('DOMContentLoaded', mount)
})()
