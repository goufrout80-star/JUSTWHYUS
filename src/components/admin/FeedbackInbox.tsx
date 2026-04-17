import { useState } from 'react'
import { useFeedback, type FeedbackItem } from '../../hooks/useFeedback'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

const statusColors: Record<string, string> = {
  new: TEAL,
  reviewed: '#FFB23C',
  resolved: 'rgba(240,235,216,0.35)',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

type ExportRange = '30m' | '1h' | '6h' | '1d' | '7d' | 'all'

const RANGES: { label: string; value: ExportRange }[] = [
  { label: '30 min', value: '30m' },
  { label: '1 hour', value: '1h' },
  { label: '6 hours', value: '6h' },
  { label: '1 day', value: '1d' },
  { label: '7 days', value: '7d' },
  { label: 'All', value: 'all' },
]

function rangeToMs(r: ExportRange): number {
  switch (r) {
    case '30m': return 30 * 60_000
    case '1h': return 60 * 60_000
    case '6h': return 6 * 60 * 60_000
    case '1d': return 24 * 60 * 60_000
    case '7d': return 7 * 24 * 60 * 60_000
    case 'all': return Infinity
  }
}

function downloadJSON(items: FeedbackItem[], range: ExportRange) {
  const cutoff = range === 'all' ? 0 : Date.now() - rangeToMs(range)
  const filtered = items.filter((i) => new Date(i.created_at).getTime() >= cutoff)
  const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `feedback-export-${range}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function FeedbackInbox() {
  const { items, loading, updateStatus } = useFeedback(null)
  const [exportOpen, setExportOpen] = useState(false)

  const handleCycle = async (item: FeedbackItem) => {
    const next: FeedbackItem['status'] =
      item.status === 'new' ? 'reviewed' : item.status === 'reviewed' ? 'resolved' : 'new'
    await updateStatus(item.id, next)
  }

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, color: CREAM }}>
            Feedback Inbox
          </span>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 11,
            color: TEAL, backgroundColor: 'rgba(43,219,164,0.1)',
            padding: '2px 10px', borderRadius: 999,
          }}>
            {items.filter((i) => i.status === 'new').length} new
          </span>
        </div>
        {/* Export dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setExportOpen(!exportOpen)}
            style={{
              background: 'none', border: `1px solid ${CREAM}20`, borderRadius: 4,
              padding: '6px 14px', color: CREAM, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          {exportOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 6,
              backgroundColor: INK, border: `1px solid ${TEAL}30`, borderRadius: 8,
              padding: 6, minWidth: 140, zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              <div style={{ padding: '6px 10px', fontSize: 10, color: 'rgba(240,235,216,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                Download last
              </div>
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => { downloadJSON(items, r.value); setExportOpen(false) }}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    background: 'none', border: 'none', padding: '8px 10px',
                    color: CREAM, fontSize: 12, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', borderRadius: 4,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${TEAL}15` }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{
        backgroundColor: INK, borderRadius: 8, border: '1px solid #0D1A14', overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,235,216,0.3)', fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'rgba(240,235,216,0.3)', fontSize: 14, fontFamily: 'Inter, sans-serif' }}>
            No feedback received yet.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(8,8,8,0.6)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {/* Row 1: meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: CREAM }}>
                      {item.user_name}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(240,235,216,0.4)' }}>
                      {item.user_email}
                    </span>
                    <button
                      onClick={() => handleCycle(item)}
                      title="Click to cycle status"
                      style={{
                        padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        backgroundColor: `${statusColors[item.status] ?? TEAL}18`,
                        color: statusColors[item.status] ?? TEAL,
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      {item.status}
                    </button>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(240,235,216,0.35)', whiteSpace: 'nowrap' }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                {/* Row 2: element info */}
                <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.45)', marginBottom: 6 }}>
                  <span style={{ color: TEAL, fontWeight: 600 }}>{item.section_label}</span>
                  <span> · {item.page_url}</span>
                </div>
                {item.element_selector && (
                  <div style={{
                    fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(240,235,216,0.35)',
                    backgroundColor: VOID, padding: '6px 10px', borderRadius: 4, marginBottom: 6,
                    wordBreak: 'break-all',
                  }}>
                    {item.element_id && <span style={{ color: TEAL }}>#{item.element_id} </span>}
                    <span>{item.element_selector}</span>
                    {item.element_tag && <span style={{ color: 'rgba(240,235,216,0.25)' }}> ({item.element_tag})</span>}
                  </div>
                )}
                {/* Row 3: note */}
                <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(240,235,216,0.8)' }}>
                  {item.note}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
