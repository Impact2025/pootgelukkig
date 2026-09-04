'use client'

import { useState } from 'react'

export default function WidgetSnippet({ slug }: { slug: string }) {
  const [gekopieerd, setGekopieerd] = useState<'script' | 'iframe' | null>(null)
  const basisUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const scriptSnippet = `<script src="${basisUrl}/widget-loader.js" data-org="${slug}" async></script>`
  const iframeSnippet = `<iframe src="${basisUrl}/widget?org=${slug}" style="border:0;width:380px;height:560px" title="Chat met Samen"></iframe>`

  async function kopieer(tekst: string, welke: 'script' | 'iframe') {
    try {
      await navigator.clipboard.writeText(tekst)
      setGekopieerd(welke)
      setTimeout(() => setGekopieerd(null), 2000)
    } catch {
      // Clipboard-API niet beschikbaar (bv. http zonder secure context) — negeer stil,
      // de gebruiker kan de tekst nog altijd handmatig selecteren.
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-bold text-[#1E293B]">Aanbevolen: floating chatbubbel</p>
          <button
            onClick={() => kopieer(scriptSnippet, 'script')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            <span className="material-symbols-outlined text-sm">{gekopieerd === 'script' ? 'check' : 'content_copy'}</span>
            {gekopieerd === 'script' ? 'Gekopieerd' : 'Kopieer'}
          </button>
        </div>
        <p className="text-xs text-[#1E293B]/50 mb-2">
          Eén script-tag vóór <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> op je
          WordPress- of Wix-site. Plaatst een chatbubbel rechtsonder die bij een klik opent.
        </p>
        <pre className="bg-[#0F172A] text-[#93C5FD] text-xs rounded-xl p-4 overflow-x-auto"><code>{scriptSnippet}</code></pre>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-bold text-[#1E293B]">Alternatief: vaste iframe</p>
          <button
            onClick={() => kopieer(iframeSnippet, 'iframe')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            <span className="material-symbols-outlined text-sm">{gekopieerd === 'iframe' ? 'check' : 'content_copy'}</span>
            {gekopieerd === 'iframe' ? 'Gekopieerd' : 'Kopieer'}
          </button>
        </div>
        <p className="text-xs text-[#1E293B]/50 mb-2">
          Plaats de chat direct op een pagina (bv. een contactpagina) i.p.v. als bubbel.
        </p>
        <pre className="bg-[#0F172A] text-[#93C5FD] text-xs rounded-xl p-4 overflow-x-auto"><code>{iframeSnippet}</code></pre>
      </div>

      <a
        href={`/widget?org=${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E293B]/60 hover:text-[#1E293B]"
      >
        <span className="material-symbols-outlined text-sm">open_in_new</span>
        Bekijk een live preview
      </a>
    </div>
  )
}
