import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import LogoMark from '../ui/LogoMark'

const TEAL = '#2BDBA4'
const VOID = '#080808'

export default function CurtainLoader() {
  const hasRun = useRef(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'exit' | 'done'>(() =>
    typeof window !== 'undefined' && sessionStorage.getItem('jwu_init') ? 'done' : 'loading',
  )

  useEffect(() => {
    // StrictMode guard — only run once
    // NOTE: no cancelAnimationFrame in cleanup — cancelling kills the rAF before
    // it fires on the first frame, then hasRun=true blocks the remount restart
    if (hasRun.current) return
    hasRun.current = true

    // Session guard — already played this session, skip immediately
    if (sessionStorage.getItem('jwu_init')) {
      setPhase('done')
      return
    }

    let start: number
    const duration = 750 // fast: 750ms fill

    const tick = (now: number) => {
      if (!start) start = now
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))

      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setPhase('exit')
          sessionStorage.setItem('jwu_init', '1')
          setTimeout(() => setPhase('done'), 520)
        }, 120)
      }
    }

    requestAnimationFrame(tick)
    // No cleanup cancel — letting the rAF run naturally prevents StrictMode freeze
  }, [])

  if (phase === 'done') return null

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: VOID,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        overflow: 'hidden',
      }}
      animate={phase === 'exit' ? { y: '-100%' } : { y: 0 }}
      transition={
        phase === 'exit'
          ? { duration: 0.6, ease: [0.76, 0, 0.24, 1] }
          : { duration: 0 }
      }
    >
      {/* Edge vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Horizontal scan line — pure CSS, no animation dependency */}
      <div
        style={{
          position: 'absolute',
          top: `${progress}%`,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${TEAL}18, transparent)`,
          pointerEvents: 'none',
          transition: 'top 0.04s linear',
        }}
      />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo + name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginBottom: 40,
          }}
        >
          <LogoMark size={24} />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              color: 'rgba(240,235,216,0.75)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            Just Why Us
          </span>
        </div>

        {/* Progress track */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 160,
            height: 1,
            backgroundColor: 'rgba(43,219,164,0.08)',
            position: 'relative',
          }}
        >
          {/* Fill bar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              backgroundColor: TEAL,
              transition: 'width 0.04s linear',
            }}
          />

          {/* Glowing tip */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${progress}%`,
              transform: 'translate(-50%, -50%)',
              width: 3,
              height: 6,
              borderRadius: 2,
              backgroundColor: TEAL,
              boxShadow: `0 0 6px ${TEAL}, 0 0 14px ${TEAL}80`,
              transition: 'left 0.04s linear',
              opacity: progress > 0 && progress < 100 ? 1 : 0,
            }}
          />
        </motion.div>

        {/* Counter */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          style={{
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 9,
            color: 'rgba(43,219,164,0.28)',
            letterSpacing: '0.35em',
            marginTop: 14,
          }}
        >
          {String(progress).padStart(3, '0')}
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
