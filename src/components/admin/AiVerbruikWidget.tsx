import { euro } from '@/lib/beheer/stats'
import type { OrganisatieAiVerbruik } from '@/lib/beheer/stats'
import { Card } from './ui'

export function AiVerbruikWidget({ verbruik }: { verbruik: OrganisatieAiVerbruik }) {
  const overBudget = verbruik.kostenEuro > verbruik.budgetEuro
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-[#1E293B]">AI-verbruik deze maand</h2>
          <p className="text-[#1E293B]/40 text-xs mt-0.5">{verbruik.calls} AI-aanroepen · Sam, Mila, Conny, Bram &amp; Samen</p>
        </div>
        <span className="material-symbols-outlined text-[#1E293B]/20 text-2xl">auto_awesome</span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <p className="text-3xl font-extrabold text-[#1E293B] tabular-nums">
          {euro(verbruik.kostenEuro)}
          <span className="text-sm font-semibold text-[#1E293B]/40"> / {euro(verbruik.budgetEuro)}</span>
        </p>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-lg ${
            overBudget ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {verbruik.percentage}%
        </span>
      </div>

      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${overBudget ? 'bg-red-500' : 'bg-[#2563EB]'}`}
          style={{ width: `${Math.min(100, verbruik.percentage)}%` }}
        />
      </div>

      {overBudget && (
        <p className="text-red-600 text-xs font-semibold mt-2">
          Inbegrepen budget overschreden — extra verbruik wordt doorbelast.
        </p>
      )}
    </Card>
  )
}
