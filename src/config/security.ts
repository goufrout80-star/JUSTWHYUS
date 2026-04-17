/**
 * JUST WHY US — Security Configuration
 * Central place for all obscure paths, rate limits, and security constants.
 *
 * The real admin path is resolved from VITE_ADMIN_PATH env var with a strong
 * random default. To rotate, change the env var on Vercel and redeploy — no
 * source code change needed.
 */

// Default secret path — change this OR override via VITE_ADMIN_PATH on Vercel.
// This string is deliberately NOT in a format that looks like "/admin".
const DEFAULT_ADMIN_PATH = 'ctrl-x7k9m2q8-access'

function sanitizePath(p: string): string {
  // Strip leading slashes, disallow traversal, lowercase, restrict charset
  const cleaned = p
    .replace(/^\/+/, '')
    .replace(/[^a-z0-9-_]/gi, '')
    .toLowerCase()
  return cleaned || DEFAULT_ADMIN_PATH
}

const rawPath = (import.meta.env.VITE_ADMIN_PATH as string | undefined) ?? DEFAULT_ADMIN_PATH

export const ADMIN_SLUG = sanitizePath(rawPath)
export const ADMIN_BASE = `/${ADMIN_SLUG}`
export const ADMIN_DASHBOARD = `${ADMIN_BASE}/dashboard`
export const ADMIN_SETTINGS = `${ADMIN_BASE}/settings`
export const ADMIN_SETUP_2FA = `${ADMIN_BASE}/setup-2fa`

/** Rate limiting — client-side first line of defense. */
export const RATE_LIMITS = {
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MS: 15 * 60 * 1000, // 15 minutes
  INVITE_CLAIM_MAX_ATTEMPTS: 10,
  INVITE_CLAIM_LOCKOUT_MS: 30 * 60 * 1000, // 30 minutes
} as const

/** Session storage keys for lockout state. */
export const LOCKOUT_KEYS = {
  LOGIN: 'jwu_login_lockout',
  INVITE: 'jwu_invite_lockout',
} as const

/** Paths that bots / attackers commonly probe — used as honeypots. */
export const HONEYPOT_PATHS = [
  '/admin',
  '/administrator',
  '/wp-admin',
  '/wp-login.php',
  '/login',
  '/dashboard',
  '/cpanel',
  '/phpmyadmin',
  '/.env',
  '/config',
  '/backup',
]
