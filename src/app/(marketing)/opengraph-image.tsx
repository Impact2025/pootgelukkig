import { ImageResponse } from 'next/og'

export const alt = 'PootGelukkig — Slimme matching voor asieldieren'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #33335c 0%, #26264a 100%)',
          padding: '72px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: '#f8aa25',
              color: '#33335c',
              fontSize: '34px',
              fontWeight: 800,
            }}
          >
            PG
          </div>
          <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            PootGelukkig
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              maxWidth: '900px',
            }}
          >
            Sneller een gelukkig thuis voor ieder asieldier
          </div>
          <div style={{ display: 'flex', marginTop: '28px' }}>
            <div style={{ width: '120px', height: '8px', borderRadius: '9999px', background: '#ee5b2b' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', color: '#c9c9d6' }}>
          <div style={{ display: 'flex' }}>pootgelukkig.nl</div>
          <div style={{ display: 'flex' }}>Een initiatief van WeAreImpact</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
