interface IconProps {
  size?: number
  className?: string
}

const iconStyle = (size: number) => ({
  width: size,
  height: size,
  strokeWidth: 1.5,
  stroke: '#2BDBA4',
  fill: 'none',
})

export function ChipIcon({ size = 26, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={iconStyle(size)}>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <line x1="9" y1="1" x2="9" y2="5" />
      <line x1="15" y1="1" x2="15" y2="5" />
      <line x1="9" y1="19" x2="9" y2="23" />
      <line x1="15" y1="19" x2="15" y2="23" />
      <line x1="1" y1="9" x2="5" y2="9" />
      <line x1="1" y1="15" x2="5" y2="15" />
      <line x1="19" y1="9" x2="23" y2="9" />
      <line x1="19" y1="15" x2="23" y2="15" />
    </svg>
  )
}

export function BrowserIcon({ size = 26, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={iconStyle(size)}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <circle cx="6" cy="6" r="1" fill="#2BDBA4" />
      <circle cx="9.5" cy="6" r="1" fill="#2BDBA4" />
    </svg>
  )
}

export function CameraIcon({ size = 26, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={iconStyle(size)}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

export function MonitorIcon({ size = 26, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={iconStyle(size)}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

export function PenToolIcon({ size = 26, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={iconStyle(size)}>
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  )
}

export function CycleIcon({ size = 26, className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={iconStyle(size)}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
    </svg>
  )
}
