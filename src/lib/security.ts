/**
 * Security primitives — attack logging, rate limiting, fingerprinting.
 */
import { supabase } from './supabase'
import { RATE_LIMITS, LOCKOUT_KEYS } from '../config/security'

export type SecurityEvent =
  | 'honeypot_hit'
  | 'login_fail'
  | 'login_lockout'
  | 'unauthorized_admin_access'
  | 'invite_invalid'
  | 'invite_email_mismatch'
  | 'invite_otp_fail'
  | 'suspicious_activity'

interface LogArgs {
  event: SecurityEvent
  path?: string
  meta?: Record<string, unknown>
}

/**
 * Generate a stable-ish fingerprint (best-effort; not cryptographic).
 * Combines user-agent + language + screen + timezone.
 */
export function browserFingerprint(): string {
  try {
    const s =
      navigator.userAgent +
      '|' +
      navigator.language +
      '|' +
      screen.width +
      'x' +
      screen.height +
      '|' +
      Intl.DateTimeFormat().resolvedOptions().timeZone
    let h = 0
    for (let i = 0; i < s.length; i++) {
      h = (h * 31 + s.charCodeAt(i)) | 0
    }
    return 'fp_' + Math.abs(h).toString(36)
  } catch {
    return 'fp_unknown'
  }
}

/**
 * Log a security event to Supabase. Silently fails (best-effort) to avoid
 * tipping off attackers or breaking user flows.
 */
export async function logSecurityEvent({ event, path, meta }: LogArgs): Promise<void> {
  try {
    await supabase.from('security_log').insert({
      event,
      path: path ?? (typeof location !== 'undefined' ? location.pathname : null),
      fingerprint: browserFingerprint(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
      referrer: typeof document !== 'undefined' ? document.referrer.slice(0, 500) : null,
      meta: meta ?? null,
    })
  } catch {
    /* swallow */
  }
}

// ═══════════════════════════════════════════════════════════
// Rate limiting (client-side, sessionStorage-backed)
// ═══════════════════════════════════════════════════════════

interface LockoutState {
  count: number
  lockedUntil: number // epoch ms, 0 if not locked
  firstAttempt: number
}

function getLockout(key: string): LockoutState {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return { count: 0, lockedUntil: 0, firstAttempt: 0 }
    return JSON.parse(raw) as LockoutState
  } catch {
    return { count: 0, lockedUntil: 0, firstAttempt: 0 }
  }
}

function setLockout(key: string, state: LockoutState): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clearLockout(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/** Returns milliseconds left on lockout, or 0 if not locked. */
export function checkLockout(key: string): number {
  const state = getLockout(key)
  const now = Date.now()
  if (state.lockedUntil && state.lockedUntil > now) {
    return state.lockedUntil - now
  }
  // Expired lockout → reset
  if (state.lockedUntil && state.lockedUntil <= now) {
    clearLockout(key)
  }
  return 0
}

/** Record a failed attempt. Returns { locked, remainingAttempts, lockMsLeft }. */
export function recordFailedAttempt(
  key: typeof LOCKOUT_KEYS[keyof typeof LOCKOUT_KEYS],
): { locked: boolean; remainingAttempts: number; lockMsLeft: number } {
  const isLogin = key === LOCKOUT_KEYS.LOGIN
  const maxAttempts = isLogin ? RATE_LIMITS.LOGIN_MAX_ATTEMPTS : RATE_LIMITS.INVITE_CLAIM_MAX_ATTEMPTS
  const lockoutMs = isLogin ? RATE_LIMITS.LOGIN_LOCKOUT_MS : RATE_LIMITS.INVITE_CLAIM_LOCKOUT_MS

  const state = getLockout(key)
  const now = Date.now()

  state.count += 1
  if (!state.firstAttempt) state.firstAttempt = now

  if (state.count >= maxAttempts) {
    state.lockedUntil = now + lockoutMs
    setLockout(key, state)
    return { locked: true, remainingAttempts: 0, lockMsLeft: lockoutMs }
  }

  setLockout(key, state)
  return {
    locked: false,
    remainingAttempts: maxAttempts - state.count,
    lockMsLeft: 0,
  }
}

export function formatLockoutMs(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m <= 0) return `${s}s`
  return `${m}m ${s}s`
}

// ═══════════════════════════════════════════════════════════
// Console warning (deters casual snooping / social-engineering)
// ═══════════════════════════════════════════════════════════

let consoleWarningShown = false
export function showConsoleWarning(): void {
  if (consoleWarningShown) return
  consoleWarningShown = true
  try {
    const title = 'STOP'
    const bigStyle =
      'color:#FF5C38;font-size:54px;font-weight:900;text-shadow:0 0 12px #FF5C38;letter-spacing:2px'
    const warnStyle = 'color:#F0EBD8;font-size:14px;line-height:1.6'
    const accent = 'color:#2BDBA4;font-weight:700'

    // eslint-disable-next-line no-console
    console.log('%c' + title, bigStyle)
    // eslint-disable-next-line no-console
    console.log(
      '%cThis is a secured area of JUST WHY US.%c\n\n' +
        'If someone told you to open DevTools and paste something here,\n' +
        "it is almost certainly a %cscam to take over your account%c.\n\n" +
        'All activity on this site is logged and monitored.\n' +
        'Unauthorized access attempts will be traced and reported.\n',
      warnStyle,
      warnStyle,
      accent,
      warnStyle,
    )
  } catch {
    /* ignore */
  }
}
