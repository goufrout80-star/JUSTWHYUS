import { motion } from 'framer-motion'

interface Props {
  position: 'tl' | 'tr' | 'bl' | 'br'
  size?: number
}

export default function CornerOrnament({ position, size = 40 }: Props) {
  const rotation = {
    tl: 0,
    tr: 90,
    bl: 270,
    br: 180,
  }[position]

  const positionStyles: Record<string, React.CSSProperties> = {
    tl: { top: 20, left: 20 },
    tr: { top: 20, right: 20 },
    bl: { bottom: 20, left: 20 },
    br: { bottom: 20, right: 20 },
  }

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 20,
        ...positionStyles[position],
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <path
          d="M 2 38 L 2 2 L 38 2"
          stroke="#2BDBA4"
          strokeWidth={1}
          opacity={0.32}
          fill="none"
        />
        <circle cx={2} cy={2} r={2.5} fill="#2BDBA4" opacity={0.32} />
        <motion.circle
          cx={2}
          cy={2}
          r={2.5}
          fill="#2BDBA4"
          initial={{ scale: 1, opacity: 0.32 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}
