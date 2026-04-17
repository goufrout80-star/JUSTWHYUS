import { useState } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { Link } from 'react-router-dom'
import LogoMark from '../ui/LogoMark'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const INK = '#0D1A14'

const NAV_LINKS = [
  { label: 'FOR BRANDS', to: '/brands' },
  { label: 'FOR CREATORS', to: '/creators' },
  { label: 'DOCS', to: '/docs' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(latest > prev && latest > 120)
    setScrolled(latest > 20)
  })

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 60,
        padding: '0 clamp(24px,5vw,64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,8,8,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'rgba(13,26,20,0.9)' : 'transparent'}`,
        transition: 'background 0.3s, backdrop-filter 0.3s, border-color 0.3s',
      }}
    >
      {/* LEFT — Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <LogoMark size={26} />
        <span
          className="font-brand"
          style={{ color: CREAM, fontSize: 14, letterSpacing: '0.06em' }}
        >
          JUST WHY US
        </span>
      </Link>

      {/* CENTER — Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'rgba(240,235,216,0.55)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(240,235,216,0.55)')}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* RIGHT — CTA */}
      <Link
        to="/select"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 900,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: TEAL,
          padding: '9px 20px',
          borderRadius: 999,
          textDecoration: 'none',
          border: '1.5px solid rgba(43,219,164,0.5)',
          background: 'transparent',
          transition: 'all 0.25s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = TEAL
          e.currentTarget.style.background = INK
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(43,219,164,0.5)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        REQUEST ACCESS
      </Link>
    </motion.nav>
  )
}
