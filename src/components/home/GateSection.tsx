import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const VOID = '#080808'
const INK = '#0D1A14'

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]
const vp = { once: true, amount: 0.3 }
const TARGET = 847

function useCountUp(target: number, duration: number) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  const start = useCallback(() => {
    if (started.current) return
    started.current = true
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) start() },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [start])

  return { count, ref }
}

export default function GateSection() {
  const { count, ref } = useCountUp(TARGET, 2000)
  const navigate = useNavigate()

  return (
    <section
      style={{
        backgroundColor: INK,
        padding: '160px 0',
        textAlign: 'center',
      }}
    >
      {/* Counter */}
      <div ref={ref}>
        <motion.p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(96px,16vw,180px)',
            color: TEAL,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={vp}
          transition={{ duration: 0.6, ease }}
        >
          {count}
        </motion.p>
      </div>

      <motion.p
        className="font-italic"
        style={{ fontSize: 14, color: 'rgba(240,235,216,0.3)', marginTop: 8, lineHeight: 1.7 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={vp}
        transition={{ duration: 0.6, delay: 0.15, ease }}
      >
        campaigns executed. brands never<br />touched a creator.
      </motion.p>

      {/* Divider */}
      <div
        style={{
          width: 48,
          height: 1,
          backgroundColor: 'rgba(43,219,164,0.15)',
          margin: '40px auto',
        }}
      />

      {/* Pull quote */}
      <motion.p
        className="font-italic"
        style={{
          fontSize: 'clamp(18px,2.5vw,28px)',
          color: 'rgba(240,235,216,0.6)',
          lineHeight: 1.7,
          maxWidth: 500,
          margin: '0 auto',
        }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.6, delay: 0.2, ease }}
      >
        You don&rsquo;t hire us to find creators. You hire us because you never want to think about them again.
      </motion.p>

      <motion.p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 9,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          color: 'rgba(240,235,216,0.18)',
          marginTop: 20,
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={vp}
        transition={{ duration: 0.6, delay: 0.3, ease }}
      >
        &mdash; THE JUST WHY US SYSTEM
      </motion.p>

      {/* CTA */}
      <motion.div
        style={{ marginTop: 48 }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.6, delay: 0.35, ease }}
      >
        <button
          onClick={() => navigate('/select')}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: '0.08em',
            backgroundColor: CORAL,
            color: VOID,
            padding: '18px 64px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e54d2e'; e.currentTarget.style.transform = 'scale(1.03)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = CORAL; e.currentTarget.style.transform = 'scale(1)' }}
        >
          QUALIFY NOW
        </button>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 9,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(240,235,216,0.16)',
            marginTop: 14,
          }}
        >
          NOT EVERYONE IS ACCEPTED.<br />THAT&rsquo;S BY DESIGN.
        </p>
      </motion.div>
    </section>
  )
}
