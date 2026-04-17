import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useFeedback } from '../hooks/useFeedback'
import { useDocumentHead } from '../hooks/useDocumentHead'
import LogoMark from '../components/ui/LogoMark'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

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

const statusColors: Record<string, string> = {
  new: TEAL,
  reviewed: '#FFB23C',
  resolved: 'rgba(240,235,216,0.35)',
}

export default function FeedbackPage() {
  useDocumentHead({ title: 'My Feedback — JUST WHY US', noIndex: true })
  const navigate = useNavigate()
  const { profile } = useAdminAuth()
  const { items, loading } = useFeedback(profile?.email ?? null)

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: VOID, color: CREAM, fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        backgroundColor: INK, height: 56, borderBottom: `1px solid ${INK}`,
        padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={24} />
          <span className="font-brand" style={{ fontSize: 14, color: TEAL, letterSpacing: '0.2em' }}>
            FEEDBACK
          </span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>
            {profile?.display_name}
          </span>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: `1px solid ${CREAM}20`, borderRadius: 4,
              padding: '6px 14px', color: CREAM, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Back to Site
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>My Feedback</h1>
        <p style={{ fontSize: 13, color: 'rgba(240,235,216,0.5)', marginBottom: 28 }}>
          All feedback you've submitted. You can send new feedback from any page using the
          <span style={{ color: TEAL }}> floating button</span> in the bottom-right corner.
        </p>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,235,216,0.3)' }}>
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div style={{
            padding: 60, textAlign: 'center', color: 'rgba(240,235,216,0.3)', fontSize: 14,
            backgroundColor: INK, borderRadius: 8, border: '1px solid rgba(43,219,164,0.1)',
          }}>
            No feedback yet. Use the floating button to send your first one!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: INK,
                  border: '1px solid rgba(43,219,164,0.1)',
                  borderRadius: 8,
                  padding: '18px 20px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      backgroundColor: `${statusColors[item.status] ?? TEAL}18`,
                      color: statusColors[item.status] ?? TEAL,
                    }}>
                      {item.status}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>
                      {item.section_label}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(240,235,216,0.35)' }}>
                    {timeAgo(item.created_at)}
                  </span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: CREAM }}>
                  {item.note}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(240,235,216,0.35)' }}>
                  Page: {item.page_url}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
