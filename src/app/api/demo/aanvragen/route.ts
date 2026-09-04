import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { crmContacten } from '@/lib/db/schema'
import { verstuurMail } from '@/lib/email'
import { escapeHtml } from '@/lib/security/escape'
import {
  demoAanvraagSchema,
  DAG_LABELS,
  DAGDEEL_LABELS,
  FOCUS_LABELS,
  DUUR_LABELS,
  PLATFORM_LABELS,
  type DemoAanvraagInput,
} from '@/lib/validation/demo'

export const dynamic = 'force-dynamic'

const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL ?? 'v.munster@weareimpact.nl'

function rij(label: string, waarde: string): string {
  return `<tr><td style="padding:4px 16px 4px 0;color:#9595a8;white-space:nowrap">${label}</td><td style="font-weight:600">${escapeHtml(waarde)}</td></tr>`
}

function bouwTeamHtml(d: DemoAanvraagInput): string {
  const momenten = d.momenten
    .map((m) => `${DAG_LABELS[m.dag]} ${DAGDEEL_LABELS[m.dagdeel]}`)
    .join('<br/>')
  const focus = (d.focus ?? [])
    .map((f) => FOCUS_LABELS[f] ?? f)
    .join(', ')

  const rows = [
    rij('Naam', d.naam),
    rij('Functie', d.functie),
    rij('E-mail', d.email),
    d.telefoon ? rij('Telefoon', d.telefoon) : '',
    rij('Asiel', d.asielNaam),
    rij('Plaats', d.asielPlaats),
    d.aantalDieren != null ? rij('Aantal dieren in opvang', String(d.aantalDieren)) : '',
    d.huidigSysteem ? rij('Huidig systeem', d.huidigSysteem) : '',
    rij('Soort demo', DUUR_LABELS[d.duur]),
    rij('Platform', PLATFORM_LABELS[d.platform]),
    rij('Voorkeursmomenten', momenten),
    focus ? rij('Focus', focus) : '',
    d.opmerkingen ? rij('Opmerkingen', d.opmerkingen) : '',
  ]
    .filter(Boolean)
    .join('')

  return `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;color:#33335c">
      <h2 style="font-size:18px;margin:0 0 4px">Nieuwe demo-aanvraag</h2>
      <p style="font-size:14px;color:#9595a8;margin:0 0 16px">${escapeHtml(d.asielNaam)} — binnen via het aanmeldformulier</p>
      <table style="font-size:14px;line-height:1.6;border-collapse:collapse">${rows}</table>
    </div>`
}

function bouwBevestigingHtml(d: DemoAanvraagInput): string {
  const momenten = d.momenten
    .map((m) => `• ${DAG_LABELS[m.dag]} ${DAGDEEL_LABELS[m.dagdeel]}`)
    .join('<br/>')
  const duur = DUUR_LABELS[d.duur]

  return `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebebf0">
      <div style="background:linear-gradient(135deg,#33335c,#1a1a3e);padding:28px 32px">
        <p style="margin:0;font-size:20px;font-weight:800;color:#fff">🐾 PootGelukkig</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px">Bedankt, ${escapeHtml(d.naam)}!</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px">
          We hebben jullie aanvraag voor <strong>${escapeHtml(duur)}</strong> voor
          <strong>${escapeHtml(d.asielNaam)}</strong> ontvangen. We stemmen de online demonstratie af op jullie agenda
          en sturen jullie binnen één werkdag een bevestiging met de definitieve tijd en een uitnodiging voor
          ${escapeHtml(PLATFORM_LABELS[d.platform])}.
        </p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 8px"><strong>Jullie voorkeursmomenten:</strong></p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">${momenten}</p>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0">
          Liever sneller schakelen? Mail ons op <a href="mailto:info@pootgelukkig.nl" style="color:#ee5b2b;font-weight:600">info@pootgelukkig.nl</a>.
        </p>
      </div>
    </div>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = demoAanvraagSchema.safeParse(body)

    if (!parsed.success) {
      const first = parsed.error.errors[0]
      return NextResponse.json(
        { error: first.message ?? 'Controleer de ingevulde velden.' },
        { status: 400 }
      )
    }

    const d = parsed.data

    // Honeypot ingevuld: doe alsof het gelukt is, verstuur niets.
    if (d.website) {
      return NextResponse.json({ data: { ok: true } }, { status: 200 })
    }

    // 1) Schrijf een CRM-lead zodat de aanvraag in de pipeline belandt.
    const focus = (d.focus ?? []).map((f) => FOCUS_LABELS[f] ?? f)
    const momentenTekst = d.momenten
      .map((m) => `${DAG_LABELS[m.dag]} ${m.dagdeel}`)
      .join('; ')

    let leadId: number | null = null
    try {
      const [lead] = await db
        .insert(crmContacten)
        .values({
          naam: d.naam,
          email: d.email,
          telefoon: d.telefoon ?? null,
          bedrijf: d.asielNaam,
          type: 'asiel',
          bron: 'demo-aanvraag',
          stad: d.asielPlaats,
          tags: ['demo-aanvraag', d.duur, ...focus].slice(0, 12),
          notitie: [
            `Soort demo: ${DUUR_LABELS[d.duur]}`,
            `Platform: ${PLATFORM_LABELS[d.platform]}`,
            `Voorkeursmomenten: ${momentenTekst}`,
            d.functie ? `Functie: ${d.functie}` : '',
            d.aantalDieren != null ? `Aantal dieren: ${d.aantalDieren}` : '',
            d.huidigSysteem ? `Huidig systeem: ${d.huidigSysteem}` : '',
            d.opmerkingen ? `Opmerkingen: ${d.opmerkingen}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
        })
        .returning({ id: crmContacten.id })
      leadId = lead?.id ?? null
    } catch (err) {
      // CRM-fout mag de aanvraag niet blokkeren — we loggen en mailen alsnog.
      console.error('[Demo] CRM-lead aanmaken mislukt:', err)
    }

    // 2) Mail naar het team met alle voorbereidingsdata.
    const teamMail = await verstuurMail({
      naar: MANAGEMENT_EMAIL,
      onderwerp: `Demo-aanvraag ${d.asielNaam}: ${d.naam} (${DUUR_LABELS[d.duur]})`,
      html: bouwTeamHtml(d),
      antwoordNaar: d.email,
      meta: { template: 'demo-aanvraag', organisatieId: null },
    })

    // 3) Bevestigingsmail naar het asiel.
    const bevestiging = await verstuurMail({
      naar: d.email,
      onderwerp: `Je demo-aanvraag is binnen — PootGelukkig`,
      html: bouwBevestigingHtml(d),
      meta: { template: 'demo-bevestiging', contactId: leadId },
    })

    if (!teamMail.ok && !bevestiging.ok) {
      return NextResponse.json(
        { error: 'Je aanvraag kon niet worden verzonden. Mail ons gerust direct op info@pootgelukkig.nl.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ data: { ok: true, leadId } }, { status: 200 })
  } catch (err) {
    console.error('Demo-aanvraag fout:', err)
    return NextResponse.json({ error: 'Er is iets misgegaan. Probeer het opnieuw.' }, { status: 500 })
  }
}
