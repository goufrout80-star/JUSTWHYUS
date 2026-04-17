import { useState } from 'react'
import type { AdminRow, PendingInvite, AppSettingsRow } from '../../hooks/useAdminData'
import InviteModal from './InviteModal'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

interface Props {
  admins: AdminRow[]
  invites: PendingInvite[]
  settings: AppSettingsRow | null
  currentEmail: string
  isSuper: boolean
  onCreateInvite: (
    email: string | null,
    name: string,
    role: 'admin' | 'super_admin',
    delivery: 'link' | 'email',
  ) => Promise<{ data: PendingInvite | null; error: unknown }>
  onRevokeInvite: (id: string, email: string | null) => Promise<{ error: unknown }>
  onRegenerateInvite: (id: string) => Promise<{ data: PendingInvite | null; error: unknown }>
  onRemoveAdmin: (id: string, email: string) => Promise<{ error: unknown }>
  onSetAdminMfaRequired: (id: string, required: boolean) => Promise<{ error: unknown }>
  onSetGlobalMfaRequired: (required: boolean) => Promise<{ error: unknown }>
  onRefresh?: () => Promise<void> | void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function hoursUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'expired'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return `${h}h ${m}m left`
}

export default function TeamPanel({
  admins,
  invites,
  settings,
  currentEmail,
  isSuper,
  onCreateInvite,
  onRevokeInvite,
  onRegenerateInvite,
  onRemoveAdmin,
  onSetAdminMfaRequired,
  onSetGlobalMfaRequired,
  onRefresh,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const copyLink = (link: string, id?: string) => {
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(id ?? link)
      setTimeout(() => setCopiedId(null), 1800)
    })
  }

  return (
    <div style={{ padding: '0 32px 32px' }}>
      {/* Global 2FA toggle (super admin only) */}
      {isSuper && settings && (
        <div
          style={{
            backgroundColor: INK,
            border: '1px solid rgba(43,219,164,0.12)',
            borderRadius: 8,
            padding: 18,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13, color: CREAM }}>
              Require 2FA for all admins
            </div>
            <div style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)', marginTop: 4 }}>
              When on, every admin must enroll a TOTP authenticator before accessing the dashboard.
            </div>
          </div>
          <button
            onClick={() => onSetGlobalMfaRequired(!settings.require_2fa_global)}
            style={{
              background: settings.require_2fa_global ? TEAL : 'transparent',
              color: settings.require_2fa_global ? VOID : CREAM,
              border: `1px solid ${settings.require_2fa_global ? TEAL : CREAM + '30'}`,
              borderRadius: 999,
              padding: '6px 18px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {settings.require_2fa_global ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Invite button + refresh */}
      {isSuper && (
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setModalOpen(true)}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: VOID,
              backgroundColor: TEAL,
              border: 'none',
              borderRadius: 4,
              padding: '12px 22px',
              cursor: 'pointer',
            }}
          >
            + Invite Team Member
          </button>
          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              title="Refresh data"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: CREAM,
                background: 'transparent',
                border: `1px solid ${CREAM}30`,
                borderRadius: 4,
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              ⟳ Refresh
            </button>
          )}
        </div>
      )}

      <InviteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreateInvite={onCreateInvite}
      />

      {/* Pending invites */}
      {isSuper && invites.length > 0 && (
        <div
          style={{
            backgroundColor: INK,
            borderRadius: 8,
            border: '1px solid #0D1A14',
            marginBottom: 20,
            overflow: 'auto',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(240,235,216,0.5)',
              borderBottom: '1px solid #080808',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Pending Invites ({invites.length})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <tbody>
              {invites.map((inv) => {
                const expired = new Date(inv.expires_at).getTime() < Date.now()
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #0D1A14' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: CREAM }}>{inv.display_name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,235,216,0.5)' }}>
                        {inv.email ?? <em style={{ color: 'rgba(240,235,216,0.35)' }}>link only · email TBD</em>}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.2em',
                          color: inv.delivery === 'email' ? TEAL : 'rgba(240,235,216,0.4)',
                          marginTop: 2,
                        }}
                      >
                        {inv.delivery === 'email' ? '✉ EMAIL SENT' : '🔗 LINK'}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 999,
                          color: inv.role === 'super_admin' ? TEAL : 'rgba(240,235,216,0.8)',
                          backgroundColor:
                            inv.role === 'super_admin'
                              ? 'rgba(43,219,164,0.1)'
                              : 'rgba(240,235,216,0.05)',
                        }}
                      >
                        {inv.role === 'super_admin' ? 'Super' : 'Admin'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: expired ? CORAL : 'rgba(240,235,216,0.5)' }}>
                      {hoursUntil(inv.expires_at)}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => {
                          const suffix = inv.delivery === 'email' ? '?preverified=1' : ''
                          copyLink(`${origin}/invite/${inv.token}${suffix}`, inv.id)
                        }}
                        style={{
                          ...linkBtnStyle,
                          color: copiedId === inv.id ? TEAL : CREAM,
                        }}
                      >
                        {copiedId === inv.id ? '✓ Copied' : 'Copy link'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={async () => {
                          const { data } = await onRegenerateInvite(inv.id)
                          if (data) {
                            const suffix = data.delivery === 'email' ? '?preverified=1' : ''
                            copyLink(`${origin}/invite/${data.token}${suffix}`, data.id)
                          }
                        }}
                        style={{ ...linkBtnStyle, color: TEAL }}
                      >
                        {expired ? 'Renew' : 'Regen'}
                      </button>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => onRevokeInvite(inv.id, inv.email)}
                        style={{ ...linkBtnStyle, color: CORAL }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Team table */}
      <div
        style={{
          backgroundColor: INK,
          borderRadius: 8,
          border: '1px solid #0D1A14',
          overflow: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
          <thead>
            <tr style={{ backgroundColor: '#080808' }}>
              {['Name', 'Email', 'Role', '2FA', 'Required', 'Joined', 'Actions'].map((c) => (
                <th key={c} style={thStyle}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={7} style={emptyStyle}>No team members yet.</td>
              </tr>
            ) : (
              admins.map((a) => {
                const isSelf = a.email.toLowerCase() === currentEmail.toLowerCase()
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #0D1A14' }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: CREAM }}>{a.display_name}</span>
                      {isSelf && (
                        <span style={{ marginLeft: 8, fontSize: 10, color: TEAL, fontWeight: 700 }}>
                          (you)
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>{a.email}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: '0.2em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: 999,
                          color: a.role === 'super_admin' ? TEAL : 'rgba(240,235,216,0.8)',
                          backgroundColor:
                            a.role === 'super_admin'
                              ? 'rgba(43,219,164,0.1)'
                              : 'rgba(240,235,216,0.05)',
                        }}
                      >
                        {a.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: a.mfa_enabled ? TEAL : 'rgba(240,235,216,0.35)',
                        }}
                      >
                        {a.mfa_enabled ? '✓ On' : 'Off'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {isSuper && !isSelf ? (
                        <button
                          onClick={() => onSetAdminMfaRequired(a.id, !a.mfa_required)}
                          style={{
                            background: a.mfa_required ? TEAL : 'transparent',
                            color: a.mfa_required ? VOID : CREAM,
                            border: `1px solid ${a.mfa_required ? TEAL : CREAM + '30'}`,
                            borderRadius: 999,
                            padding: '3px 10px',
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {a.mfa_required ? 'Required' : 'Optional'}
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'rgba(240,235,216,0.35)' }}>
                          {a.mfa_required ? 'Required' : '—'}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'rgba(240,235,216,0.4)' }}>
                      {formatDate(a.created_at)}
                    </td>
                    <td style={{ ...tdStyle, position: 'relative' }}>
                      {isSuper && !isSelf ? (
                        confirmId === a.id ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setConfirmId(null)} style={cancelBtnStyle}>
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                await onRemoveAdmin(a.id, a.email)
                                setConfirmId(null)
                              }}
                              style={removeBtnStyle}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(a.id)} style={removeLinkStyle}>
                            Remove
                          </button>
                        )
                      ) : (
                        <span style={{ color: 'rgba(240,235,216,0.2)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  color: 'rgba(240,235,216,0.4)',
  padding: '12px 20px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontWeight: 400,
  fontSize: 13,
  color: 'rgba(240,235,216,0.75)',
  padding: '14px 20px',
  whiteSpace: 'nowrap',
}

const emptyStyle: React.CSSProperties = {
  padding: 60,
  textAlign: 'center',
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: 'rgba(240,235,216,0.3)',
}

const removeLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: CORAL,
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  padding: 0,
}

const linkBtnStyle: React.CSSProperties = {
  ...removeLinkStyle,
  color: CREAM,
}

const cancelBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(240,235,216,0.4)',
  fontSize: 12,
  fontWeight: 400,
  cursor: 'pointer',
  padding: '4px 8px',
  fontFamily: 'Inter, sans-serif',
}

const removeBtnStyle: React.CSSProperties = {
  ...cancelBtnStyle,
  color: CORAL,
  fontWeight: 700,
}
