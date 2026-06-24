import { Resend } from 'resend'
import { render } from '@react-email/components'
import { db } from '@/lib/db'
import { mailLog } from '@/lib/db/schema'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl'
const VAN = 'PootGelukkig <no-reply@pootgelukkig.nl>'

interface MailMeta {
  template?: string
  userId?: number | null
  asielId?: number | null
  contactId?: number | null
  van?: string
}

// Niet-blokkerend wegschrijven naar mail_log (tracking van volume + status)
async function logMail(args: {
  naar: string
  van: string
  onderwerp: string
  status: 'verzonden' | 'gefaald'
  resendId?: string
  fout?: string
  meta?: MailMeta
}) {
  try {
    await db.insert(mailLog).values({
      naar: args.naar,
      van: args.van,
      onderwerp: args.onderwerp,
      template: args.meta?.template ?? null,
      status: args.status,
      resendId: args.resendId ?? null,
      contactId: args.meta?.contactId ?? null,
      asielId: args.meta?.asielId ?? null,
      userId: args.meta?.userId ?? null,
      fout: args.fout ?? null,
    })
  } catch (err) {
    console.error('[Email] mail_log schrijven mislukt:', err)
  }
}

// ─── Basis verzend functie ────────────────────────────────────────────────────

async function stuurEmail(
  { naar, onderwerp, html, antwoordNaar }: { naar: string; onderwerp: string; html: string; antwoordNaar?: string },
  meta?: MailMeta
) {
  const van = meta?.van ?? VAN
  if (!resend) {
    console.log(`[Email] ${onderwerp} → ${naar} (geen RESEND_API_KEY)`)
    await logMail({ naar, van, onderwerp, status: 'gefaald', fout: 'geen RESEND_API_KEY', meta })
    return { ok: false }
  }
  try {
    const result = await resend.emails.send({
      from: van,
      to: naar,
      subject: onderwerp,
      html,
      ...(antwoordNaar ? { replyTo: antwoordNaar } : {}),
    })
    await logMail({ naar, van, onderwerp, status: 'verzonden', resendId: result.data?.id, meta })
    return { ok: true, id: result.data?.id }
  } catch (err) {
    console.error('[Email] Versturen mislukt:', err)
    await logMail({ naar, van, onderwerp, status: 'gefaald', fout: String(err), meta })
    return { ok: false }
  }
}

// ─── Generieke verzendfunctie (o.a. voor CRM-mail) ────────────────────────────

export async function verstuurMail(args: {
  naar: string
  onderwerp: string
  html: string
  antwoordNaar?: string
  meta?: MailMeta
}) {
  return stuurEmail(
    { naar: args.naar, onderwerp: args.onderwerp, html: args.html, antwoordNaar: args.antwoordNaar },
    args.meta
  )
}

// ─── Management rapport (dag + maand) ─────────────────────────────────────────

const MANAGEMENT_EMAIL = process.env.MANAGEMENT_EMAIL ?? 'v.munster@weareimpact.nl'

export async function stuurManagementRapport(props: {
  periode: 'dag' | 'maand'
  periodeLabel: string
  periodeTitel: string
  stats: { nieuweGebruikers: number; nieuweMatches: number; nieuweAdopties: number; verzondenMails: number }
  aiKosten: string
  aiCalls: number
  aiPerModule: { module: string; kosten: string; calls: number }[]
  samenvatting?: string
  trends?: { label: string; waarde: string }[]
}) {
  const { ManagementRapport } = await import('@/emails/ManagementRapport')
  const html = await render(
    ManagementRapport({
      periodeLabel: props.periodeLabel,
      periodeTitel: props.periodeTitel,
      stats: props.stats,
      aiKosten: props.aiKosten,
      aiCalls: props.aiCalls,
      aiPerModule: props.aiPerModule,
      samenvatting: props.samenvatting,
      trends: props.trends,
      portaalUrl: `${APP_URL}/admin/beheer`,
    })
  )
  const prefix = props.periode === 'dag' ? '📊 Dagrapport' : '📈 Maandrapport'
  return stuurEmail(
    { naar: MANAGEMENT_EMAIL, onderwerp: `${prefix} PootGelukkig — ${props.periodeTitel}`, html },
    { template: `management-${props.periode}` }
  )
}

// ─── Match alert voor asiel ───────────────────────────────────────────────────

export async function stuurMatchAlert({
  asielEmail,
  asielNaam,
  dierNaam,
  dierSoort,
  dierSlug,
  adoptantNaam,
  matchScore,
  analyseTekst,
}: {
  asielEmail: string
  asielNaam: string
  dierNaam: string
  dierSoort: string
  dierSlug: string | number
  adoptantNaam: string
  matchScore: number
  analyseTekst: string
}) {
  const { MatchAlert } = await import('@/emails/MatchAlert')
  const html = await render(
    MatchAlert({
      asielNaam,
      dierNaam,
      dierSoort,
      adoptantNaam,
      matchScore,
      analyseTekst,
      dierUrl: `${APP_URL}/admin/dieren/${dierSlug}`,
    })
  )
  return stuurEmail({
    naar: asielEmail,
    onderwerp: `🐾 ${adoptantNaam} matcht ${Math.round(matchScore)}% met ${dierNaam}`,
    html,
  }, { template: 'match-alert' })
}

// ─── Welkomstmail asiel ───────────────────────────────────────────────────────

export async function stuurWelkomAsiel({
  asielEmail,
  asielNaam,
  contactpersoonNaam,
}: {
  asielEmail: string
  asielNaam: string
  contactpersoonNaam: string
}) {
  const { WelkomAsiel } = await import('@/emails/WelkomAsiel')
  const html = await render(
    WelkomAsiel({
      asielNaam,
      contactpersoonNaam,
      loginUrl: `${APP_URL}/auth/login`,
    })
  )
  return stuurEmail({
    naar: asielEmail,
    onderwerp: `Welkom bij PootGelukkig, ${asielNaam}! 🎉`,
    html,
  }, { template: 'welkom-asiel' })
}

// ─── Wekelijkse digest ────────────────────────────────────────────────────────

export async function stuurWeekelijkseDigest({
  asielEmail,
  asielNaam,
  contactpersoonNaam,
  stats,
  topMatches,
}: {
  asielEmail: string
  asielNaam: string
  contactpersoonNaam: string
  stats: { nieuweMatches: number; nieuweBeichten: number; actieveDieren: number; adopties: number }
  topMatches: Array<{ dierNaam: string; adoptantNaam: string; score: number }>
}) {
  const { WeekelijkseDigest } = await import('@/emails/WeekelijkseDigest')
  const weekNummer = Math.ceil(new Date().getDate() / 7)
  const html = await render(
    WeekelijkseDigest({
      asielNaam,
      contactpersoonNaam,
      week: `Week ${weekNummer}`,
      stats,
      topMatches,
      portaalUrl: `${APP_URL}/admin`,
    })
  )
  return stuurEmail({
    naar: asielEmail,
    onderwerp: `📊 Weekoverzicht ${asielNaam} — ${stats.nieuweMatches} nieuwe matches`,
    html,
  }, { template: 'weekdigest' })
}

// ─── Afspraak herinnering ─────────────────────────────────────────────────────

export async function stuurAfspraakHerinnering({
  email,
  naam,
  dierNaam,
  dierSoort,
  asielNaam,
  asielAdres,
  afspraakDatum,
  rol,
}: {
  email: string
  naam: string
  dierNaam: string
  dierSoort: string
  asielNaam: string
  asielAdres: string
  afspraakDatum: Date
  rol: 'adoptant' | 'asiel'
}) {
  const { AfspraakHerinnering } = await import('@/emails/AfspraakHerinnering')
  const html = await render(
    AfspraakHerinnering({
      ontvangerNaam: naam,
      dierNaam,
      dierSoort,
      asielNaam,
      asielAdres,
      afspraakDatum,
      portaalUrl: rol === 'asiel' ? `${APP_URL}/admin/berichten` : `${APP_URL}/dashboard`,
      rol,
    })
  )
  return stuurEmail({
    naar: email,
    onderwerp: `⏰ Morgen: kennismaking met ${dierNaam} bij ${asielNaam}`,
    html,
  }, { template: 'afspraak-herinnering' })
}

// ─── Nazorg emails (3-3-3 regel) ──────────────────────────────────────────────

export async function stuurNazorgEmail({
  adoptantEmail,
  adoptantNaam,
  dierNaam,
  dierSoort,
  fase,
  aiTips,
}: {
  adoptantEmail: string
  adoptantNaam: string
  dierNaam: string
  dierSoort: string
  fase: 'dag3' | 'week3' | 'maand3'
  aiTips: string[]
}) {
  const { NazorgEmail } = await import('@/emails/NazorgEmail')
  const faseLabels = { dag3: 'Dag 3', week3: 'Week 3', maand3: 'Maand 3' }
  const html = await render(
    NazorgEmail({
      adoptantNaam,
      dierNaam,
      dierSoort,
      fase,
      aiTips,
      nazorgUrl: `${APP_URL}/nazorg`,
    })
  )
  return stuurEmail({
    naar: adoptantEmail,
    onderwerp: `${faseLabels[fase]} met ${dierNaam} — hoe gaat het? 🐾`,
    html,
  }, { template: 'nazorg' })
}

// ─── Uitnodiging voor nieuw asiel (cold outreach) ─────────────────────────────

export async function stuurUitnodigingAsiel({
  asielEmail,
  asielNaam,
  stad,
  asielId,
}: {
  asielEmail: string
  asielNaam: string
  stad: string
  asielId: number
}) {
  const { UitnodigingAsiel } = await import('@/emails/UitnodigingAsiel')
  const html = await render(
    UitnodigingAsiel({
      asielNaam,
      stad,
      aanmeldUrl: `${APP_URL}/auth/register?type=asiel&asielId=${asielId}`,
      afmeldUrl: `${APP_URL}/asiel-afmelden?asielId=${asielId}`,
    })
  )
  return stuurEmail({
    naar: asielEmail,
    onderwerp: `${asielNaam}, help dieren sneller aan het juiste thuis 🐾`,
    html,
  }, { template: 'uitnodiging-asiel' })
}

// ─── Wachtwoord vergeten / reset ──────────────────────────────────────────────

export async function stuurWachtwoordReset({
  email,
  naam,
  token,
  geldigMinuten,
}: {
  email: string
  naam: string
  token: string
  geldigMinuten: number
}) {
  const { WachtwoordReset } = await import('@/emails/WachtwoordReset')
  const html = await render(
    WachtwoordReset({
      naam,
      resetUrl: `${APP_URL}/auth/wachtwoord-reset?token=${token}`,
      geldigMinuten,
    })
  )
  return stuurEmail({
    naar: email,
    onderwerp: 'Stel je PootGelukkig-wachtwoord opnieuw in 🔑',
    html,
  }, { template: 'wachtwoord-reset' })
}

// ─── Adoptie status update ────────────────────────────────────────────────────

export async function stuurAdoptieStatusUpdate({
  adoptantEmail,
  adoptantNaam,
  dierNaam,
  isGoedgekeurd,
}: {
  adoptantEmail: string
  adoptantNaam: string
  dierNaam: string
  isGoedgekeurd: boolean
}) {
  const html = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ebebf0">
      <div style="background:linear-gradient(135deg,#33335c,#1a1a3e);padding:28px 32px">
        <p style="margin:0;font-size:20px;font-weight:800;color:#fff">🐾 PootGelukkig</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px">Update over jouw adoptie van ${dierNaam}</h2>
        <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px">Hallo ${adoptantNaam},<br/><br/>
          ${isGoedgekeurd
            ? `Goed nieuws! Je adoptie van <strong>${dierNaam}</strong> is <strong style="color:#22c55e">goedgekeurd</strong>. Het asiel neemt snel contact met je op voor de overdracht.`
            : `Je adoptie van <strong>${dierNaam}</strong> is helaas niet doorgegaan. Neem contact op met het asiel voor meer informatie.`}
        </p>
        <a href="${APP_URL}/dossier" style="display:inline-block;background:#f8aa25;color:#33335c;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:14px">
          Bekijk je dossier →
        </a>
      </div>
    </div>`
  return stuurEmail({
    naar: adoptantEmail,
    onderwerp: isGoedgekeurd ? `🎉 Adoptie van ${dierNaam} goedgekeurd!` : `Update over je adoptie van ${dierNaam}`,
    html,
  }, { template: 'adoptie-status' })
}
