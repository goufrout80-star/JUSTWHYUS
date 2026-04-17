import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { signIn, signOut, supabase } from '../../lib/supabase'
import LogoMark from '../../components/ui/LogoMark'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import TwoFactorChallenge from '../../components/admin/TwoFactorChallenge'
import { ADMIN_DASHBOARD } from '../../config/security'
import { LOCKOUT_KEYS } from '../../config/security'
import {
  checkLockout,
  recordFailedAttempt,
  clearLockout,
  formatLockoutMs,
  logSecurityEvent,
} from '../../lib/security'
import { markSessionStart, clearSessionMarks } from '../../hooks/useSessionExpiry'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#0a0a0a'
const INK = '#0D1A14'

export default function AdminLogin() {
  useDocumentHead({ title: 'Admin — JUST WHY US', noIndex: true })
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('Invalid credentials. Try again.')
  const [needs2FA, setNeeds2FA] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // - ?unauthorized=1  → force-signout + show message
  // - ?mfa=1           → jump to 2FA challenge
  // - ?expired=idle|absolute → show "Session expired" banner
  // - Already logged in as admin? → skip login, go to dashboard
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const expired = params.get('expired')
      if (expired) {
        clearSessionMarks()
        await signOut()
        if (!cancelled) {
          setError(true)
          setErrorMsg(
            expired === 'absolute'
              ? 'Your 4-hour session ended. Please sign in again.'
              : 'Signed out for inactivity. Please sign in again.',
          )
          setCheckingSession(false)
        }
        return
      }

      if (params.get('unauthorized')) {
        await signOut()
        if (!cancelled) {
          setError(true)
          setErrorMsg('Your account is not authorized for admin access.')
          setCheckingSession(false)
        }
        return
      }

      if (params.get('mfa')) {
        if (!cancelled) {
          setNeeds2FA(true)
          setCheckingSession(false)
        }
        return
      }

      // No special params — check if we're already authenticated as an admin
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (!session) {
        if (!cancelled) setCheckingSession(false)
        return
      }

      // Verify admin row exists
      const { data: adminRow } = await supabase
        .from('admins')
        .select('email')
        .ilike('email', session.user.email ?? '')
        .maybeSingle()

      if (!adminRow) {
        if (!cancelled) setCheckingSession(false)
        return
      }

      // Check MFA level — if aal2 required but only aal1, show challenge
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
        if (!cancelled) {
          setNeeds2FA(true)
          setCheckingSession(false)
        }
        return
      }

      // Already logged in + admin + MFA satisfied → go to dashboard
      if (!cancelled) {
        markSessionStart()
        navigate(ADMIN_DASHBOARD, { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)

    // Check lockout
    const lockMs = checkLockout(LOCKOUT_KEYS.LOGIN)
    if (lockMs > 0) {
      setErrorMsg(
        `Too many failed attempts. Try again in ${formatLockoutMs(lockMs)}.`,
      )
      setError(true)
      return
    }

    setLoading(true)

    const { error: err } = await signIn(email, password)

    if (err) {
      const attempt = recordFailedAttempt(LOCKOUT_KEYS.LOGIN)
      void logSecurityEvent({ event: 'login_fail', meta: { email } })
      setLoading(false)
      if (attempt.locked) {
        void logSecurityEvent({ event: 'login_lockout', meta: { email } })
        setErrorMsg(
          `Too many failed attempts. Locked out for ${formatLockoutMs(attempt.lockMsLeft)}.`,
        )
      } else {
        setErrorMsg(
          `Invalid credentials. ${attempt.remainingAttempts} attempt${attempt.remainingAttempts === 1 ? '' : 's'} remaining.`,
        )
      }
      setError(true)
      return
    }

    // Verify the signed-in user is actually in the admins table
    const { data: adminRow } = await supabase
      .from('admins')
      .select('email')
      .ilike('email', email)
      .maybeSingle()

    if (!adminRow) {
      void logSecurityEvent({ event: 'unauthorized_admin_access', meta: { email } })
      await signOut()
      setLoading(false)
      setErrorMsg('Your account is not authorized for admin access.')
      setError(true)
      return
    }

    // Success — clear any lockout counter
    clearLockout(LOCKOUT_KEYS.LOGIN)

    // Check if MFA challenge is needed
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.nextLevel === 'aal2' && aal.currentLevel === 'aal1') {
      setLoading(false)
      setNeeds2FA(true)
      return
    }

    markSessionStart()
    setLoading(false)
    navigate(ADMIN_DASHBOARD)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: VOID,
    border: `1px solid ${INK}`,
    borderRadius: 4,
    padding: '12px 16px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: 14,
    color: CREAM,
    outline: 'none',
    transition: 'border-color 250ms',
  }

  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: VOID,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: `2px solid ${CREAM}20`,
            borderTopColor: TEAL,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (needs2FA) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          backgroundColor: VOID,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <TwoFactorChallenge
          onSuccess={() => {
            markSessionStart()
            navigate(ADMIN_DASHBOARD)
          }}
          onCancel={async () => {
            await signOut()
            setNeeds2FA(false)
          }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: VOID,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 400,
          margin: '0 24px',
          backgroundColor: INK,
          border: '1px solid rgba(43,219,164,0.12)',
          borderRadius: 8,
          padding: '48px 40px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <LogoMark size={36} />
          </div>
          <span
            className="font-brand"
            style={{ fontSize: 16, color: CREAM, letterSpacing: '0.2em' }}
          >
            JUST WHY US
          </span>
          <p
            className="font-italic"
            style={{ fontSize: 12, color: 'rgba(240,235,216,0.35)', marginTop: 8 }}
          >
            Admin access only
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {/* Error */}
          {error && (
            <div
              style={{
                background: 'rgba(255,92,56,0.08)',
                borderLeft: `2px solid ${CORAL}`,
                padding: '10px 14px',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: 13,
                  color: CORAL,
                }}
              >
                {errorMsg}
              </span>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(240,235,216,0.5)',
                marginBottom: 6,
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
              required
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = TEAL)}
              onBlur={(e) => (e.currentTarget.style.borderColor = INK)}
            />
          </div>

          {/* Password */}
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'rgba(240,235,216,0.5)',
                marginBottom: 6,
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={(e) => (e.currentTarget.style.borderColor = TEAL)}
                onBlur={(e) => (e.currentTarget.style.borderColor = INK)}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={TEAL}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {showPw ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="font-brand"
            style={{
              fontSize: 16,
              letterSpacing: '0.12em',
              color: VOID,
              backgroundColor: TEAL,
              width: '100%',
              padding: 14,
              borderRadius: 3,
              border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'background 200ms',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#5EEDC4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = TEAL
            }}
          >
            {loading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={VOID}
                strokeWidth="2"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </form>
      </div>
    </div>
  )
}
