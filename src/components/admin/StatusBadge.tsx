const styles: Record<string, { bg: string; color: string; border: string }> = {
  pending: {
    bg: 'rgba(240,235,216,0.08)',
    color: 'rgba(240,235,216,0.5)',
    border: 'rgba(240,235,216,0.15)',
  },
  approved: {
    bg: 'rgba(43,219,164,0.1)',
    color: '#2BDBA4',
    border: 'rgba(43,219,164,0.3)',
  },
  rejected: {
    bg: 'rgba(255,92,56,0.1)',
    color: '#FF5C38',
    border: 'rgba(255,92,56,0.3)',
  },
}

export default function StatusBadge({ status }: { status: string }) {
  const s = styles[status] || styles.pending

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        padding: '3px 10px',
        borderRadius: 999,
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}
