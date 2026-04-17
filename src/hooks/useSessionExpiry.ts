import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../lib/supabase'
import { ADMIN_BASE } from '../config/security'

/**
 * Enforce a hybrid session timeout on admin pages:
 *   - Absolute  : 4 hours from first sign-in (hard ceiling)
 *   - Inactive  : 30 minutes since last user activity
 *
 * Whichever hits first triggers a forced sign-out and redirects to the
 * login page with ?expired=1 so the user sees a friendly explanation.
 *
 * Storage keys (localStorage):
 *   jwu_session_start    epoch ms of first activity in this session
 *   jwu_last_activity    epoch ms of last tracked activity
 */

const ABSOLUTE_MAX_MS = 4 * 60 * 60 * 1000 // 4h
const IDLE_MAX_MS = 30 * 60 * 1000 // 30min
const ACTIVITY_THROTTLE_MS = 10 * 1000 // write to storage at most every 10s
const CHECK_INTERVAL_MS = 30 * 1000 // poll every 30s

export const SESSION_START_KEY = 'jwu_session_start'
export const LAST_ACTIVITY_KEY = 'jwu_last_activity'

/** Call once when the user successfully authenticates (login / 2FA pass). */
export function markSessionStart() {
  try {
    const now = Date.now().toString()
    localStorage.setItem(SESSION_START_KEY, now)
    localStorage.setItem(LAST_ACTIVITY_KEY, now)
  } catch {
    /* ignore */
  }
}

export function clearSessionMarks() {
  try {
    localStorage.removeItem(SESSION_START_KEY)
    localStorage.removeItem(LAST_ACTIVITY_KEY)
  } catch {
    /* ignore */
  }
}

function readNum(key: string): number {
  try {
    const v = localStorage.getItem(key)
    return v ? parseInt(v, 10) : 0
  } catch {
    return 0
  }
}

export function useSessionExpiry() {
  const navigate = useNavigate()
  const lastWriteRef = useRef(0)
  const expiredRef = useRef(false)

  useEffect(() => {
    // Initialize markers if this is the first page load of a session
    if (!readNum(SESSION_START_KEY)) markSessionStart()

    const bumpActivity = () => {
      const now = Date.now()
      if (now - lastWriteRef.current < ACTIVITY_THROTTLE_MS) return
      lastWriteRef.current = now
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString())
      } catch {
        /* ignore */
      }
    }

    const forceExpire = async (reason: 'idle' | 'absolute') => {
      if (expiredRef.current) return
      expiredRef.current = true
      clearSessionMarks()
      try {
        await signOut()
      } catch {
        /* ignore */
      }
      navigate(`${ADMIN_BASE}?expired=${reason}`, { replace: true })
    }

    const check = () => {
      const start = readNum(SESSION_START_KEY)
      const last = readNum(LAST_ACTIVITY_KEY)
      const now = Date.now()
      if (start && now - start >= ABSOLUTE_MAX_MS) {
        void forceExpire('absolute')
        return
      }
      if (last && now - last >= IDLE_MAX_MS) {
        void forceExpire('idle')
        return
      }
    }

    // Activity listeners
    const events: (keyof WindowEventMap)[] = [
      'click',
      'keydown',
      'mousemove',
      'scroll',
      'touchstart',
    ]
    events.forEach((e) => window.addEventListener(e, bumpActivity, { passive: true }))

    // Periodic expiry check
    const interval = window.setInterval(check, CHECK_INTERVAL_MS)
    // Also check immediately on mount
    check()

    return () => {
      events.forEach((e) => window.removeEventListener(e, bumpActivity))
      window.clearInterval(interval)
    }
  }, [navigate])
}
