import { useState, useEffect, useRef } from 'react'

interface Props {
  label: string
  value: number
}

export default function StatCard({ label, value }: Props) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || value === 0) {
      setDisplay(value)
      return
    }
    started.current = true
    const duration = 1200
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])

  return (
    <div
      style={{
        backgroundColor: '#0D1A14',
        border: '1px solid #0D1A14',
        borderRadius: 6,
        padding: '20px 24px',
        flex: 1,
        minWidth: 140,
      }}
    >
      <span
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(240,235,216,0.35)',
          display: 'block',
          marginBottom: 8,
        }}
      >
        {label}
      </span>
      <span
        className="font-brand"
        style={{ fontSize: 36, color: '#F0EBD8', lineHeight: 1 }}
      >
        {display}
      </span>
    </div>
  )
}
