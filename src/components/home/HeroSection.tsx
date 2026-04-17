import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'

const ease: [number, number, number, number] = [0.76, 0, 0.24, 1]
const words = ['EXECUTE', 'CONTROL', 'DELIVER', 'OPERATE', 'CURATE', 'QUALIFY', 'BRIEF', 'SCALE', 'SELECT', 'DEPLOY']

const pipelines = [
  { name: 'AI Tool Launch', tag: 'AI', w: 85, status: 'Delivering', dot: true },
  { name: 'SaaS Rollout', tag: 'SAAS', w: 62, status: 'Briefing', dot: false },
  { name: 'Gear Campaign', tag: 'GEAR', w: 40, status: 'Selecting', dot: false },
]

export default function HeroSection() {
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      style={{
        height: '100dvh',
        backgroundColor: VOID,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dot grid bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />

      {/* LEFT — Word roller */}
      <div
        style={{
          width: '55%',
          paddingLeft: 'clamp(48px, 7vw, 110px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', height: 'clamp(80px, 12vw, 152px)' }}>
          <AnimatePresence mode="popLayout">
            {words.map((w, i) => {
              const offset = i - idx
              const isActive = offset === 0
              const visible = offset >= -1 && offset <= 2
              if (!visible) return null
              return (
                <motion.div
                  key={w + i}
                  initial={{ y: 80, opacity: 0 }}
                  animate={{
                    y: offset * (typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.12, 152) : 120),
                    opacity: 1,
                  }}
                  exit={{ y: -80, opacity: 0 }}
                  transition={{ duration: 0.5, ease }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(80px, 12vw, 152px)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.02em',
                    color: isActive ? CREAM : 'rgba(240,235,216,0.12)',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                  }}
                >
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        left: -16,
                        top: 0,
                        height: '100%',
                        width: 2,
                        backgroundColor: TEAL,
                      }}
                    />
                  )}
                  {w}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT — Mini dashboard + CTA */}
      <div
        style={{
          width: '45%',
          paddingRight: 'clamp(48px, 7vw, 110px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 24,
        }}
      >
        {/* Mini dashboard */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            background: '#0a0a0a',
            border: '1px solid rgba(43,219,164,0.1)',
            borderRadius: 8,
            padding: 16,
            maxWidth: 320,
          }}
        >
          {/* Top bar dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF5C38' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F5C842' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: TEAL }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: 'rgba(240,235,216,0.15)', marginLeft: 8 }}>app.justwhyus.com</span>
          </div>

          {/* Metric cards */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'ACTIVE', val: '12', c: TEAL },
              { label: 'PENDING', val: '4', c: CREAM },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(43,219,164,0.03)',
                  border: '1px solid rgba(43,219,164,0.07)',
                  borderRadius: 6,
                  padding: '8px 12px',
                }}
              >
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 8, letterSpacing: '0.3em', color: 'rgba(240,235,216,0.3)' }}>{m.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: 20, color: m.c, marginTop: 2 }}>{m.val}</p>
              </div>
            ))}
          </div>

          {/* Pipeline rows */}
          {pipelines.map((p) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(43,219,164,0.04)' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 10, color: 'rgba(240,235,216,0.55)', minWidth: 80 }}>{p.name}</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 8, color: TEAL, backgroundColor: 'rgba(43,219,164,0.08)', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.2em' }}>{p.tag}</span>
              <div style={{ flex: 1, height: 3, backgroundColor: 'rgba(43,219,164,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', backgroundColor: TEAL, borderRadius: 999 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.w}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 8, color: p.dot ? TEAL : 'rgba(240,235,216,0.3)', minWidth: 50, textAlign: 'right' }}>{p.status}</span>
            </div>
          ))}

          {/* Ticker */}
          <div
            style={{
              marginTop: 10,
              height: 22,
              overflow: 'hidden',
              borderTop: '1px solid rgba(43,219,164,0.06)',
              paddingTop: 6,
            }}
          >
            <motion.div
              animate={{ x: [0, -600] }}
              transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, color: 'rgba(43,219,164,0.35)', whiteSpace: 'nowrap' }}
            >
              CAMPAIGN ACTIVE — AI TOOLS &bull; BRIEF DISPATCHED — SAAS &bull; REPORT DELIVERED — GEAR &bull; SYSTEM OPERATIONAL &bull; CAMPAIGN ACTIVE — AI TOOLS &bull; BRIEF DISPATCHED — SAAS &bull;
            </motion.div>
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 14, color: 'rgba(240,235,216,0.5)', lineHeight: 1.7 }}>
            One operator. Every campaign.<br />Zero chaos.
          </p>

          <div style={{ width: 32, height: 1, backgroundColor: 'rgba(43,219,164,0.3)', margin: '20px 0' }} />

          <button
            onClick={() => navigate('/select')}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: '0.08em',
              backgroundColor: TEAL,
              color: VOID,
              padding: '14px 40px',
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5EEDC4'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = TEAL; e.currentTarget.style.transform = 'scale(1)' }}
          >
            GET STARTED &rarr;
          </button>

          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(240,235,216,0.16)', marginTop: 16 }}>
            NOT FOR EVERYONE. BY DESIGN.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
