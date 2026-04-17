import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const TEAL = '#2BDBA4'
const CORAL = '#FF5C38'
const CREAM = '#F0EBD8'
const VOID = '#080808'
const INK = '#0D1A14'

interface Props {
  onSuccess: () => void
  onCancel?: () => void
}

/**
 * Shown after password login when the user has a verified TOTP factor
 * and their session is still aal1. Elevates to aal2 by verifying a 6-digit code.
 */
export default function TwoFactorChallenge({ onSuccess, onCancel }: Props) {
  const [factorId, setFactorId] = useState<string | null>(null)
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const start = async () => {
      const { data: factors, error: listErr } = await supabase.auth.mfa.listFactors()
      if (listErr) {
        setError(listErr.message)
        return
      }
      const totp = (factors?.totp ?? []).find((f) => f.status === 'verified')
      if (!totp) {
        setError('No 2FA factor found on this account.')
        return
      }
      setFactorId(totp.id)

      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      })
      if (chErr || !ch) {
        setError(chErr?.message ?? 'Could not start challenge')
        return
      }
      setChallengeId(ch.id)
    }
    start()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!factorId || !challengeId) return
    setError(null)
    setVerifying(true)

    const { error: err } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: code.trim(),
    })

    setVerifying(false)

    if (err) {
      setError('Invalid code. Try again.')
      setCode('')
      return
    }

    onSuccess()
  }

  return (
    <div
      style={{
        backgroundColor: INK,
        border: '1px solid rgba(43,219,164,0.12)',
        borderRadius: 8,
        padding: 28,
        maxWidth: 420,
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
        Two-Factor Required
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 14 }}>
        Enter the 6-digit code from your authenticator
      </div>
      <p style={{ fontSize: 13, color: 'rgba(240,235,216,0.5)', marginBottom: 20 }}>
        Open Google Authenticator, Authy, or 1Password and enter the current code
        for JUST WHY US.
      </p>

      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]{6}"
          autoFocus
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          style={{
            backgroundColor: VOID,
            border: `1px solid ${INK}`,
            borderRadius: 4,
            padding: '14px 16px',
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 22,
            letterSpacing: '0.5em',
            color: CREAM,
            textAlign: 'center',
            outline: 'none',
          }}
        />

        {error && <div style={{ fontSize: 12, color: CORAL }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
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
            disabled={verifying || code.length !== 6 || !challengeId}
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
            {verifying ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </form>
    </div>
  )
}
