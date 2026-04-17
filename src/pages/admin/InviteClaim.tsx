import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase, signIn } from '../../lib/supabase'
import { useDocumentHead } from '../../hooks/useDocumentHead'
import { scorePassword } from '../../lib/passwordStrength'
import TwoFactorSetup from '../../components/admin/TwoFactorSetup'
import LogoMark from '../../components/ui/LogoMark'
import { ADMIN_DASHBOARD } from '../../config/security'
import { markSessionStart } from '../../hooks/useSessionExpiry'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

type Step =
  | 'loading'
  | 'invalid'
  | 'greeting_link'      // link mode: greet + email input
  | 'otp_sent'           // link mode: OTP entry
  | 'password'           // both: set password
  | 'mfa_prompt'
  | 'mfa_setup'

interface InviteData {
  id: string
  email: string | null
  display_name: string
  role: 'admin' | 'super_admin'
  delivery: 'link' | 'email'
  expires_at: string
  used_at: string | null
}

export default function InviteClaim() {
  useDocumentHead({ title: 'Accept Invite — JUST WHY US', noIndex: true })
  const { token } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const preverified = searchParams.get('preverified') === '1'
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('loading')
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [invalidReason, setInvalidReason] = useState<string>('')

  const [emailInput, setEmailInput] = useState('')
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 1. Load invite
  useEffect(() => {
    if (!token) {
      setStep('invalid')
      setInvalidReason('No invite token provided.')
      return
    }

    ;(async () => {
      const { data, error: err } = await supabase
        .from('admin_invites')
        .select('id, email, display_name, role, delivery, expires_at, used_at')
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

      const inv = data as InviteData
      setInvite(inv)

      // Email-delivery + preverified (user clicked the email link) → skip OTP
      if (inv.delivery === 'email' && inv.email && preverified) {
        setVerifiedEmail(inv.email)
        setStep('password')
        return
      }

      // Email-delivery without preverified (someone pasted the URL) — still require
      // our OTP for safety. Fall through to link-style flow using invite.email as
      // the default value.
      if (inv.email) setEmailInput(inv.email)
      setStep('greeting_link')
    })()
  }, [token, preverified])

  // ── LINK MODE: submit email + send OTP ──────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!invite || !token) return

    const email = emailInput.trim().toLowerCase()
    if (!email) {
      setError('Email is required.')
      return
    }
    // If invite has a fixed email, it must match
    if (invite.email && email !== invite.email.toLowerCase()) {
      setError('This invite is for a different email address.')
      return
    }

    setBusy(true)
    const { data, error: err } = await supabase.functions.invoke(
      'send-invite-otp',
      { body: { token, email, name: invite.display_name } },
    )
    setBusy(false)

    if (err || !data?.ok) {
      setError(
        data?.error === 'rate_limited'
          ? 'Too many codes requested. Try again in an hour.'
          : `Could not send code: ${data?.error ?? err?.message ?? 'unknown'}`,
      )
      return
    }
    setStep('otp_sent')
  }

  // ── LINK MODE: verify OTP ───────────────────────────────────
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!invite || !token) return

    const email = emailInput.trim().toLowerCase()
    setBusy(true)

    const { data, error: err } = await supabase.rpc('verify_invite_otp', {
      p_token: token,
      p_email: email,
      p_code: otp.trim(),
    })
    setBusy(false)

    if (err) {
      setError(`Verification failed: ${err.message}`)
      return
    }
    const res = data as { ok?: boolean; error?: string }
    if (!res?.ok) {
      setError(
        res?.error === 'otp_invalid'
          ? 'Invalid or expired code. Try again.'
          : `Verification failed: ${res?.error ?? 'unknown'}`,
      )
      return
    }

    setVerifiedEmail(email)
    setStep('password')
  }

  // ── BOTH MODES: set password + finalize ─────────────────────
  const strength = scorePassword(password)
  const passwordsMatch = password.length > 0 && password === confirmPw
  const canSubmitPw = strength.ok && passwordsMatch

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!canSubmitPw || !token || !verifiedEmail) return

    setBusy(true)
    // Create the auth user + mark invite used via Edge Function (service role)
    const { data, error: err } = await supabase.functions.invoke('claim-invite', {
      body: { token, email: verifiedEmail, password },
    })

    if (err || !data?.ok) {
      setBusy(false)
      setError(
        `Could not create account: ${data?.error ?? err?.message ?? 'unknown'}`,
      )
      return
    }

    // Sign the user in
    const { error: signInErr } = await signIn(verifiedEmail, password)
    setBusy(false)

    if (signInErr) {
      setError(
        `Account created, but sign-in failed: ${signInErr.message}. Please go to login.`,
      )
      return
    }

    markSessionStart()
    setStep('mfa_prompt')
  }

  const handleSkipMfa = () => navigate(ADMIN_DASHBOARD, { replace: true })
  const handleMfaDone = () => navigate(ADMIN_DASHBOARD, { replace: true })

  // ─── STYLES ─────────────────────────────────────────────────
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

  // ─── RENDER ─────────────────────────────────────────────────
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

  if (step === 'greeting_link' && invite) {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            Hello <span style={{ color: TEAL }}>{invite.display_name}</span>,
          </h1>
          <p style={{ color: 'rgba(240,235,216,0.65)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            You've been invited as{' '}
            <strong style={{ color: CREAM }}>
              {invite.role === 'super_admin' ? 'Super Admin' : 'Admin'}
            </strong>
            . Enter your email and we'll send a 6-digit verification code to confirm it's really you.
          </p>
          <form onSubmit={handleEmailSubmit}>
            <label style={{ fontSize: 11, color: 'rgba(240,235,216,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Your email
            </label>
            <input
              type="email"
              required
              autoFocus
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@company.com"
              style={{ ...inputStyle, marginTop: 6 }}
              readOnly={!!invite.email}
            />
            {error && <div style={{ color: CORAL, fontSize: 12, marginTop: 8 }}>{error}</div>}
            <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.5 : 1 }}>
              {busy ? 'Sending…' : 'Send Verification Code'}
            </button>
          </form>
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              color: 'rgba(240,235,216,0.4)',
              textAlign: 'center',
            }}
          >
            Code sent from invitation@justwhyus.com · valid 5 minutes
          </div>
        </div>
      </main>
    )
  }

  if (step === 'otp_sent' && invite) {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            Check your email
          </h1>
          <p style={{ color: 'rgba(240,235,216,0.55)', fontSize: 13, marginBottom: 20 }}>
            We sent a 6-digit code to <strong style={{ color: CREAM }}>{emailInput}</strong>.
          </p>
          <form onSubmit={handleOtpSubmit}>
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
            {error && <div style={{ color: CORAL, fontSize: 12, marginTop: 8 }}>{error}</div>}
            <button
              type="submit"
              disabled={busy || otp.length !== 6}
              style={{ ...primaryBtn, opacity: busy || otp.length !== 6 ? 0.5 : 1 }}
            >
              {busy ? 'Verifying…' : 'Verify'}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setStep('greeting_link')}
            disabled={busy}
            style={{
              marginTop: 12,
              background: 'none',
              border: 'none',
              color: 'rgba(240,235,216,0.5)',
              fontSize: 12,
              cursor: 'pointer',
              textDecoration: 'underline',
              width: '100%',
            }}
          >
            Wrong email? Go back
          </button>
        </div>
      </main>
    )
  }

  if (step === 'password' && invite && verifiedEmail) {
    return (
      <main style={container}>
        {header}
        <div style={card}>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            Hello <span style={{ color: TEAL }}>{invite.display_name}</span>,
          </h1>
          <p style={{ color: 'rgba(240,235,216,0.55)', fontSize: 13, marginBottom: 20 }}>
            Create a strong password for <strong style={{ color: CREAM }}>{verifiedEmail}</strong>.{' '}
            <strong style={{ color: '#FFB199' }}>Do NOT reuse a password from another site.</strong>
          </p>

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(240,235,216,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                New password
              </label>
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
                    Strength:{' '}
                    <span style={{ color: strength.ok ? TEAL : CORAL }}>{strength.label}</span>
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
              <label style={{ fontSize: 11, color: 'rgba(240,235,216,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Confirm password
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                style={{ ...inputStyle, marginTop: 6 }}
              />
              {confirmPw && !passwordsMatch && (
                <div style={{ color: CORAL, fontSize: 11, marginTop: 4 }}>
                  Passwords don't match
                </div>
              )}
            </div>

            {error && <div style={{ color: CORAL, fontSize: 12 }}>{error}</div>}

            <button
              type="submit"
              disabled={!canSubmitPw || busy}
              style={{ ...primaryBtn, opacity: !canSubmitPw || busy ? 0.5 : 1 }}
            >
              {busy ? 'Creating account…' : 'Create Account'}
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
            Takes about 30 seconds with any authenticator app (Google Authenticator, 1Password, Authy).
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

  if (step === 'mfa_setup' && verifiedEmail) {
    return (
      <main style={container}>
        {header}
        <TwoFactorSetup
          adminEmail={verifiedEmail}
          onComplete={handleMfaDone}
          onCancel={() => setStep('mfa_prompt')}
        />
      </main>
    )
  }

  return null
}
