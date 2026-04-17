import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { PendingInvite } from '../../hooks/useAdminData'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

type Mode = 'link' | 'email'
type Role = 'admin' | 'super_admin' | 'feedback_user'

interface Props {
  open: boolean
  onClose: () => void
  onCreateInvite: (
    email: string | null,
    name: string,
    role: Role,
    delivery: Mode,
  ) => Promise<{ data: PendingInvite | null; error: unknown }>
}

export default function InviteModal({ open, onClose, onCreateInvite }: Props) {
  const [mode, setMode] = useState<Mode>('link')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('admin')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultLink, setResultLink] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const reset = () => {
    setName('')
    setEmail('')
    setRole('admin')
    setResultLink(null)
    setEmailSent(false)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResultLink(null)
    setEmailSent(false)

    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (mode === 'email' && !email.trim()) {
      setError('Email is required for email invites.')
      return
    }

    setBusy(true)
    const { data, error: err } = await onCreateInvite(
      mode === 'email' ? email.trim().toLowerCase() : null,
      name.trim(),
      role,
      mode,
    )
    if (err || !data) {
      setBusy(false)
      setError('Failed to create invite. It may already exist for this email.')
      return
    }

    if (mode === 'link') {
      setResultLink(`${origin}/invite/${data.token}`)
      setBusy(false)
      return
    }

    // Email mode: call the Resend Edge Function
    try {
      const { data: session } = await supabase.auth.getSession()
      const invitedBy =
        session?.session?.user?.email ?? 'A JUST WHY US super admin'

      const { data: sendData, error: sendErr } = await supabase.functions.invoke(
        'send-invite-email',
        {
          body: {
            token: data.token,
            email: data.email,
            name: data.display_name,
            role: data.role,
            invitedBy,
          },
        },
      )
      setBusy(false)

      if (sendErr || !sendData?.ok) {
        setError(
          `Invite created but email failed to send: ${
            sendData?.error ?? sendErr?.message ?? 'unknown'
          }. You can copy the link below instead.`,
        )
        setResultLink(`${origin}/invite/${data.token}?preverified=1`)
        return
      }

      setEmailSent(true)
    } catch (err: unknown) {
      setBusy(false)
      const msg = err instanceof Error ? err.message : 'unknown'
      setError(
        `Invite created but email failed (${msg}). Copy the link below instead.`,
      )
      setResultLink(`${origin}/invite/${data.token}?preverified=1`)
    }
  }

  const copy = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: INK,
          border: '1px solid rgba(43,219,164,0.2)',
          borderRadius: 10,
          width: '100%',
          maxWidth: 540,
          padding: 32,
          color: CREAM,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.08em' }}>
            INVITE NEW ADMIN
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(240,235,216,0.5)',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Tab selector */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 20,
            background: VOID,
            padding: 4,
            borderRadius: 6,
          }}
        >
          <TabButton active={mode === 'link'} onClick={() => { setMode('link'); reset() }}>
            Generate Link
          </TabButton>
          <TabButton active={mode === 'email'} onClick={() => { setMode('email'); reset() }}>
            Send Email Invite
          </TabButton>
        </div>

        <div
          style={{
            fontSize: 12,
            color: 'rgba(240,235,216,0.5)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          {mode === 'link'
            ? 'Fastest. Generates a URL you can send manually. Recipient enters their email + verifies via code, then creates password.'
            : 'Recipient gets a branded email from invitation@justwhyus.com with a one-click button. Email is pre-verified — they skip straight to creating a password.'}
        </div>

        {!resultLink && !emailSent && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Name">
              <input
                type="text"
                required
                placeholder="e.g. Jordan Wolf"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </Field>

            {mode === 'email' && (
              <Field label="Email">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            )}

            <Field label="Role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                style={inputStyle}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
                <option value="feedback_user">Feedback User</option>
              </select>
            </Field>

            {error && (
              <div style={{ color: CORAL, fontSize: 12, marginTop: 4 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                marginTop: 8,
                padding: '14px 20px',
                background: TEAL,
                color: VOID,
                border: 'none',
                borderRadius: 4,
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: busy ? 'wait' : 'pointer',
                opacity: busy ? 0.6 : 1,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {busy
                ? mode === 'email' ? 'Sending email…' : 'Generating…'
                : mode === 'email' ? 'Send Email Invite' : 'Generate Link'}
            </button>
          </form>
        )}

        {resultLink && (
          <div>
            <div
              style={{
                marginBottom: 16,
                fontSize: 12,
                color: TEAL,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              ✓ Link Generated
            </div>
            {error && (
              <div style={{ fontSize: 12, color: CORAL, marginBottom: 12 }}>{error}</div>
            )}
            <div
              style={{
                background: VOID,
                border: `1px solid ${TEAL}40`,
                borderRadius: 6,
                padding: 12,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <code
                style={{
                  flex: 1,
                  padding: 8,
                  background: '#000',
                  borderRadius: 4,
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 12,
                  color: CREAM,
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {resultLink}
              </code>
              <button
                onClick={() => copy(resultLink)}
                style={{
                  padding: '8px 14px',
                  background: copied ? TEAL : 'transparent',
                  color: copied ? VOID : CREAM,
                  border: `1px solid ${copied ? TEAL : CREAM + '30'}`,
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div
              style={{
                marginTop: 14,
                fontSize: 11,
                color: 'rgba(240,235,216,0.5)',
                fontStyle: 'italic',
              }}
            >
              Single-use · valid for 6 hours
            </div>
            <button
              onClick={reset}
              style={{
                marginTop: 20,
                padding: '10px 18px',
                background: 'transparent',
                color: CREAM,
                border: `1px solid ${CREAM}30`,
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Create Another
            </button>
          </div>
        )}

        {emailSent && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                fontSize: 48,
                marginBottom: 12,
                color: TEAL,
              }}
            >
              ✉
            </div>
            <div
              style={{
                fontSize: 12,
                color: TEAL,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Email Sent
            </div>
            <div style={{ fontSize: 14, color: CREAM, marginBottom: 6 }}>
              Invite sent to <strong>{email}</strong>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>
              From: invitation@justwhyus.com · valid for 6 hours
            </div>
            <button
              onClick={reset}
              style={{
                marginTop: 24,
                padding: '10px 18px',
                background: 'transparent',
                color: CREAM,
                border: `1px solid ${CREAM}30`,
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Send Another
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: '10px 14px',
        background: active ? INK : 'transparent',
        color: active ? TEAL : 'rgba(240,235,216,0.5)',
        border: 'none',
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(240,235,216,0.45)',
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: VOID,
  border: `1px solid ${CREAM}20`,
  borderRadius: 4,
  padding: '12px 14px',
  color: CREAM,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}
