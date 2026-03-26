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
        background: isPrimary ? '#f8aa25' : '#33335c',
        color: isPrimary ? '#33335c' : '#ffffff',
        fontWeight: 700,
        fontSize: '14px',
        padding: '14px 28px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
        boxShadow: isPrimary ? '0 4px 16px rgba(248,170,37,0.3)' : '0 4px 16px rgba(51,51,92,0.2)',
      }}
    >
      {children}
    </Button>
  )
}
