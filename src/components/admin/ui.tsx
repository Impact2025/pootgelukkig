import Link from 'next/link'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { statusTone, statusLabel, type StatusTone } from './nav'

/* Presentatie-primitives voor de admin. Licht thema, navy #33335c + amber #f8aa25.
   Geen hooks → bruikbaar in zowel server- als client-componenten. */

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

// ─── Card ────────────────────────────────────────────────────────────────────

export function Card({
  children,
  className,
  padding = true,
}: {
  children: ReactNode
  className?: string
  padding?: boolean
}) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-[#33335c]/8 bg-white shadow-[0_1px_3px_rgba(51,51,92,0.04)]',
        padding && 'p-5',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── PageHeader ──────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actions,
  icon,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  icon?: string
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex size-10 items-center justify-center rounded-xl bg-[#33335c] text-[#f8aa25]">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
          </span>
        )}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#33335c]">{title}</h1>
          {description && <p className="mt-1 text-sm text-[#33335c]/55">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

// ─── Button ──────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[#33335c] text-white hover:bg-[#26264a]',
  secondary: 'bg-[#f8aa25] text-[#33335c] hover:bg-[#e39207]',
  ghost: 'border border-[#33335c]/15 bg-white text-[#33335c] hover:border-[#33335c]/30',
  danger: 'bg-red-500 text-white hover:bg-red-600',
}

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none'

export function Button({
  variant = 'primary',
  icon,
  loading,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: string
  loading?: boolean
}) {
  return (
    <button className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], className)} disabled={loading || props.disabled} {...props}>
      {icon && !loading && <span className="material-symbols-outlined text-[1.15rem]">{icon}</span>}
      {loading && <span className="material-symbols-outlined animate-spin text-[1.15rem]">progress_activity</span>}
      {children}
    </button>
  )
}

export function ButtonLink({
  href,
  variant = 'primary',
  icon,
  children,
  className,
}: {
  href: string
  variant?: ButtonVariant
  icon?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link href={href} className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], className)}>
      {icon && <span className="material-symbols-outlined text-[1.15rem]">{icon}</span>}
      {children}
    </Link>
  )
}

// ─── Badge & StatusBadge ─────────────────────────────────────────────────────

const TONE_STYLES: Record<StatusTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  danger: 'bg-red-50 text-red-700 ring-red-600/15',
  neutral: 'bg-gray-100 text-gray-600 ring-gray-500/15',
  info: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15',
}

export function Badge({ tone = 'neutral', children }: { tone?: StatusTone; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset',
        TONE_STYLES[tone]
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
}

// ─── StatCard ────────────────────────────────────────────────────────────────

export function StatCard({
  label,
  value,
  icon,
  hint,
  delta,
  href,
  tone = 'neutral',
}: {
  label: string
  value: ReactNode
  icon: string
  hint?: string
  delta?: { value: number; positiefIsGoed?: boolean }
  href?: string
  tone?: StatusTone
}) {
  const inner = (
    <>
      <div className="flex items-center justify-between">
        <span className={cx('flex size-9 items-center justify-center rounded-lg', TONE_STYLES[tone])}>
          <span className="material-symbols-outlined text-[1.2rem]">{icon}</span>
        </span>
        {delta && <DeltaPill value={delta.value} positiefIsGoed={delta.positiefIsGoed ?? true} />}
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-[#33335c]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#33335c]/55">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-[#33335c]/40">{hint}</p>}
    </>
  )
  const className =
    'block rounded-2xl border border-[#33335c]/8 bg-white p-5 shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow'
  return href ? (
    <Link href={href} className={cx(className, 'hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)]')}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  )
}

function DeltaPill({ value, positiefIsGoed }: { value: number; positiefIsGoed: boolean }) {
  if (value === 0) {
    return <span className="text-xs font-bold text-[#33335c]/35">0%</span>
  }
  const positief = value > 0
  const goed = positief === positiefIsGoed
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 text-xs font-bold',
        goed ? 'text-emerald-600' : 'text-red-500'
      )}
    >
      <span className="material-symbols-outlined text-[1rem]">{positief ? 'trending_up' : 'trending_down'}</span>
      {Math.abs(value)}%
    </span>
  )
}

// ─── EmptyState ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#33335c]/15 bg-white px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f6f8f6] text-[#33335c]/35">
        <span className="material-symbols-outlined text-[1.6rem]">{icon}</span>
      </span>
      <h3 className="mt-4 text-base font-bold text-[#33335c]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-[#33335c]/55">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-lg bg-[#33335c]/8', className)} />
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

export function Avatar({ naam, className }: { naam: string; className?: string }) {
  return (
    <span
      className={cx(
        'flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#33335c] text-sm font-extrabold leading-none text-[#f8aa25]',
        className
      )}
    >
      {(naam.trim().charAt(0) || '?').toUpperCase()}
    </span>
  )
}
