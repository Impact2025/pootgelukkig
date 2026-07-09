'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { berekenSeoScore } from '@/lib/blog/seo'
import { useToast } from '@/components/admin/Toast'

interface Post {
  id: number
  titel: string
  slug: string
  inhoudMd: string
  excerpt: string | null
  coverUrl: string | null
  status: string
  metaTitle: string | null
  metaDescription: string | null
  focusKeyword: string | null
  interneLinks: { tekst: string; url: string }[] | null
  externeLinks: { tekst: string; url: string }[] | null
}

function scoreKleur(score: number) {
  if (score >= 80) return 'text-emerald-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-rose-600'
}

export default function BlogEditor({ post }: { post: Post }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [form, setForm] = useState({
    titel: post.titel,
    inhoudMd: post.inhoudMd,
    excerpt: post.excerpt ?? '',
    coverUrl: post.coverUrl ?? '',
    metaTitle: post.metaTitle ?? '',
    metaDescription: post.metaDescription ?? '',
    focusKeyword: post.focusKeyword ?? '',
  })
  const [status, setStatus] = useState(post.status)
  const [bezig, setBezig] = useState(false)
  const [confirmVerwijder, setConfirmVerwijder] = useState(false)

  const seo = useMemo(
    () =>
      berekenSeoScore({
        titel: form.titel,
        inhoudMd: form.inhoudMd,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        focusKeyword: form.focusKeyword,
        interneLinks: post.interneLinks,
        externeLinks: post.externeLinks,
      }),
    [form, post.interneLinks, post.externeLinks]
  )

  async function bewaar(nieuweStatus?: string) {
    setBezig(true)
    const res = await fetch(`/api/admin/beheer/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ...(nieuweStatus ? { status: nieuweStatus } : {}) }),
    })
    const json = await res.json()
    setBezig(false)
    if (json.data) {
      if (nieuweStatus) setStatus(nieuweStatus)
      showToast(nieuweStatus === 'gepubliceerd' ? 'Artikel gepubliceerd' : 'Opgeslagen', 'success')
      router.refresh()
    } else {
      showToast(json.error ?? 'Opslaan mislukt', 'error')
    }
  }

  async function verwijder() {
    await fetch(`/api/admin/beheer/blog/${post.id}`, { method: 'DELETE' })
    showToast('Artikel verwijderd', 'info')
    router.push('/management/blog')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href="/management/blog" className="inline-flex items-center gap-1 text-[#33335c]/40 hover:text-[#33335c] text-sm font-semibold transition-colors">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Terug
        </Link>
        <div className="flex items-center gap-2">
          {confirmVerwijder ? (
            <>
              <span className="text-xs text-[#33335c]/50 font-medium">Zeker verwijderen?</span>
              <button
                onClick={verwijder}
                className="text-rose-500 font-bold text-xs px-3 py-2 hover:text-rose-600 transition-colors"
              >
                Ja, verwijder
              </button>
              <button
                onClick={() => setConfirmVerwijder(false)}
                className="text-[#33335c]/40 font-semibold text-xs px-2 py-2 hover:text-[#33335c] transition-colors"
              >
                Nee
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmVerwijder(true)}
              className="text-rose-500/70 hover:text-rose-600 text-sm font-semibold px-3 py-2"
            >
              Verwijderen
            </button>
          )}
          <button onClick={() => bewaar()} disabled={bezig} className="border border-gray-200 text-[#33335c] font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50">
            Opslaan
          </button>
          {status === 'gepubliceerd' ? (
            <>
              <Link href={`/blog/${post.slug}`} target="_blank" className="bg-emerald-50 text-emerald-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-emerald-100">
                Bekijk live
              </Link>
              <button onClick={() => bewaar('concept')} disabled={bezig} className="text-[#33335c]/60 font-bold px-3 py-2 text-sm">
                Depubliceren
              </button>
            </>
          ) : (
            <button onClick={() => bewaar('gepubliceerd')} disabled={bezig} className="bg-[#33335c] text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#33335c]/90 disabled:opacity-50">
              Publiceren
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-3">
          <input
            value={form.titel}
            onChange={(e) => setForm({ ...form, titel: e.target.value })}
            placeholder="Titel"
            className="w-full text-2xl font-extrabold text-[#33335c] bg-transparent focus:outline-none border-b border-[#33335c]/8 pb-2"
          />
          <textarea
            value={form.inhoudMd}
            onChange={(e) => setForm({ ...form, inhoudMd: e.target.value })}
            placeholder="Schrijf je artikel in Markdown…"
            rows={24}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c] font-mono leading-relaxed resize-none"
          />
        </div>

        {/* SEO-paneel */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#33335c]/8 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-[#33335c]">SEO-score</p>
              <p className={`text-2xl font-extrabold ${scoreKleur(seo.score)}`}>{seo.score}</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full ${seo.score >= 80 ? 'bg-emerald-500' : seo.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${seo.score}%` }}
              />
            </div>
            <div className="space-y-2">
              {seo.punten.map((p, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`material-symbols-outlined text-base flex-shrink-0 ${p.ok ? 'text-emerald-500' : 'text-gray-300'}`}>
                    {p.ok ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={p.ok ? 'text-[#33335c]/70' : 'text-[#33335c]/50'}>{p.tekst}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#33335c]/8 p-5 space-y-3">
            <Veld label="Focuskeyword" value={form.focusKeyword} onChange={(v) => setForm({ ...form, focusKeyword: v })} />
            <Veld label="Meta-titel" value={form.metaTitle} onChange={(v) => setForm({ ...form, metaTitle: v })} hint={`${form.metaTitle.length}/60`} />
            <div>
              <div className="flex justify-between">
                <label className="block text-xs font-bold text-[#33335c]/50 mb-1">Meta-omschrijving</label>
                <span className="text-[10px] text-[#33335c]/30">{form.metaDescription.length}/160</span>
              </div>
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c] resize-none"
              />
            </div>
            <Veld label="Samenvatting (excerpt)" value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} />
            <Veld label="Cover-afbeelding URL" value={form.coverUrl} onChange={(v) => setForm({ ...form, coverUrl: v })} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Veld({
  label,
  value,
  onChange,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
}) {
  return (
    <div>
      <div className="flex justify-between">
        <label className="block text-xs font-bold text-[#33335c]/50 mb-1">{label}</label>
        {hint && <span className="text-[10px] text-[#33335c]/30">{hint}</span>}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-[#33335c] focus:outline-none focus:border-[#33335c]"
      />
    </div>
  )
}
