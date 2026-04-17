import { motion } from 'framer-motion'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const vp = { once: true, amount: 0.15 }

const niches = [
  {
    name: 'AI Tools',
    tag: 'AI',
    desc: 'Reach builders before they stop discovering.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(43,219,164,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h3" />
      </svg>
    ),
  },
  {
    name: 'SaaS Products',
    tag: 'SAAS',
    desc: 'Creators who educate, not just promote.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(43,219,164,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <circle cx="7" cy="6" r="1" fill="rgba(43,219,164,0.7)" stroke="none" />
      </svg>
    ),
  },
  {
    name: 'Filmmaking Gear',
    tag: 'GEAR',
    desc: 'Niche audiences who actually buy.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(43,219,164,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
  {
    name: 'Productivity & Setup',
    tag: 'SETUP',
    desc: 'The most loyal creator audiences online.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(43,219,164,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    name: 'Creative Software',
    tag: 'CREATIVE',
    desc: 'Tutorials that convert better than ads.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(43,219,164,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
  },
  {
    name: 'Subscription Platforms',
    tag: 'SUBS',
    desc: 'Retention starts before the signup.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(43,219,164,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 4v6h-6" />
        <path d="M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
  },
]

export default function NichesSection() {
  return (
    <section style={{ backgroundColor: VOID, padding: '120px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
        <motion.p
          className="font-italic"
          style={{ fontSize: 13, color: 'rgba(43,219,164,0.55)', marginBottom: 16 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vp}
          transition={{ duration: 0.6, ease }}
        >
          Where we operate
        </motion.p>
        <motion.h2
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(40px,6vw,72px)',
            letterSpacing: '-0.02em',
            color: CREAM,
            lineHeight: 1.05,
            marginBottom: 56,
          }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          THE NICHES WE OWN.
        </motion.h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}
        >
          {niches.map((n, i) => (
            <motion.div
              key={n.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5, delay: 0.07 * i, ease }}
              style={{
                backgroundColor: INK,
                border: `1px solid ${INK}`,
                borderRadius: 8,
                padding: '32px 28px',
                cursor: 'default',
                transition: 'border-color 0.25s, transform 0.25s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(43,219,164,0.2)'
                e.currentTarget.style.transform = 'translateY(-5px)'
                const line = e.currentTarget.querySelector('[data-accent]') as HTMLElement
                if (line) line.style.width = '40px'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = INK
                e.currentTarget.style.transform = 'translateY(0)'
                const line = e.currentTarget.querySelector('[data-accent]') as HTMLElement
                if (line) line.style.width = '0px'
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {n.icon}
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 9,
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: 'rgba(43,219,164,0.5)',
                  }}
                >
                  {n.tag}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 900,
                  fontSize: 18,
                  letterSpacing: '-0.01em',
                  color: CREAM,
                  marginTop: 20,
                }}
              >
                {n.name}
              </h3>

              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: 'rgba(240,235,216,0.4)',
                  lineHeight: 1.65,
                  marginTop: 8,
                }}
              >
                {n.desc}
              </p>

              {/* Hover accent line */}
              <div
                data-accent
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 2,
                  width: 0,
                  backgroundColor: TEAL,
                  transition: 'width 0.3s',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
