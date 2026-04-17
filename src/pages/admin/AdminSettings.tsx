import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { supabase, signOut } from '../../lib/supabase'
import TwoFactorSetup from '../../components/admin/TwoFactorSetup'
import LogoMark from '../../components/ui/LogoMark'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

export default function AdminSettings() {
  useDocumentHead({ title: 'Settings — JUST WHY US Admin', noIndex: true })
  const navigate = useNavigate()
  const { profile, mfaEnforced, refresh } = useAdminAuth()
  const [enrolling, setEnrolling] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleDisable2FA = async () => {
    if (!disableCode) return
    setError(null)
    setDisabling(true)

    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totp = (factors?.totp ?? []).find((f) => f.status === 'verified')
    if (!totp) {
      setDisabling(false)
      setError('No 2FA factor found.')
      return
    }

    // Verify current code before allowing disable
    const ch = await supabase.auth.mfa.challenge({ factorId: totp.id })
    if (ch.error || !ch.data) {
      setDisabling(false)
      setError(ch.error?.message ?? 'Challenge failed')
      return
    }
    const vr = await supabase.auth.mfa.verify({
      factorId: totp.id,
      challengeId: ch.data.id,
      code: disableCode.trim(),
    })
    if (vr.error) {
      setDisabling(false)
      setError('Invalid code.')
      return
    }

    const un = await supabase.auth.mfa.unenroll({ factorId: totp.id })
    if (un.error) {
      setDisabling(false)
      setError(un.error.message)
      return
    }

    if (profile) {
      await supabase
        .from('admins')
        .update({ mfa_enabled: false })
        .ilike('email', profile.email)
    }

    setDisabling(false)
    setDisableCode('')
    setSuccess('Two-factor authentication disabled.')
    await refresh()
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        backgroundColor: VOID,
        color: CREAM,
        padding: '40px 24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: 680,
          margin: '0 auto 32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <LogoMark size={24} />
          <span
            className="font-brand"
            style={{ fontSize: 14, color: TEAL, letterSpacing: '0.2em' }}
          >
            SETTINGS
          </span>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            background: 'none',
            border: `1px solid ${CREAM}20`,
            borderRadius: 4,
            padding: '8px 14px',
            color: CREAM,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Account Security
        </h1>
        <p style={{ color: 'rgba(240,235,216,0.5)', fontSize: 14, marginBottom: 32 }}>
          Signed in as <span style={{ color: CREAM }}>{profile?.email}</span>
        </p>

        {/* 2FA section */}
        <section
          style={{
            backgroundColor: INK,
            border: '1px solid rgba(43,219,164,0.12)',
            borderRadius: 8,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Two-Factor Authentication</div>
              <div style={{ fontSize: 13, color: 'rgba(240,235,216,0.5)', marginTop: 4 }}>
                Protect your account with a code from an authenticator app.
              </div>
            </div>
            <div
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                backgroundColor: profile?.mfa_enabled
                  ? 'rgba(43,219,164,0.12)'
                  : 'rgba(255,92,56,0.12)',
                color: profile?.mfa_enabled ? TEAL : CORAL,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              {profile?.mfa_enabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          {mfaEnforced && !profile?.mfa_enabled && (
            <div
              style={{
                marginBottom: 14,
                fontSize: 12,
                color: '#FFB199',
                padding: 10,
                borderRadius: 4,
                backgroundColor: 'rgba(255,92,56,0.08)',
                border: '1px solid rgba(255,92,56,0.2)',
              }}
            >
              Your admin requires 2FA. You must enable it to keep access.
            </div>
          )}

          {error && <div style={{ color: CORAL, fontSize: 13, marginBottom: 10 }}>{error}</div>}
          {success && <div style={{ color: TEAL, fontSize: 13, marginBottom: 10 }}>{success}</div>}

          {!profile?.mfa_enabled && !enrolling && (
            <button
              onClick={() => setEnrolling(true)}
              style={{
                backgroundColor: TEAL,
                color: VOID,
                border: 'none',
                borderRadius: 4,
                padding: '10px 20px',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Enable 2FA
            </button>
          )}

          {enrolling && profile && (
            <div style={{ marginTop: 10 }}>
              <TwoFactorSetup
                adminEmail={profile.email}
                onComplete={async () => {
                  setEnrolling(false)
                  setSuccess('Two-factor authentication enabled.')
                  await refresh()
                }}
                onCancel={() => setEnrolling(false)}
              />
            </div>
          )}

          {profile?.mfa_enabled && !enrolling && (
            <div>
              {mfaEnforced && (
                <div
                  style={{
                    marginBottom: 12,
                    fontSize: 12,
                    color: 'rgba(240,235,216,0.5)',
                    fontStyle: 'italic',
                  }}
                >
                  2FA is required by your admin — you cannot disable it.
                </div>
              )}
              {!mfaEnforced && (
                <>
                  <label
                    style={{
                      fontSize: 12,
                      color: 'rgba(240,235,216,0.5)',
                      display: 'block',
                      marginBottom: 6,
                    }}
                  >
                    Enter your current 2FA code to disable
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={disableCode}
                      onChange={(e) =>
                        setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="000000"
                      style={{
                        flex: 1,
                        backgroundColor: VOID,
                        border: `1px solid ${INK}`,
                        borderRadius: 4,
                        padding: '10px 14px',
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 16,
                        letterSpacing: '0.3em',
                        color: CREAM,
                        textAlign: 'center',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={handleDisable2FA}
                      disabled={disabling || disableCode.length !== 6}
                      style={{
                        backgroundColor: CORAL,
                        color: CREAM,
                        border: 'none',
                        borderRadius: 4,
                        padding: '10px 20px',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        cursor: disabling ? 'wait' : 'pointer',
                        opacity: disabling || disableCode.length !== 6 ? 0.5 : 1,
                      }}
                    >
                      {disabling ? '...' : 'Disable'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        <section
          style={{
            backgroundColor: INK,
            border: '1px solid rgba(43,219,164,0.12)',
            borderRadius: 8,
            padding: 24,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Sign Out</div>
          <div style={{ fontSize: 13, color: 'rgba(240,235,216,0.5)', marginBottom: 16 }}>
            End your current admin session.
          </div>
          <button
            onClick={async () => {
              await signOut()
              navigate('/admin')
            }}
            style={{
              background: 'none',
              border: `1px solid ${CORAL}60`,
              borderRadius: 4,
              padding: '10px 20px',
              color: CORAL,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </section>
      </div>
    </main>
  )
}
