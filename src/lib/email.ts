import { Resend } from 'resend'
import { render } from '@react-email/components'
import { db } from '@/lib/db'
import { mailLog } from '@/lib/db/schema'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl'
const VAN = 'ImpactOS <no-reply@impactos.nl>'

interface MailMeta {
  template?: string
  userId?: number | null
  organisatieId?: string | null
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
      organisatieId: args.meta?.organisatieId ?? null,
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
      ...({ open_tracking: true, click_tracking: true } as any),
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
  stats: { nieuweGebruikers: number; nieuweMatches: number; nieuweBegeleidingen: number; verzondenMails: number }
  aiKosten: string
  aiCalls: number
  aiPerActie: { actie: string; kosten: string; calls: number }[]
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
      aiPerActie: props.aiPerActie,
      samenvatting: props.samenvatting,
      trends: props.trends,
      portaalUrl: `${APP_URL}/management`,
    })
  )
  const prefix = props.periode === 'dag' ? '📊 Dagrapport' : '📈 Maandrapport'
  return stuurEmail(
    { naar: MANAGEMENT_EMAIL, onderwerp: `${prefix} ImpactOS — ${props.periodeTitel}`, html },
    { template: `management-${props.periode}` }
  )
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

// ─── Uitnodiging voor nieuwe organisatie (cold outreach) ──────────────────────

const DEMO_VIDEO_URL = process.env.DEMO_VIDEO_URL ?? 'https://www.youtube.com/watch?v=DEMO_VIDEO_PLACEHOLDER'

export async function stuurUitnodigingAsielV2({
  asielEmail,
  asielNaam,
  stad,
  organisatieId,
}: {
  asielEmail: string
  asielNaam: string
  stad: string
  organisatieId: string
}) {
  const { UitnodigingAsielV2 } = await import('@/emails/UitnodigingAsielV2')
  const html = await render(
    UitnodigingAsielV2({
      asielNaam,
      stad,
      aanmeldUrl: `${APP_URL}/auth/register?type=asiel&organisatieId=${organisatieId}`,
      demoUrl: DEMO_VIDEO_URL,
      afmeldUrl: `${APP_URL}/asiel-afmelden?organisatieId=${organisatieId}`,
    })
  )
  return stuurEmail({
    naar: asielEmail,
    onderwerp: `${asielNaam}, 2 minuten die jullie werkdag veranderen 🐾`,
    html,
  }, { template: 'uitnodiging-asiel-v2' })
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
    onderwerp: 'Stel je ImpactOS-wachtwoord opnieuw in 🔑',
    html,
  }, { template: 'wachtwoord-reset' })
}

// ─── Onboarding afgerond (welkomstmail na het gesprek met Noor) ──────────────

const ROL_LABELS: Record<string, string> = {
  fundraising: 'Sam — Fondsen & Subsidies',
  rapportage: 'Mila — Impact & Verantwoording',
  social: 'Conny — Communicatie & Storytelling',
  vrijwilligers: 'Bram — Werving & Vrijwilligers',
  chat: 'Samen — 24/7 Webassistent',
}

export async function stuurOnboardingWelkom({
  email,
  organisatieNaam,
  contactNaam,
  geactiveerdeRolIds,
  organisatieId,
}: {
  email: string
  organisatieNaam: string
  contactNaam: string
  geactiveerdeRolIds: string[]
  organisatieId: string
}) {
  const { OnboardingWelkom } = await import('@/emails/OnboardingWelkom')
  const geactiveerdeRollen = geactiveerdeRolIds.map((r) => ROL_LABELS[r] ?? r)
  const html = await render(
    OnboardingWelkom({
      organisatieNaam,
      contactNaam,
      geactiveerdeRollen,
      dashboardUrl: `${APP_URL}/admin`,
    })
  )
  return stuurEmail(
    { naar: email, onderwerp: `${organisatieNaam} is ingericht op ImpactOS 🚀`, html },
    { template: 'onboarding-welkom', organisatieId }
  )
}

// ─── Teamuitnodiging ──────────────────────────────────────────────────────────

export async function stuurTeamUitnodiging({
  email,
  organisatieNaam,
  uitgenodigdDoorNaam,
  token,
  geldigDagen,
}: {
  email: string
  organisatieNaam: string
  uitgenodigdDoorNaam: string
  token: string
  geldigDagen: number
}) {
  const { TeamUitnodiging } = await import('@/emails/TeamUitnodiging')
  const html = await render(
    TeamUitnodiging({
      organisatieNaam,
      uitgenodigdDoorNaam,
      accepteerUrl: `${APP_URL}/auth/uitnodiging?token=${token}`,
      geldigDagen,
    })
  )
  return stuurEmail({
    naar: email,
    onderwerp: `${uitgenodigdDoorNaam} nodigt je uit voor ${organisatieNaam} op ImpactOS`,
    html,
  }, { template: 'team-uitnodiging' })
}

