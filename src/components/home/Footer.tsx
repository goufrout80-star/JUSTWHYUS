import { Link } from 'react-router-dom'

const TEAL = '#2BDBA4'
const VOID = '#080808'
const INK = '#0D1A14'

const links = [
  { label: 'HOME', to: '/' },
  { label: 'BRANDS', to: '/brands' },
  { label: 'CREATORS', to: '/creators' },
  { label: 'DOCS', to: '/docs' },
]

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: VOID,
        borderTop: `1px solid ${INK}`,
        padding: '32px clamp(24px,5vw,64px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {/* Left */}
        <div>
          <span
            className="font-brand"
            style={{ fontSize: 13, color: 'rgba(240,235,216,0.25)' }}
          >
            JUST WHY US
          </span>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 12,
              color: 'rgba(240,235,216,0.18)',
              marginTop: 6,
            }}
          >
            Campaign execution operator.
          </p>
        </div>

        {/* Center */}
        <div style={{ display: 'flex', gap: 28 }}>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 11,
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(240,235,216,0.3)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,235,216,0.3)')}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ textAlign: 'right' }}>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(240,235,216,0.18)',
            }}
          >
            &copy; 2026 JUST WHY US LLC
          </p>
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 10,
              color: 'rgba(43,219,164,0.5)',
              marginTop: 4,
            }}
          >
            justwhyus.com
          </p>
        </div>
      </div>
    </footer>
  )
}
