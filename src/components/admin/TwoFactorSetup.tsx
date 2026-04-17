import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

interface Props {
  adminEmail: string
  onComplete?: () => void
  onCancel?: () => void
}

/**
 * TOTP 2FA enrollment flow using Supabase Auth MFA.
 * Displays a QR code + secret, then verifies a 6-digit code to activate.
 */
export default function TwoFactorSetup({ adminEmail, onComplete, onCancel }: Props) {
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrSvg, setQrSvg] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const enroll = async () => {
      setError(null)
      setLoading(true)

      // Clean up stale unverified factors so re-entry works.
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const unverified = (factors?.totp ?? []).filter((f) => f.status !== 'verified')
      for (const f of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }

      const { data, error: err } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'JUST WHY US',
        friendlyName: `JWU · ${adminEmail}`,
      })

      if (cancelled) return

      if (err || !data) {
        setError(err?.message ?? 'Failed to start 2FA enrollment')
        setLoading(false)
        return
      }

      setFactorId(data.id)
      setQrSvg(data.totp.qr_code)
      setSecret(data.totp.secret)
      setLoading(false)
    }

    enroll()
    return () => {
      cancelled = true
    }
  }, [adminEmail])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId) return
    setError(null)
    setVerifying(true)

    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error || !challenge.data) {
      setVerifying(false)
      setError(challenge.error?.message ?? 'Could not start challenge')
      return
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: code.trim(),
    })

    if (verify.error) {
      setVerifying(false)
      setError('Invalid code. Try again.')
      return
    }

    // Mark mfa_enabled = true on our admins row (best-effort; RLS allows self-update? we use upsert via rpc-less path)
    await supabase
      .from('admins')
      .update({ mfa_enabled: true })
      .ilike('email', adminEmail)

    setVerifying(false)
    onComplete?.()
  }

  return (
    <div
      style={{
        backgroundColor: INK,
        border: '1px solid rgba(43,219,164,0.12)',
        borderRadius: 8,
        padding: 28,
        maxWidth: 460,
        fontFamily: 'Inter, sans-serif',
        color: CREAM,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: TEAL,
          marginBottom: 6,
        }}
      >
        Two-Factor Authentication
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18 }}>
        Scan the QR code with your Authenticator app
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'rgba(240,235,216,0.5)' }}>
          Generating secure key…
        </div>
      )}

      {!loading && qrSvg && (
        <>
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 16,
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 16,
            }}
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />

          {secret && (
            <div style={{ marginBottom: 18, fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>
              Can't scan? Enter this code manually:
              <div
                style={{
                  marginTop: 6,
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: 13,
                  color: CREAM,
                  wordBreak: 'break-all',
                  padding: 10,
                  backgroundColor: VOID,
                  borderRadius: 4,
                }}
              >
                {secret}
              </div>
            </div>
          )}

          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 12, color: 'rgba(240,235,216,0.5)' }}>
              Enter the 6-digit code from your app
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              pattern="[0-9]{6}"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              style={{
                backgroundColor: VOID,
                border: `1px solid ${INK}`,
                borderRadius: 4,
                padding: '12px 16px',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 20,
                letterSpacing: '0.4em',
                color: CREAM,
                textAlign: 'center',
                outline: 'none',
              }}
            />

            {error && <div style={{ fontSize: 12, color: CORAL }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: `1px solid ${CREAM}30`,
                    borderRadius: 4,
                    padding: '12px 16px',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: CREAM,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                style={{
                  flex: 2,
                  background: TEAL,
                  border: 'none',
                  borderRadius: 4,
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: VOID,
                  cursor: verifying ? 'wait' : 'pointer',
                  opacity: verifying || code.length !== 6 ? 0.5 : 1,
                }}
              >
                {verifying ? 'Verifying…' : 'Verify & Enable'}
              </button>
            </div>
          </form>
        </>
      )}

      {!loading && !qrSvg && error && (
        <div style={{ color: CORAL, fontSize: 13 }}>{error}</div>
      )}
    </div>
  )
}
