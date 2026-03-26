import * as React from 'react'

interface StatCardProps {
  getal: string | number
  label: string
  kleur?: string
}

export function StatCard({ getal, label, kleur = '#f8aa25' }: StatCardProps) {
  return (
    <td style={{ textAlign: 'center', padding: '0 8px' }}>
      <div style={{ background: '#f8f8fb', borderRadius: '12px', padding: '16px 12px', border: '1px solid #ebebf0' }}>
        <p style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: kleur, fontFamily: "'Plus Jakarta Sans', Arial, sans-serif", lineHeight: 1 }}>
          {getal}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          {label}
        </p>
      </div>
    </td>
  )
}
