// Simple deny-list of extremely common/leaked passwords.
// Not exhaustive — Supabase Auth already has its own HIBP-style check when
// "leaked password protection" is on. This is a front-line UX gate.
const COMMON = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  'letmein123',
  'welcome123',
  'admin123',
  'administrator',
  'iloveyou1',
  'monkey123',
  'abc123456',
  'justwhyus',
  'justwhyus1',
  'auraxadmin',
])

export interface StrengthResult {
  score: 0 | 1 | 2 | 3 | 4
  label: 'too weak' | 'weak' | 'ok' | 'strong' | 'excellent'
  issues: string[]
  ok: boolean
}

export function scorePassword(pw: string): StrengthResult {
  const issues: string[] = []

  if (pw.length < 10) issues.push('At least 10 characters')
  if (!/[a-z]/.test(pw)) issues.push('A lowercase letter')
  if (!/[A-Z]/.test(pw)) issues.push('An uppercase letter')
  if (!/[0-9]/.test(pw)) issues.push('A number')
  if (!/[^A-Za-z0-9]/.test(pw)) issues.push('A symbol (!@#$…)')
  if (COMMON.has(pw.toLowerCase())) issues.push('Not a common password')
  if (/^(.)\1+$/.test(pw)) issues.push('Not all the same character')

  // Crude score: max 4
  let score = 0
  if (pw.length >= 10) score++
  if (pw.length >= 14) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++
  if (issues.length > 0) score = Math.min(score, issues.length <= 2 ? 2 : 1)

  const labels: StrengthResult['label'][] = [
    'too weak',
    'weak',
    'ok',
    'strong',
    'excellent',
  ]

  return {
    score: score as StrengthResult['score'],
    label: labels[score],
    issues,
    ok: issues.length === 0 && pw.length >= 10,
  }
}
