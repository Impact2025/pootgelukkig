import type { ReactNode } from 'react'
import { cx } from './ui'

/* "Calm Executive" presentatie-primitives — alleen gebruikt binnen /admin
   (Cockpit-dashboard + Review Gate wachtrij). Kobalt/emerald M3-palet,
   Plus Jakarta Sans voor koppen, Inter voor body/labels. */

export function CalmIcon({ name, className, fill }: { name: string; className?: string; fill?: boolean }) {
  return (
    <span
      className={cx('material-symbols-outlined', className)}
      style={{ fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0" }}
    >
      {name}
    </span>
  )
}

export function CalmCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        'rounded-3xl border border-calm-outline-variant/40 bg-calm-surface-lowest shadow-[0_1px_2px_rgba(19,27,46,0.04),0_8px_24px_-16px_rgba(19,27,46,0.15)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CalmPill({
  tone = 'neutral',
  icon,
  children,
}: {
  tone?: 'primary' | 'success' | 'neutral' | 'warning'
  icon?: string
  children: ReactNode
}) {
  const tones: Record<string, string> = {
    primary: 'bg-calm-primary-fixed text-calm-primary',
    success: 'bg-calm-secondary-fixed/60 text-calm-on-secondary-fixed',
    warning: 'bg-amber-100 text-amber-800',
    neutral: 'bg-calm-surface-container text-calm-on-surface-variant',
  }
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold font-inter', tones[tone])}>
      {icon && <CalmIcon name={icon} className="text-[0.9rem]" fill />}
      {children}
    </span>
  )
}

export function CalmMetricChip({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-calm-surface-low px-3.5 py-2.5">
      <p className="font-inter text-[10px] font-bold uppercase tracking-wider text-calm-on-surface-variant/70">{label}</p>
      <p className="font-jakarta text-sm font-bold text-calm-on-surface">{value}</p>
    </div>
  )
}

export function CalmProgressBar({ percentage }: { percentage: number }) {
  const clamped = Math.max(0, Math.min(100, percentage))
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-calm-surface-container">
      <div
        className="h-full rounded-full bg-calm-primary-container transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
