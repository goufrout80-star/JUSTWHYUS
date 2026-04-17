import { useState, useEffect, useCallback, useRef } from 'react'
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

interface SelectedElement {
  tag: string
  id: string
  selector: string
  text: string
  label: string
}

function buildSelector(el: HTMLElement): string {
  const parts: string[] = []
  let cur: HTMLElement | null = el
  while (cur && cur !== document.body) {
    let s = cur.tagName.toLowerCase()
    if (cur.id) { parts.unshift(`#${cur.id}`); break }
    const cls = Array.from(cur.classList).filter(c => !c.startsWith('feedback-')).slice(0, 2).join('.')
    if (cls) s += `.${cls}`
    parts.unshift(s)
    cur = cur.parentElement
  }
  return parts.join(' > ')
}

function buildLabel(el: HTMLElement): string {
  if (el.id) return `#${el.id}`
  const tag = el.tagName.toLowerCase()
  const cls = Array.from(el.classList).filter(c => !c.startsWith('feedback-')).slice(0, 1).join('')
  const text = (el.textContent || '').trim().slice(0, 30)
  if (cls) return `<${tag}.${cls}>${text ? ` "${text}…"` : ''}`
  if (text) return `<${tag}> "${text}…"`
  return `<${tag}>`
}

const WIDGET_ID = 'feedback-widget-root'

export default function FeedbackWidget({ userEmail, userName }: Props) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState<SelectedElement | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const hoverRef = useRef<HTMLElement | null>(null)

  // ── Click-to-select mode ──
  const handleMouseOver = useCallback((e: MouseEvent) => {
    const t = e.target as HTMLElement
    if (t.closest(`#${WIDGET_ID}`)) return
    if (hoverRef.current) hoverRef.current.style.outline = ''
    t.style.outline = `2px solid ${TEAL}`
    t.style.outlineOffset = '2px'
    hoverRef.current = t
  }, [])

  const handleMouseOut = useCallback(() => {
    if (hoverRef.current) {
      hoverRef.current.style.outline = ''
      hoverRef.current.style.outlineOffset = ''
      hoverRef.current = null
    }
  }, [])

  const handleClick = useCallback((e: MouseEvent) => {
    const t = e.target as HTMLElement
    if (t.closest(`#${WIDGET_ID}`)) return
    e.preventDefault()
    e.stopPropagation()
    handleMouseOut()
    setSelected({
      tag: t.tagName.toLowerCase(),
      id: t.id || '',
      selector: buildSelector(t),
      text: (t.textContent || '').trim().slice(0, 120),
      label: buildLabel(t),
    })
    setSelecting(false)
    setOpen(true)
  }, [handleMouseOut])

  useEffect(() => {
    if (selecting) {
      document.addEventListener('mouseover', handleMouseOver, true)
      document.addEventListener('mouseout', handleMouseOut, true)
      document.addEventListener('click', handleClick, true)
      document.body.style.cursor = 'crosshair'
    }
    return () => {
      document.removeEventListener('mouseover', handleMouseOver, true)
      document.removeEventListener('mouseout', handleMouseOut, true)
      document.removeEventListener('click', handleClick, true)
      document.body.style.cursor = ''
      handleMouseOut()
    }
  }, [selecting, handleMouseOver, handleMouseOut, handleClick])

  const startSelecting = () => {
    setOpen(false)
    setSelecting(true)
  }

  const handleSend = async () => {
    if (!selected) { setError('Please select a section first.'); return }
    if (!note.trim()) { setError('Please write a note.'); return }
    setError(null)
    setBusy(true)
    const { error: err } = await supabase.from('feedback').insert({
      user_email: userEmail,
      user_name: userName,
      page_url: pathname,
      section_label: selected.label,
      element_tag: selected.tag,
      element_id: selected.id || null,
      element_selector: selected.selector,
      element_text: selected.text || null,
      note: note.trim(),
    })
    setBusy(false)
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setOpen(false)
      setSelected(null)
      setNote('')
    }, 2500)
  }

  const reset = () => {
    setSelected(null)
    setNote('')
    setError(null)
  }

  // ── Selecting overlay hint ──
  if (selecting) {
    return (
      <div id={WIDGET_ID} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
        padding: '12px 0', textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          backgroundColor: INK, border: `1px solid ${TEAL}60`,
          borderRadius: 999, padding: '10px 24px', pointerEvents: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
          fontFamily: 'Inter, sans-serif', color: CREAM, fontSize: 13,
        }}>
          <span style={{ color: TEAL, fontWeight: 700 }}>⊕</span>
          Click any element to select it
          <button
            onClick={() => { setSelecting(false); setOpen(true) }}
            style={{
              background: 'none', border: `1px solid ${CREAM}30`, borderRadius: 4,
              color: CREAM, fontSize: 11, padding: '4px 12px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Success toast ──
  if (success) {
    return (
      <div id={WIDGET_ID} style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
        width: 320, backgroundColor: INK, border: `1px solid ${TEAL}40`,
        borderRadius: 12, padding: 28, color: CREAM,
        fontFamily: 'Inter, sans-serif', textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 8, color: TEAL }}>✓</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: TEAL, marginBottom: 6 }}>
          Feedback sent
        </div>
        <div style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>
          AuraX will review it shortly.
        </div>
      </div>
    )
  }

  // ── Floating button ──
  if (!open) {
    return (
      <button
        id={WIDGET_ID}
        onClick={() => setOpen(true)}
        title="Send Feedback"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
          width: 52, height: 52, borderRadius: '50%',
          backgroundColor: TEAL, color: VOID, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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

  // ── Modal ──
  return (
    <div id={WIDGET_ID} style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      width: 370, maxHeight: 'calc(100dvh - 48px)',
      backgroundColor: INK, border: `1px solid ${TEAL}30`,
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      fontFamily: 'Inter, sans-serif', color: CREAM,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', borderBottom: `1px solid ${TEAL}20`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}>FEEDBACK</div>
          <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.4)', marginTop: 2 }}>
            {pathname}
          </div>
        </div>
        <button
          onClick={() => { setOpen(false); reset() }}
          style={{ background: 'none', border: 'none', color: 'rgba(240,235,216,0.5)', fontSize: 20, cursor: 'pointer', padding: 4 }}
        >×</button>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Step 1: Select element */}
        {!selected ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.45)', marginBottom: 14, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
              Step 1 — Select a section
            </div>
            <button
              onClick={startSelecting}
              style={{
                backgroundColor: 'rgba(43,219,164,0.1)', color: TEAL,
                border: `1px dashed ${TEAL}60`, borderRadius: 8,
                padding: '18px 28px', fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', width: '100%',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(43,219,164,0.18)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(43,219,164,0.1)' }}
            >
              ⊕ Click to select element on page
            </button>
          </div>
        ) : (
          <>
            {/* Selected element info */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Selected element
                </div>
                <button
                  onClick={startSelecting}
                  style={{
                    background: 'none', border: `1px solid ${CREAM}20`, borderRadius: 4,
                    color: 'rgba(240,235,216,0.5)', fontSize: 10, padding: '3px 10px',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Re-select
                </button>
              </div>
              <div style={{
                backgroundColor: VOID, border: `1px solid ${TEAL}30`, borderRadius: 6,
                padding: '10px 14px', fontSize: 12,
              }}>
                <div style={{ color: TEAL, fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 4 }}>
                  {selected.label}
                </div>
                <div style={{ color: 'rgba(240,235,216,0.4)', fontSize: 10, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all' }}>
                  {selected.selector}
                </div>
                {selected.id && (
                  <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(240,235,216,0.35)' }}>
                    ID: <span style={{ color: CREAM }}>{selected.id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Note */}
            <div>
              <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.45)', marginBottom: 6, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
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
          </>
        )}
      </div>
    </div>
  )
}
