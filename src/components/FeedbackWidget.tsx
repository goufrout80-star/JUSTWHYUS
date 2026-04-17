import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TEAL = '#2BDBA4'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'
const CORAL = '#FF5C38'

interface Props {
  userEmail: string
  userName: string
}

const SECTIONS = [
  'Hero / Header',
  'Navigation',
  'Brands Section',
  'Creators Section',
  'Footer',
  'Select Page',
  'Admin Dashboard',
  'Settings Page',
  'Other',
]

export default function FeedbackWidget({ userEmail, userName }: Props) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!section || !note.trim()) {
      setError('Please select a section and write a note.')
      return
    }
    setError(null)
    setBusy(true)
    const { error: err } = await supabase.from('feedback').insert({
      user_email: userEmail,
      user_name: userName,
      page_url: pathname,
      section_label: section,
      note: note.trim(),
    })
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setOpen(false)
      setSection('')
      setNote('')
    }, 2500)
  }

  // Success view
  if (success) {
    return (
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
        width: 340, backgroundColor: INK, border: `1px solid ${TEAL}40`,
        borderRadius: 12, padding: 28, color: CREAM,
        fontFamily: 'Inter, sans-serif', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEAL, marginBottom: 6 }}>
          Feedback sent to AuraX
        </div>
        <div style={{ fontSize: 13, color: 'rgba(240,235,216,0.6)' }}>
          Thank you! Your feedback helps us improve.
        </div>
      </div>
    )
  }

  // Floating button
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Send Feedback"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 99999,
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: TEAL,
          color: VOID,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(43,219,164,0.35)',
          transition: 'transform 200ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={VOID} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    )
  }

  // Modal
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      width: 360, maxHeight: 'calc(100dvh - 48px)',
      backgroundColor: INK, border: `1px solid ${TEAL}30`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: 'Inter, sans-serif', color: CREAM,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${TEAL}20`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}>
            SEND FEEDBACK
          </div>
          <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.45)', marginTop: 2 }}>
            Page: {pathname}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: 'none', border: 'none', color: 'rgba(240,235,216,0.5)',
            fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: 20, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Section selector */}
        <div>
          <div style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(240,235,216,0.45)', marginBottom: 6, fontWeight: 700,
          }}>
            What section is this about?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SECTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  border: section === s ? `1px solid ${TEAL}` : '1px solid rgba(240,235,216,0.15)',
                  backgroundColor: section === s ? 'rgba(43,219,164,0.12)' : 'transparent',
                  color: section === s ? TEAL : 'rgba(240,235,216,0.6)',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <div style={{
            fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'rgba(240,235,216,0.45)', marginBottom: 6, fontWeight: 700,
          }}>
            Your feedback
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What should we add, change, or fix?"
            rows={4}
            style={{
              width: '100%', backgroundColor: VOID, border: `1px solid ${INK}`,
              borderRadius: 4, padding: '10px 12px', fontSize: 13,
              color: CREAM, outline: 'none', resize: 'vertical',
              fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
            }}
          />
        </div>

        {error && <div style={{ color: CORAL, fontSize: 12 }}>{error}</div>}

        <button
          onClick={handleSend}
          disabled={busy}
          style={{
            backgroundColor: TEAL, color: VOID, border: 'none', borderRadius: 4,
            padding: '12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          {busy ? 'Sending...' : 'Send Feedback'}
        </button>
      </div>
    </div>
  )
}
