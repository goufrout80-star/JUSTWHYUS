import type { ActivityRow } from '../../hooks/useAdminData'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const INK = '#0D1A14'

interface Props {
  data: ActivityRow[]
  loading: boolean
  isSuper: boolean
}

// Tables that regular admins can see in the activity log
const ADMIN_VISIBLE_TABLES = new Set(['brand_requests', 'creator_applications'])

const actionMeta: Record<ActivityRow['action'], { color: string; verb: string }> = {
  approved: { color: TEAL, verb: 'approved' },
  rejected: { color: CORAL, verb: 'rejected' },
  deleted: { color: CORAL, verb: 'deleted' },
  invited: { color: TEAL, verb: 'invited' },
  removed: { color: CORAL, verb: 'removed' },
}

function tableLabel(t: string) {
  if (t === 'brand_requests') return 'brand'
  if (t === 'creator_applications') return 'creator'
  if (t === 'admins') return 'admin'
  return t
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

export default function ActivityPanel({ data, loading, isSuper }: Props) {
  // Regular admins only see brand/creator activity, super admins see everything
  const filtered = isSuper
    ? data
    : data.filter((r) => ADMIN_VISIBLE_TABLES.has(r.target_table))

  return (
    <div style={{ padding: '0 32px 32px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: CREAM,
          }}
        >
          Activity Log
        </span>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: 11,
            color: TEAL,
            backgroundColor: 'rgba(43,219,164,0.1)',
            padding: '2px 10px',
            borderRadius: 999,
          }}
        >
          {filtered.length}
        </span>
      </div>

      <div
        style={{
          backgroundColor: INK,
          borderRadius: 8,
          border: '1px solid #0D1A14',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'rgba(240,235,216,0.3)',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              padding: 60,
              textAlign: 'center',
              color: 'rgba(240,235,216,0.3)',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            No activity yet.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {filtered.map((row) => {
              const meta = actionMeta[row.action]
              return (
                <li
                  key={row.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(8,8,8,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    color: 'rgba(240,235,216,0.75)',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: meta.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, color: CREAM }}>{row.admin_name}</span>
                  <span>
                    <span style={{ color: meta.color, fontWeight: 700 }}>{meta.verb}</span>
                    {' '}
                    {tableLabel(row.target_table)}
                    {row.target_name ? (
                      <> — <span style={{ color: CREAM }}>{row.target_name}</span></>
                    ) : null}
                  </span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 11,
                      color: 'rgba(240,235,216,0.35)',
                    }}
                    title={new Date(row.created_at).toLocaleString()}
                  >
                    {timeAgo(row.created_at)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
