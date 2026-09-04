import Link from 'next/link'
import type { ReactNode } from 'react'

/* Herbruikbare, lichte marketing-UI primitives. Navy tekst (#1E293B),
   amber accent (#3B82F6), terracotta CTA (#2563EB). Geen emoji's. */

export function Container({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
}

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`py-20 sm:py-28 ${className}`}>
      <Container>{children}</Container>
    </section>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">
      {children}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  center?: boolean
}) {
  return (
    <div className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#1E293B] sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-[#1E293B]/65">{intro}</p>}
    </div>
  )
}

type ButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  icon?: string
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
  icon,
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-all active:scale-[0.97]'
  const styles = {
    primary: 'bg-[#2563EB] text-white shadow-sm hover:bg-[#1D4ED8]',
    secondary: 'bg-[#1E293B] text-white hover:bg-[#0F172A]',
    ghost: 'border border-[#1E293B]/15 bg-white text-[#1E293B] hover:border-[#1E293B]/30',
  }[variant]
  const isInternal = href.startsWith('/')
  const content = (
    <>
      {children}
      {icon && <span className="material-symbols-outlined text-[1.1rem]">{icon}</span>}
    </>
  )
  return isInternal ? (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {content}
    </Link>
  ) : (
    <a href={href} className={`${base} ${styles} ${className}`}>
      {content}
    </a>
  )
}

export function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-[#1E293B]/8 bg-white p-7 shadow-[0_1px_3px_rgba(51,51,92,0.04)] transition-shadow hover:shadow-[0_8px_30px_rgba(51,51,92,0.08)]">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#3B82F6]/12 text-[#2563EB]">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="mt-5 text-lg font-bold text-[#1E293B]">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[#1E293B]/65">{children}</p>
    </div>
  )
}

export function StepItem({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: ReactNode
}) {
  return (
    <div className="relative pl-16">
      <div className="absolute left-0 top-0 flex size-11 items-center justify-center rounded-2xl bg-[#1E293B] text-base font-extrabold text-white">
        {step}
      </div>
      <h3 className="text-lg font-bold text-[#1E293B]">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[#1E293B]/65">{children}</p>
    </div>
  )
}

export function CtaBlock({
  title,
  intro,
  primary,
  secondary,
}: {
  title: string
  intro: string
  primary: { href: string; label: string }
  secondary?: { href: string; label: string }
}) {
  return (
    <Section>
      <div className="overflow-hidden rounded-[2rem] bg-[#1E293B] px-8 py-14 text-center sm:px-16">
        <h2 className="mx-auto max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">{intro}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={primary.href} variant="primary">
            {primary.label}
          </ButtonLink>
          {secondary && (
            <ButtonLink href={secondary.href} variant="ghost" className="!bg-white/10 !text-white !border-white/20 hover:!border-white/40">
              {secondary.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </Section>
  )
}
