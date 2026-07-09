'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BlogActies() {
  const router = useRouter()
  const [modal, setModal] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [form, setForm] = useState({ onderwerp: '', focusKeyword: '' })
  const [fout, setFout] = useState<string | null>(null)

  async function leegArtikel() {
    setBezig(true)
    const res = await fetch('/api/admin/beheer/blog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titel: 'Nieuw artikel' }),
    })
    const json = await res.json()
    setBezig(false)
    if (json.data?.id) router.push(`/management/blog/${json.data.id}`)
  }

  async function genereer() {
    if (!form.onderwerp.trim()) return
    setBezig(true)
    setFout(null)
    const res = await fetch('/api/admin/beheer/blog/genereer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setBezig(false)
    if (json.data?.id) {
      router.push(`/management/blog/${json.data.id}`)
    } else {
      setFout(json.error ?? 'Genereren mislukt')
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={leegArtikel}
          disabled={bezig}
          className="flex items-center gap-2 bg-white border border-gray-200 text-[#33335c] font-bold px-4 py-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Leeg
        </button>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-[#33335c] text-white font-bold px-4 py-2.5 rounded-2xl hover:bg-[#33335c]/90 transition-colors text-sm shadow-lg shadow-[#33335c]/20"
        >
          <span className="material-symbols-outlined text-base" style={{ color: '#f8aa25' }}>auto_awesome</span>
          Schrijf met AI
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => !bezig && setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-extrabold text-[#33335c] mb-1">Schrijf met AI</h2>
            <p className="text-[#33335c]/40 text-sm mb-4">Wereldklasse SEO-artikel incl. interne &amp; externe links.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Onderwerp *</label>
                <input
                  value={form.onderwerp}
                  onChange={(e) => setForm({ ...form, onderwerp: e.target.value })}
                  placeholder="bijv. Een kat adopteren uit het asiel: waar let je op?"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Focuskeyword</label>
                <input
                  value={form.focusKeyword}
                  onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                  placeholder="bijv. kat adopteren"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
                />
              </div>
              {fout && <p className="text-rose-600 text-xs">{fout}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} disabled={bezig} className="flex-1 border border-gray-200 text-[#33335c] font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">
                Annuleren
              </button>
              <button onClick={genereer} disabled={bezig} className="flex-1 bg-[#33335c] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 disabled:opacity-50">
                {bezig ? 'AI schrijft…' : 'Genereer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
