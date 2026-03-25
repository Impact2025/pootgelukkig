import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f8aa25',
        'primary-dark': '#e39207',
        navy: '#33335c',
        terracotta: '#E2725B',
        'terracotta-dark': '#ee5b2b',
        'bg-dark': '#12122a',
        'bg-light': '#f9fafb',
        sage: '#9db99d',
        'sage-dark': '#3b543b',
        'sage-bg': '#E9EDC9',
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Safe area utilities: pb-safe, pt-safe, etc.
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.pb-safe': {
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        },
        '.pt-safe': {
          paddingTop: 'max(0rem, env(safe-area-inset-top))',
        },
        '.pl-safe': {
          paddingLeft: 'max(0rem, env(safe-area-inset-left))',
        },
        '.pr-safe': {
          paddingRight: 'max(0rem, env(safe-area-inset-right))',
        },
        '.mb-safe': {
          marginBottom: 'max(0rem, env(safe-area-inset-bottom))',
        },
      })
    },
  ],
}

export default config
