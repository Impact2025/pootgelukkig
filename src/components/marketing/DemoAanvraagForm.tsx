'use client'

import { useState, type FormEvent } from 'react'
import {
  DUUR_LABELS,
  PLATFORM_LABELS,
  FOCUS_LABELS,
  type DemoDuur,
} from '@/lib/validation/demo'

type Status = 'idle' | 'bezig' | 'gelukt' | 'fout'

type Dag = 'ma' | 'di' | 'wo' | 'do' | 'vr'
type Dagdeel = 'ochtend' | 'middag'

interface Moment {
  dag: Dag
  dagdeel: Dagdeel
}

const DAG_VOLGORDE: { dag: Dag; label: string; standaard: Dagdeel }[] = [
  { dag: 'ma', label: 'Maandag', standaard: 'ochtend' },
  { dag: 'di', label: 'Dinsdag', standaard: 'middag' },
  { dag: 'wo', label: 'Woensdag', standaard: 'ochtend' },
  { dag: 'do', label: 'Donderdag', standaard: 'middag' },
  { dag: 'vr', label: 'Vrijdag', standaard: 'ochtend' },
]

const DAGDEEL_LABEL: Record<Dagdeel, string> = {
  ochtend: '09:00–12:00',
  middag: '12:00–17:00',
}

const labelCls = 'block text-sm font-semibold text-[#33335c]'
const inputCls =
  'mt-1.5 w-full rounded-xl border border-[#33335c]/12 bg-white px-4 py-2.5 text-sm text-[#33335c] transition-colors placeholder:text-[#33335c]/30 focus:border-[#33335c]/40 focus:outline-none focus:ring-2 focus:ring-[#f8aa25]/15'

const FOCUS_OPTIES = Object.keys(FOCUS_LABELS) as (keyof typeof FOCUS_LABELS)[]

export function DemoAanvraagForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [fout, setFout] = useState<string | null>(null)

  const [duur, setDuur] = useState<DemoDuur>('compleet')
  const [platform, setPlatform] = useState<'teams' | 'meet' | 'geen_voorkeur'>('geen_voorkeur')
  // De 4 voorgeselecteerde momenten uit het aanmeldproces (Ma–Do).
  const [momenten, setMomenten] = useState<Moment[]>(() =>
    DAG_VOLGORDE.slice(0, 4).map((m) => ({ dag: m.dag, dagdeel: m.standaard }))
  )
  const [focus, setFocus] = useState<string[]>(['dashboard', 'matching'])

  function toggleMoment(m: Moment) {
    setMomenten((prev) => {
      const exists = prev.some((x) => x.dag === m.dag)
      if (exists) return prev.filter((x) => x.dag !== m.dag)
      return [...prev, m]
    })
  }

  function zetDagdeel(dag: Dag, dagdeel: Dagdeel) {
    setMomenten((prev) => prev.map((x) => (x.dag === dag ? { ...x, dagdeel } : x)))
  }

  function toggleFocus(key: string) {
    setFocus((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    )
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'bezig') return
    if (momenten.length === 0) {
      setFout('Kies minstens één voorkeursmoment.')
      setStatus('fout')
      return
    }
    setStatus('bezig')
    setFout(null)

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    const aantal = (data.aantalDieren as string)?.trim()
    const payload = {
      naam: data.naam,
      functie: data.functie,
      email: data.email,
      telefoon: (data.telefoon as string)?.trim() || undefined,
      asielNaam: data.asielNaam,
      asielPlaats: data.asielPlaats,
      aantalDieren: aantal ? Number(aantal) : undefined,
      huidigSysteem: (data.huidigSysteem as string)?.trim() || undefined,
      duur,
      platform,
      momenten,
      focus,
      opmerkingen: (data.opmerkingen as string)?.trim() || undefined,
      website: (data.website as string) || undefined,
    }

    try {
      const res = await fetch('/api/demo/aanvragen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setFout(json.error ?? 'Er is iets misgegaan. Probeer het opnieuw.')
        setStatus('fout')
        return
      }
      setStatus('gelukt')
    } catch {
      setFout('Er is iets misgegaan. Probeer het opnieuw.')
      setStatus('fout')
    }
  }

  if (status === 'gelukt') {
    return (
      <div className="rounded-[2rem] border border-[#33335c]/8 bg-white p-8 text-center shadow-[0_10px_40px_rgba(51,51,92,0.06)]">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#f8aa25]/15 text-[#e39207]">
          <span className="material-symbols-outlined">check</span>
        </span>
        <h2 className="mt-4 text-lg font-bold text-[#33335c]">Aanvraag verstuurd</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-[#33335c]/65">
          Bedankt! We mailen je binnen één werkdag een bevestiging met de definitieve tijd en de
          uitnodiging. Tot snel.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setDuur('compleet')
            setFocus(['dashboard', 'matching'])
            setMomenten(DAG_VOLGORDE.slice(0, 4).map((m) => ({ dag: m.dag, dagdeel: m.standaard })))
          }}
          className="mt-6 text-sm font-bold text-[#ee5b2b] hover:text-[#d94e22]"
        >
          Nog een aanvraag doen
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-[2rem] border border-[#33335c]/8 bg-white p-6 shadow-[0_10px_40px_rgba(51,51,92,0.06)] sm:p-8"
      noValidate
    >
      {/* Stap 1: contact + asiel */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#ee5b2b]">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ee5b2b] text-xs text-white">1</span>
          Jullie gegevens
        </legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="naam" className={labelCls}>Naam *</label>
            <input id="naam" name="naam" type="text" required autoComplete="name" className={inputCls} />
          </div>
          <div>
            <label htmlFor="functie" className={labelCls}>Functie *</label>
            <input id="functie" name="functie" type="text" required className={inputCls} placeholder="Bijv. coördinator, vrijwilliger" />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>E-mail *</label>
            <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} />
          </div>
          <div>
            <label htmlFor="telefoon" className={labelCls}>Telefoon <span className="font-normal text-[#33335c]/40">(optioneel)</span></label>
            <input id="telefoon" name="telefoon" type="tel" autoComplete="tel" className={inputCls} />
          </div>
          <div>
            <label htmlFor="asielNaam" className={labelCls}>Naam asiel *</label>
            <input id="asielNaam" name="asielNaam" type="text" required autoComplete="organization" className={inputCls} />
          </div>
          <div>
            <label htmlFor="asielPlaats" className={labelCls}>Plaats asiel *</label>
            <input id="asielPlaats" name="asielPlaats" type="text" required className={inputCls} />
          </div>
          <div>
            <label htmlFor="aantalDieren" className={labelCls}>Aantal dieren in opvang <span className="font-normal text-[#33335c]/40">(optioneel)</span></label>
            <input id="aantalDieren" name="aantalDieren" type="number" min={0} inputMode="numeric" className={inputCls} placeholder="Bijv. 40" />
          </div>
          <div>
            <label htmlFor="huidigSysteem" className={labelCls}>Huidig systeem <span className="font-normal text-[#33335c]/40">(optioneel)</span></label>
            <input id="huidigSysteem" name="huidigSysteem" type="text" className={inputCls} placeholder="Bijv. Excel, PetPoint, geen" />
          </div>
        </div>
      </fieldset>

      {/* Stap 2: soort demo */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#ee5b2b]">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ee5b2b] text-xs text-white">2</span>
          Welke demonstratie?
        </legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(['snel', 'compleet'] as DemoDuur[]).map((opt) => {
            const actief = duur === opt
            const beschrijving =
              opt === 'snel'
                ? 'Een flitsende blik op het asiel-dashboard en hoe Dr. Poot helpt bij snelle intakes en dierbeschrijvingen.'
                : 'We lopen uitgebreid door het systeem, bekijken het matching-algoritme ("Dr. Poot") en bespreken hoe een proefperiode voor jullie zou werken.'
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setDuur(opt)}
                aria-pressed={actief}
                className={`rounded-2xl border p-4 text-left transition-all ${actief ? 'border-[#ee5b2b] bg-[#ee5b2b]/5 ring-1 ring-[#ee5b2b]/30' : 'border-[#33335c]/12 bg-white hover:border-[#33335c]/25'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex size-5 items-center justify-center rounded-full border-2 ${actief ? 'border-[#ee5b2b] bg-[#ee5b2b]' : 'border-[#33335c]/25'}`}>
                    {actief && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                  </span>
                  <span className="text-sm font-bold text-[#33335c]">{DUUR_LABELS[opt]}</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[#33335c]/60">{beschrijving}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-5">
          <span className={labelCls}>Voorkeur voor videobellen</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['teams', 'meet', 'geen_voorkeur'] as const).map((opt) => {
              const actief = platform === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPlatform(opt)}
                  aria-pressed={actief}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${actief ? 'border-[#33335c] bg-[#33335c] text-white' : 'border-[#33335c]/15 bg-white text-[#33335c]/70 hover:border-[#33335c]/30'}`}
                >
                  {PLATFORM_LABELS[opt]}
                </button>
              )
            })}
          </div>
        </div>
      </fieldset>

      {/* Stap 3: voorkeursmomenten */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#ee5b2b]">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ee5b2b] text-xs text-white">3</span>
          Wanneer schikt het?
        </legend>
        <p className="mt-2 text-[14px] leading-relaxed text-[#33335c]/60">
          We snappen dat jullie agenda&apos;s druk zijn. Vink de momenten aan die jullie het beste uitkomen —
          we stemmen de online demonstratie hierop af.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DAG_VOLGORDE.map((m) => {
            const geselecteerd = momenten.some((x) => x.dag === m.dag)
            const dagdeel = momenten.find((x) => x.dag === m.dag)?.dagdeel ?? m.standaard
            return (
              <div
                key={m.dag}
                className={`rounded-2xl border p-4 transition-all ${geselecteerd ? 'border-[#ee5b2b]/40 bg-[#ee5b2b]/5' : 'border-[#33335c]/12 bg-white'}`}
              >
                <button
                  type="button"
                  onClick={() => toggleMoment({ dag: m.dag, dagdeel: m.standaard })}
                  className="flex w-full items-center justify-between gap-2 text-left"
                  aria-pressed={geselecteerd}
                >
                  <span className="flex items-center gap-2">
                    <span className={`flex size-5 items-center justify-center rounded-full border-2 ${geselecteerd ? 'border-[#ee5b2b] bg-[#ee5b2b]' : 'border-[#33335c]/25'}`}>
                      {geselecteerd && <span className="material-symbols-outlined text-[14px] text-white">check</span>}
                    </span>
                    <span className="text-sm font-bold text-[#33335c]">{m.label}</span>
                  </span>
                </button>
                {geselecteerd && (
                  <div className="mt-3 flex gap-2">
                    {(['ochtend', 'middag'] as Dagdeel[]).map((dd) => {
                      const actief = dagdeel === dd
                      return (
                        <button
                          key={dd}
                          type="button"
                          disabled={!geselecteerd}
                          onClick={() => zetDagdeel(m.dag, dd)}
                          className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${actief ? 'border-[#33335c] bg-[#33335c] text-white' : 'border-[#33335c]/15 bg-white text-[#33335c]/60'}`}
                        >
                          {DAGDEEL_LABEL[dd]}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>

      {/* Stap 4: focus */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#ee5b2b]">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ee5b2b] text-xs text-white">4</span>
          Waar kijken jullie het liefst naar?
        </legend>
        <p className="mt-2 text-[14px] leading-relaxed text-[#33335c]/60">
          Zo bereiden we de demo gericht voor. Meerdere keuzes mogelijk.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {FOCUS_OPTIES.map((key) => {
            const actief = focus.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleFocus(key)}
                aria-pressed={actief}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${actief ? 'border-[#33335c] bg-[#33335c] text-white' : 'border-[#33335c]/15 bg-white text-[#33335c]/70 hover:border-[#33335c]/30'}`}
              >
                {FOCUS_LABELS[key]}
              </button>
            )
          })}
        </div>
      </fieldset>

      {/* Stap 5: opmerkingen */}
      <fieldset>
        <legend className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-[#ee5b2b]">
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ee5b2b] text-xs text-white">5</span>
          Nog iets voor ons?
        </legend>
        <div className="mt-4">
          <label htmlFor="opmerkingen" className={labelCls}>
            Opmerkingen <span className="font-normal text-[#33335c]/40">(optioneel)</span>
          </label>
          <textarea
            id="opmerkingen"
            name="opmerkingen"
            rows={4}
            className={`${inputCls} resize-y`}
            placeholder="Bijv. we werken veel met pleeggezinnen, of willen vooral zien hoe de matching werkt voor katten."
          />
        </div>
      </fieldset>

      {/* Honeypot tegen spam */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Laat dit veld leeg</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'fout' && fout && (
        <p className="rounded-xl bg-[#ee5b2b]/8 px-4 py-3 text-sm font-medium text-[#c2451d]">{fout}</p>
      )}

      <button
        type="submit"
        disabled={status === 'bezig'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#ee5b2b] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#d94e22] active:scale-[0.99] disabled:opacity-60"
      >
        {status === 'bezig' ? 'Bezig met versturen…' : 'Demo aanvragen'}
      </button>
      <p className="text-center text-xs text-[#33335c]/40">
        Geen verplichtingen. We reageren doorgaans binnen één werkdag.
      </p>
    </form>
  )
}
