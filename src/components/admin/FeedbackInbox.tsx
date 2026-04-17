import { useFeedback, type FeedbackItem } from '../../hooks/useFeedback'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
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

export default function FeedbackInbox() {
  // null = fetch ALL feedback (AuraX sees everything)
  const { items, loading, updateStatus } = useFeedback(null)

  const handleCycle = async (item: FeedbackItem) => {
    const next: FeedbackItem['status'] =
      item.status === 'new' ? 'reviewed' : item.status === 'reviewed' ? 'resolved' : 'new'
    await updateStatus(item.id, next)
  }

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
                  <span style={{ fontSize: 11, color: 'rgba(240,235,216,0.35)' }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                {/* Row 2: section + page */}
                <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.45)', marginBottom: 6 }}>
                  <span style={{ color: TEAL, fontWeight: 600 }}>{item.section_label}</span>
                  <span> · {item.page_url}</span>
                </div>
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
