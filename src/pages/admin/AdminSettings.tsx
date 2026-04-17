import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { supabase, signOut, signIn } from '../../lib/supabase'
import { scorePassword } from '../../lib/passwordStrength'
import TwoFactorSetup from '../../components/admin/TwoFactorSetup'
import { ADMIN_BASE, ADMIN_DASHBOARD } from '../../config/security'
import LogoMark from '../../components/ui/LogoMark'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

type PwVerifyMode = 'password' | 'email'

export default function AdminSettings() {
  useDocumentHead({ title: 'Settings — JUST WHY US Admin', noIndex: true })
  const navigate = useNavigate()
  const { profile, mfaEnforced, refresh } = useAdminAuth()
  const [enrolling, setEnrolling] = useState(false)
  const [disabling, setDisabling] = useState(false)
  const [disableCode, setDisableCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ── Password change state ──
  const [pwVerifyMode, setPwVerifyMode] = useState<PwVerifyMode>('password')
  const [currentPw, setCurrentPw] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [emailCodeSent, setEmailCodeSent] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState<string | null>(null)
  const [pwVerified, setPwVerified] = useState(false)

  const pwStrength = scorePassword(newPw)
  const pwMatch = newPw.length > 0 && newPw === confirmNewPw
  const canSubmitPw = pwStrength.ok && pwMatch && pwVerified

  const handleSendEmailCode = async () => {
    if (!profile?.email) return
    setPwBusy(true)
    setPwError(null)
    try {
      const resp = await supabase.functions.invoke('send-otp-email', {
        body: { email: profile.email, name: profile.display_name, purpose: 'password_change' },
      })
      console.log('[send-otp-email] response:', resp)
      if (resp.error) {
        const errorText = typeof resp.error === 'object' && 'message' in resp.error
          ? resp.error.message
          : String(resp.error)
        setPwError(`Error: ${errorText}`)
        return
      }
      if (!resp.data?.ok) {
        setPwError(resp.data?.error || 'Failed to send code.')
        return
      }
      setEmailCodeSent(true)
      setPwError('⚠️ If not received, check your spam folder')
    } catch (err) {
      console.error('[send-otp-email] catch:', err)
      setPwError(`Error: ${String(err)}`)
    } finally {
      setPwBusy(false)
    }
  }

  const handleVerifyOld = async () => {
    if (!profile?.email) return
    setPwBusy(true)
    setPwError(null)

    try {
      if (pwVerifyMode === 'password') {
        const { error: err } = await signIn(profile.email, currentPw)
        if (err) {
          setPwError('Current password is incorrect.')
          return
        }
        setPwVerified(true)
      } else {
        const resp = await supabase.functions.invoke('verify-otp', {
          body: { email: profile.email, code: emailCode.trim(), purpose: 'password_change' },
        })
        console.log('[verify-otp] response:', resp)
        if (resp.error) {
          const errorText = typeof resp.error === 'object' && 'message' in resp.error
            ? resp.error.message
            : String(resp.error)
          setPwError(`Error: ${errorText}`)
          return
        }
        if (!resp.data?.ok) {
          setPwError(resp.data?.error || 'Invalid or expired code.')
          return
        }
        setPwVerified(true)
      }
    } catch (err) {
      console.error('[verify-otp] catch:', err)
      setPwError(`Error: ${String(err)}`)
    } finally {
      setPwBusy(false)
    }
  }

  const handleChangePassword = async () => {
    if (!canSubmitPw) return
    setPwBusy(true)
    setPwError(null)
    const { error: err } = await supabase.auth.updateUser({ password: newPw })
    setPwBusy(false)
    if (err) {
      setPwError(err.message)
      return
    }
    setPwSuccess('Password changed successfully.')
    setCurrentPw('')
    setEmailCode('')
    setNewPw('')
    setConfirmNewPw('')
    setPwVerified(false)
    setEmailCodeSent(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate(ADMIN_BASE, { replace: true })
  }

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
          onClick={() => navigate(ADMIN_DASHBOARD)}
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

        {/* ── Change Password ── */}
        <section
          style={{
            backgroundColor: INK,
            border: '1px solid rgba(43,219,164,0.12)',
            borderRadius: 8,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Change Password</div>
          <div style={{ fontSize: 13, color: 'rgba(240,235,216,0.5)', marginBottom: 16 }}>
            Verify your identity first, then set a new password.
          </div>

          {pwSuccess && (
            <div style={{ color: TEAL, fontSize: 13, marginBottom: 12, padding: '8px 12px', borderRadius: 4, backgroundColor: 'rgba(43,219,164,0.08)' }}>
              {pwSuccess}
            </div>
          )}
          {pwError && (
            <div style={{ color: CORAL, fontSize: 13, marginBottom: 12 }}>{pwError}</div>
          )}

          {/* Step 1: Verify identity */}
          {!pwVerified && (
            <div>
              {/* Mode toggle */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: VOID, padding: 3, borderRadius: 5 }}>
                <button
                  onClick={() => { setPwVerifyMode('password'); setPwError(null) }}
                  style={{
                    flex: 1, padding: '8px 10px', border: 'none', borderRadius: 3,
                    background: pwVerifyMode === 'password' ? INK : 'transparent',
                    color: pwVerifyMode === 'password' ? TEAL : 'rgba(240,235,216,0.45)',
                    fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Current Password
                </button>
                <button
                  onClick={() => { setPwVerifyMode('email'); setPwError(null) }}
                  style={{
                    flex: 1, padding: '8px 10px', border: 'none', borderRadius: 3,
                    background: pwVerifyMode === 'email' ? INK : 'transparent',
                    color: pwVerifyMode === 'email' ? TEAL : 'rgba(240,235,216,0.45)',
                    fontWeight: 700, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  Email Code
                </button>
              </div>

              {pwVerifyMode === 'password' ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    style={{
                      flex: 1, backgroundColor: VOID, border: `1px solid ${INK}`, borderRadius: 4,
                      padding: '10px 14px', fontSize: 14, color: CREAM, outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button
                    onClick={handleVerifyOld}
                    disabled={pwBusy || !currentPw}
                    style={{
                      backgroundColor: TEAL, color: VOID, border: 'none', borderRadius: 4,
                      padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                      textTransform: 'uppercase' as const, cursor: pwBusy ? 'wait' : 'pointer',
                      opacity: pwBusy || !currentPw ? 0.5 : 1,
                    }}
                  >
                    {pwBusy ? '...' : 'Verify'}
                  </button>
                </div>
              ) : (
                <div>
                  {!emailCodeSent ? (
                    <button
                      onClick={handleSendEmailCode}
                      disabled={pwBusy}
                      style={{
                        backgroundColor: TEAL, color: VOID, border: 'none', borderRadius: 4,
                        padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                        textTransform: 'uppercase' as const, cursor: pwBusy ? 'wait' : 'pointer',
                        opacity: pwBusy ? 0.5 : 1,
                      }}
                    >
                      {pwBusy ? 'Sending...' : `Send Code to ${profile?.email}`}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        style={{
                          flex: 1, backgroundColor: VOID, border: `1px solid ${INK}`, borderRadius: 4,
                          padding: '10px 14px', fontFamily: 'ui-monospace, monospace', fontSize: 16,
                          letterSpacing: '0.3em', color: CREAM, textAlign: 'center', outline: 'none',
                        }}
                      />
                      <button
                        onClick={handleVerifyOld}
                        disabled={pwBusy || emailCode.length !== 6}
                        style={{
                          backgroundColor: TEAL, color: VOID, border: 'none', borderRadius: 4,
                          padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
                          textTransform: 'uppercase' as const, cursor: pwBusy ? 'wait' : 'pointer',
                          opacity: pwBusy || emailCode.length !== 6 ? 0.5 : 1,
                        }}
                      >
                        {pwBusy ? '...' : 'Verify'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: New password (only after verification) */}
          {pwVerified && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: TEAL, fontSize: 12, fontWeight: 700, letterSpacing: '0.15em' }}>
                ✓ IDENTITY VERIFIED
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(240,235,216,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
                  New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: VOID, border: `1px solid ${INK}`, borderRadius: 4,
                    padding: '10px 14px', fontSize: 14, color: CREAM, outline: 'none',
                    fontFamily: 'Inter, sans-serif', marginTop: 6, boxSizing: 'border-box',
                  }}
                />
                {newPw && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 4, backgroundColor: VOID, borderRadius: 2, overflow: 'hidden', display: 'flex', gap: 2 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} style={{
                          flex: 1,
                          backgroundColor: i < pwStrength.score
                            ? pwStrength.score <= 1 ? CORAL : pwStrength.score <= 2 ? '#FFB23C' : TEAL
                            : 'rgba(240,235,216,0.08)',
                          transition: 'background 200ms',
                        }} />
                      ))}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(240,235,216,0.55)' }}>
                      <span style={{ color: pwStrength.ok ? TEAL : CORAL }}>{pwStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'rgba(240,235,216,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPw}
                  onChange={(e) => setConfirmNewPw(e.target.value)}
                  style={{
                    width: '100%', backgroundColor: VOID, border: `1px solid ${INK}`, borderRadius: 4,
                    padding: '10px 14px', fontSize: 14, color: CREAM, outline: 'none',
                    fontFamily: 'Inter, sans-serif', marginTop: 6, boxSizing: 'border-box',
                  }}
                />
                {confirmNewPw && !pwMatch && (
                  <div style={{ color: CORAL, fontSize: 11, marginTop: 4 }}>Passwords don't match</div>
                )}
              </div>
              <button
                onClick={handleChangePassword}
                disabled={!canSubmitPw || pwBusy}
                style={{
                  backgroundColor: TEAL, color: VOID, border: 'none', borderRadius: 4,
                  padding: '12px 20px', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em',
                  textTransform: 'uppercase' as const, cursor: !canSubmitPw || pwBusy ? 'wait' : 'pointer',
                  opacity: !canSubmitPw || pwBusy ? 0.5 : 1, marginTop: 4,
                }}
              >
                {pwBusy ? 'Changing...' : 'Change Password'}
              </button>
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
            onClick={handleSignOut}
            style={{
              background: `${CORAL}12`,
              border: `1px solid ${CORAL}40`,
              borderRadius: 4,
              padding: '12px 24px',
              color: CORAL,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 200ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = CORAL
              e.currentTarget.style.color = CREAM
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${CORAL}12`
              e.currentTarget.style.color = CORAL
            }}
          >
            Sign Out
          </button>
        </section>
      </div>
    </main>
  )
}
