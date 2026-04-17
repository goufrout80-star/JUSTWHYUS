import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { scorePassword } from '../../lib/passwordStrength'
import TwoFactorSetup from '../../components/admin/TwoFactorSetup'
import LogoMark from '../../components/ui/LogoMark'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

type Step = 'loading' | 'invalid' | 'email' | 'verify' | 'password' | 'mfa_prompt' | 'mfa_setup' | 'done'

interface InviteData {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'super_admin'
  expires_at: string
  used_at: string | null
}

export default function InviteClaim() {
  useDocumentHead({ title: 'Accept Invite — JUST WHY US', noIndex: true })
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('loading')
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [invalidReason, setInvalidReason] = useState<string>('')

  const [emailInput, setEmailInput] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Load invite by token
  useEffect(() => {
    if (!token) {
      setStep('invalid')
      setInvalidReason('No invite token provided.')
      return
    }

    const load = async () => {
      const { data, error: err } = await supabase
        .from('admin_invites')
        .select('id, email, display_name, role, expires_at, used_at')
        .eq('token', token)
        .maybeSingle()

      if (err || !data) {
        setStep('invalid')
        setInvalidReason('This invite link is not valid.')
        return
      }

      if (data.used_at) {
        setStep('invalid')
        setInvalidReason('This invite has already been used.')
        return
      }

      if (new Date(data.expires_at).getTime() < Date.now()) {
        setStep('invalid')
        setInvalidReason('This invite has expired. Ask your admin for a new link.')
        return
      }

      setInvite(data as InviteData)
      setStep('email')
    }

    load()
  }, [token])

  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!invite) return
    if (emailInput.trim().toLowerCase() !== invite.email.toLowerCase()) {
      setError('This invite is for a different email address.')
      return
    }
    setStep('verify')
    sendOtp()
  }

  const sendOtp = async () => {
    if (!invite) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: invite.email,
      options: { shouldCreateUser: true },
    })
    setBusy(false)
    if (err) setError(err.message)
  }

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite) return
    setBusy(true)
    setError(null)

    const { error: err } = await supabase.auth.verifyOtp({
      email: invite.email,
      token: otp.trim(),
      type: 'email',
    })

    setBusy(false)

    if (err) {
      setError('Invalid or expired code. Try again.')
      return
    }

    setStep('password')
  }

  const strength = scorePassword(password)
  const passwordsMatch = password && password === confirmPw
  const canSubmitPw = strength.ok && passwordsMatch

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invite || !canSubmitPw) return
    setBusy(true)
    setError(null)

    // 1. Set the password on the now-authenticated user
    const upd = await supabase.auth.updateUser({ password })
    if (upd.error) {
      setBusy(false)
      setError(upd.error.message)
      return
    }

    // 2. Consume the invite atomically (creates admins row + marks used)
    const claim = await supabase.rpc('claim_invite', { p_token: token })
    if (claim.error) {
      setBusy(false)
      setError(claim.error.message)
      return
    }
    const result = claim.data as { ok?: boolean; error?: string }
    if (!result?.ok) {
      setBusy(false)
      setError(`Could not claim invite: ${result?.error ?? 'unknown'}`)
      return
    }

    setBusy(false)
    setStep('mfa_prompt')
  }

  const handleSkipMfa = () => navigate('/admin/dashboard')
  const handleMfaDone = () => navigate('/admin/dashboard')

  // ----- RENDER HELPERS -----

  const container: React.CSSProperties = {
    minHeight: '100dvh',
    backgroundColor: VOID,
    color: CREAM,
    padding: '40px 24px',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }

  const card: React.CSSProperties = {
    backgroundColor: INK,
    border: '1px solid rgba(43,219,164,0.12)',
    borderRadius: 8,
    padding: 28,
    width: '100%',
    maxWidth: 460,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: VOID,
    border: `1px solid ${INK}`,
    borderRadius: 4,
    padding: '12px 14px',
    fontFamily: 'Inter, sans-serif',
    fontSize: 14,
    color: CREAM,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const primaryBtn: React.CSSProperties = {
    width: '100%',
    backgroundColor: TEAL,
    color: VOID,
    border: 'none',
    borderRadius: 4,
    padding: '12px',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: 8,
  }

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
      <LogoMark size={28} />
      <span className="font-brand" style={{ fontSize: 14, color: TEAL, letterSpacing: '0.2em' }}>
        ADMIN · INVITE
      </span>
    </div>
  )

  // ----- STATES -----

  if (step === 'loading') {
    return (
      <main style={container}>
        {header}
        <div style={{ color: 'rgba(240,235,216,0.5)' }}>Checking your invite…</div>
      </main>
    )
  }

  if (step === 'invalid') {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: CORAL, marginBottom: 8 }}>
            Invite not valid
          </div>
          <p style={{ color: 'rgba(240,235,216,0.6)', fontSize: 13, lineHeight: 1.6 }}>
            {invalidReason}
          </p>
          <button onClick={() => navigate('/')} style={{ ...primaryBtn, marginTop: 20 }}>
            Go Home
          </button>
        </div>
      </main>
    )
  }

  if (step === 'email' && invite) {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            You've been invited as <span style={{ color: TEAL }}>{invite.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
          </h1>
          <p style={{ color: 'rgba(240,235,216,0.55)', fontSize: 13, marginBottom: 20 }}>
            Confirm your email to continue. This invite link is single-use and expires in 6 hours.
          </p>
          <form onSubmit={handleEmail}>
            <label style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>Email</label>
            <input
              type="email"
              required
              autoFocus
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              style={{ ...inputStyle, marginTop: 6 }}
            />
            {error && (
              <div style={{ color: CORAL, fontSize: 12, marginTop: 8 }}>{error}</div>
            )}
            <button type="submit" style={primaryBtn}>Continue</button>
          </form>
        </div>
      </main>
    )
  }

  if (step === 'verify' && invite) {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Verify your email</h1>
          <p style={{ color: 'rgba(240,235,216,0.55)', fontSize: 13, marginBottom: 20 }}>
            We sent a 6-digit code to <span style={{ color: CREAM }}>{invite.email}</span>.
            Check your inbox.
          </p>
          <form onSubmit={handleOtp}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={{
                ...inputStyle,
                textAlign: 'center',
                fontFamily: 'ui-monospace, monospace',
                fontSize: 22,
                letterSpacing: '0.5em',
              }}
            />
            {error && (
              <div style={{ color: CORAL, fontSize: 12, marginTop: 8 }}>{error}</div>
            )}
            <button type="submit" disabled={busy || otp.length !== 6} style={{ ...primaryBtn, opacity: busy || otp.length !== 6 ? 0.5 : 1 }}>
              {busy ? 'Verifying…' : 'Verify'}
            </button>
          </form>
          <button
            type="button"
            onClick={sendOtp}
            disabled={busy}
            style={{
              marginTop: 12,
              background: 'none',
              border: 'none',
              color: 'rgba(240,235,216,0.5)',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Resend code
          </button>
        </div>
      </main>
    )
  }

  if (step === 'password') {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Create a password</h1>
          <p style={{ color: 'rgba(240,235,216,0.55)', fontSize: 13, marginBottom: 20 }}>
            Use a strong password.{' '}
            <strong style={{ color: '#FFB199' }}>
              Do NOT reuse a password from another site.
            </strong>{' '}
            Reusing passwords is the #1 cause of account takeovers.
          </p>

          <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>New password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, marginTop: 6 }}
              />
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div
                    style={{
                      height: 4,
                      backgroundColor: VOID,
                      borderRadius: 2,
                      overflow: 'hidden',
                      display: 'flex',
                      gap: 2,
                    }}
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          backgroundColor:
                            i < strength.score
                              ? strength.score <= 1
                                ? CORAL
                                : strength.score <= 2
                                  ? '#FFB23C'
                                  : TEAL
                              : 'rgba(240,235,216,0.08)',
                          transition: 'background 200ms',
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(240,235,216,0.55)' }}>
                    Strength: <span style={{ color: strength.ok ? TEAL : CORAL }}>{strength.label}</span>
                  </div>
                  {strength.issues.length > 0 && (
                    <ul style={{ marginTop: 6, paddingLeft: 16, color: '#FFB199', fontSize: 11 }}>
                      {strength.issues.map((i) => (
                        <li key={i}>{i}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>Confirm password</label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                style={{ ...inputStyle, marginTop: 6 }}
              />
              {confirmPw && !passwordsMatch && (
                <div style={{ color: CORAL, fontSize: 11, marginTop: 4 }}>Passwords don't match</div>
              )}
            </div>

            {error && <div style={{ color: CORAL, fontSize: 12 }}>{error}</div>}

            <button
              type="submit"
              disabled={!canSubmitPw || busy}
              style={{ ...primaryBtn, opacity: !canSubmitPw || busy ? 0.5 : 1 }}
            >
              {busy ? 'Saving…' : 'Create Account'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (step === 'mfa_prompt') {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            Protect your account with 2FA
          </h1>
          <p style={{ color: 'rgba(240,235,216,0.55)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
            Super admins may require 2FA for dashboard access. Enabling now avoids
            being locked out later. It takes about 30 seconds with any authenticator app.
          </p>

          <button onClick={() => setStep('mfa_setup')} style={primaryBtn}>
            Enable 2FA Now
          </button>
          <button
            onClick={handleSkipMfa}
            style={{
              width: '100%',
              marginTop: 10,
              background: 'none',
              border: `1px solid ${CREAM}20`,
              borderRadius: 4,
              padding: '12px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: CREAM,
              cursor: 'pointer',
            }}
          >
            Skip for now
          </button>
          <div
            style={{
              marginTop: 12,
              fontSize: 11,
              color: 'rgba(240,235,216,0.4)',
              fontStyle: 'italic',
              textAlign: 'center',
            }}
          >
            You can enable 2FA later in Settings.
          </div>
        </div>
      </main>
    )
  }

  if (step === 'mfa_setup' && invite) {
    return (
      <main style={container}>
        {header}
        <TwoFactorSetup
          adminEmail={invite.email}
          onComplete={handleMfaDone}
          onCancel={() => setStep('mfa_prompt')}
        />
      </main>
    )
  }

  return null
}
