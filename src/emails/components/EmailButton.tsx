import { Button } from '@react-email/components'
import * as React from 'react'

interface EmailButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function EmailButton({ href, children, variant = 'primary' }: EmailButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <Button
      href={href}
      style={{
        display: 'inline-block',
        background: isPrimary ? '#2563EB' : '#1E293B',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: '14px',
        padding: '14px 28px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
        boxShadow: isPrimary ? '0 4px 16px rgba(37,99,235,0.3)' : '0 4px 16px rgba(30,41,59,0.2)',
      }}
    >
      {children}
    </Button>
  )
}
