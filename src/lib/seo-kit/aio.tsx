// ─────────────────────────────────────────────────────────────────────────
// seo-kit — AIO/GEO componenten (Generative Engine Optimization)
// Hoogste ROI voor AI-zichtbaarheid: gestructureerde, citeerbare antwoorden
// + FAQPage JSON-LD. AI-chatbots citeren pages met duidelijke topical authority
// en gestructureerde Q&A (Surfer 2026: "mention gaps").
// ─────────────────────────────────────────────────────────────────────────

import type { FaqItem } from './schema'
import { faqPageSchema } from './schema'

/**
 * FaqSection — semantische <details>-lijst + automatische FAQPage JSON-LD.
 * Direct citeerbaar door ChatGPT / Perplexity / Copilot.
 * Gebruik op /faq én inline op money pages (veelgestelde vragen bij converterende CTA).
 */
export function FaqSection({
  items,
  className,
  title = 'Veelgestelde vragen',
}: {
  items: FaqItem[]
  className?: string
  title?: string
}) {
  return (
    <section className={className} aria-label={title}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(items)) }}
      />
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="divide-y">
        {items.map((it, i) => (
          <details key={i} className="py-3">
            <summary className="cursor-pointer font-medium">{it.question}</summary>
            <p className="mt-2 text-muted-foreground">{it.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/**
 * AioAnswerBlock — korte, geneste antwoord-paragraaf voor een specifieke vraag.
 * Wordt door AI-overviews vaak direct overgenomen. Houd het antwoord < 2 zinnen,
 * feitelijk, zonder marketingtaal.
 */
export function AioAnswerBlock({
  question,
  answer,
  className,
}: {
  question: string
  answer: string
  className?: string
}) {
  return (
    <div className={className} itemScope itemType="https://schema.org/Question">
      <p className="sr-only" itemProp="text">
        {question}
      </p>
      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
        <p itemProp="text">{answer}</p>
      </div>
    </div>
  )
}
