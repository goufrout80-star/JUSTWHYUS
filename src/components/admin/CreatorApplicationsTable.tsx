import { useState } from 'react'
import type { CreatorApplication } from '../../hooks/useAdminData'
import StatusBadge from './StatusBadge'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const INK = '#0D1A14'

const columns = [
  'Name',
  'Handle',
  'Platform',
  'Niche',
  'Audience',
  'Format',
  'Email',
  'Content',
  'Date',
  'Status',
  'Actions',
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface Props {
  data: CreatorApplication[]
  loading: boolean
  onUpdateStatus: (table: string, id: string, status: string, targetName?: string) => Promise<void>
  onDelete: (table: string, id: string, targetName?: string) => Promise<void>
}

export default function CreatorApplicationsTable({
  data,
  loading,
  onUpdateStatus,
  onDelete,
}: Props) {
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = data.filter((r) => {
    const q = search.toLowerCase()
    return (
      r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    )
  })

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: CREAM,
            }}
          >
            Creator Applications
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: 11,
              color: CORAL,
              backgroundColor: 'rgba(255,92,56,0.1)',
              padding: '2px 10px',
              borderRadius: 999,
            }}
          >
            {data.length}
          </span>
        </div>

        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            backgroundColor: INK,
            border: '1px solid #0D1A14',
            borderRadius: 4,
            padding: '8px 14px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 13,
            color: CREAM,
            outline: 'none',
            width: 260,
            transition: 'border-color 250ms',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = CORAL)}
          onBlur={(e) => (e.currentTarget.style.borderColor = INK)}
        />
      </div>

      {/* Table */}
      <div
        style={{
          backgroundColor: INK,
          borderRadius: 8,
          border: '1px solid #0D1A14',
          overflow: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
          <thead>
            <tr style={{ backgroundColor: '#080808' }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: 'rgba(240,235,216,0.4)',
                    padding: '12px 20px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [0, 1, 2].map((i) => (
                <tr key={i}>
                  <td colSpan={columns.length} style={{ padding: '14px 20px' }}>
                    <div
                      style={{
                        height: 16,
                        backgroundColor: 'rgba(240,235,216,0.04)',
                        borderRadius: 4,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: 60,
                    textAlign: 'center',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: 14,
                    color: 'rgba(240,235,216,0.3)',
                  }}
                >
                  No applications yet.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: '1px solid #0D1A14',
                    position: 'relative',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = 'rgba(255,92,56,0.03)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: CREAM }}>{r.name}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: CREAM }}>
                    {r.handle || '—'}
                  </td>
                  <td style={tdStyle}>{r.platform || '—'}</td>
                  <td style={tdStyle}>{r.niche || '—'}</td>
                  <td style={tdStyle}>{r.audience_size || '—'}</td>
                  <td style={tdStyle}>{r.content_format || '—'}</td>
                  <td style={tdStyle}>{r.email}</td>
                  <td style={tdStyle}>
                    {r.best_content_link ? (
                      <a
                        href={r.best_content_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: CORAL, textDecoration: 'none', fontSize: 13 }}
                      >
                        View
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ ...tdStyle, color: 'rgba(240,235,216,0.4)' }}>
                    {formatDate(r.created_at)}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={r.status} />
                    {r.reviewed_by && (
                      <div
                        style={{
                          fontSize: 10,
                          color: 'rgba(240,235,216,0.35)',
                          marginTop: 4,
                          fontStyle: 'italic',
                        }}
                        title={r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : ''}
                      >
                        by {r.reviewed_by.split(' (')[0]}
                      </div>
                    )}
                  </td>
                  <td style={{ ...tdStyle, position: 'relative' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn
                        color={TEAL}
                        hoverColor="#5EEDC4"
                        title="Approve"
                        onClick={() =>
                          onUpdateStatus('creator_applications', r.id, 'approved', r.name)
                        }
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </ActionBtn>
                      <ActionBtn
                        color={CORAL}
                        hoverColor="#FF7A5C"
                        title="Reject"
                        onClick={() =>
                          onUpdateStatus('creator_applications', r.id, 'rejected', r.name)
                        }
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </ActionBtn>
                      <ActionBtn
                        color="rgba(240,235,216,0.25)"
                        hoverColor={CORAL}
                        title="Delete"
                        onClick={() => setConfirmId(r.id)}
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </ActionBtn>
                    </div>

                    {confirmId === r.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: 20,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: 'rgba(8,8,8,0.95)',
                          border: '1px solid rgba(255,92,56,0.3)',
                          borderRadius: 4,
                          padding: '12px 16px',
                          zIndex: 20,
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: 13,
                            color: 'rgba(240,235,216,0.7)',
                          }}
                        >
                          Delete this record?
                        </span>
                        <button
                          onClick={() => setConfirmId(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: 13,
                            color: 'rgba(240,235,216,0.4)',
                            cursor: 'pointer',
                            padding: '4px 8px',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDelete('creator_applications', r.id, r.name)
                            setConfirmId(null)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 700,
                            fontSize: 13,
                            color: CORAL,
                            cursor: 'pointer',
                            padding: '4px 8px',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const tdStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 13,
  color: 'rgba(240,235,216,0.75)',
  padding: '14px 20px',
  whiteSpace: 'nowrap',
}

function ActionBtn({
  color,
  hoverColor,
  title,
  onClick,
  children,
}: {
  color: string
  hoverColor: string
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={(e) => {
        const svg = e.currentTarget.querySelector('svg')
        if (svg) svg.style.stroke = hoverColor
      }}
      onMouseLeave={(e) => {
        const svg = e.currentTarget.querySelector('svg')
        if (svg) svg.style.stroke = color
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'stroke 200ms' }}
      >
        {children}
      </svg>
    </button>
  )
}
