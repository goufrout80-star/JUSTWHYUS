import { useState, useEffect, useContext, createContext, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export type AdminRole = 'super_admin' | 'admin' | 'feedback_user' | null
export type AAL = 'aal1' | 'aal2' | null

export interface AdminProfile {
  email: string
  display_name: string
  role: Exclude<AdminRole, null>
  mfa_enabled: boolean
  mfa_required: boolean
}

export interface AppSettings {
  require_2fa_global: boolean
}

interface AdminAuthState {
  session: Session | null
  profile: AdminProfile | null
  settings: AppSettings | null
  role: AdminRole
  isAdmin: boolean
  isSuper: boolean
  isFeedbackUser: boolean
  aal: AAL
  nextAal: AAL
  mfaEnforced: boolean
  mfaPending: boolean
  mfaChallengeRequired: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const defaultState: AdminAuthState = {
  session: null,
  profile: null,
  settings: null,
  role: null,
  isAdmin: false,
  isSuper: false,
  isFeedbackUser: false,
  aal: null,
  nextAal: null,
  mfaEnforced: false,
  mfaPending: false,
  mfaChallengeRequired: false,
  loading: true,
  refresh: async () => {},
}

const AdminAuthContext = createContext<AdminAuthState>(defaultState)

/**
 * Provider — mount ONCE near the app root.
 * All auth init (getSession, onAuthStateChange) happens here only.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [aal, setAal] = useState<AAL>(null)
  const [nextAal, setNextAal] = useState<AAL>(null)
  const [loading, setLoading] = useState(true)

  const loadContext = useCallback(async (s: Session | null) => {
    if (!s?.user?.email) {
      setProfile(null)
      setSettings(null)
      setAal(null)
      setNextAal(null)
      return
    }

    try {
      const [adminRes, settingsRes, aalRes] = await Promise.all([
        supabase
          .from('admins')
          .select('email, display_name, role, mfa_enabled, mfa_required')
          .ilike('email', s.user.email)
          .maybeSingle(),
        supabase
          .from('app_settings')
          .select('require_2fa_global')
          .eq('id', 1)
          .maybeSingle(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ])

      setProfile((adminRes.data as AdminProfile) ?? null)
      setSettings((settingsRes.data as AppSettings) ?? null)
      setAal((aalRes.data?.currentLevel as AAL) ?? null)
      setNextAal((aalRes.data?.nextLevel as AAL) ?? null)
    } catch (err) {
      console.error('[useAdminAuth] loadContext error:', err)
      setProfile(null)
      setSettings(null)
    }
  }, [])

  useEffect(() => {
    let done = false
    const finish = () => {
      if (!done) { done = true; setLoading(false) }
    }

    // Hard safety-net: never spin longer than 6 seconds
    const timer = window.setTimeout(finish, 6000)

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      await loadContext(s)
    }).catch((err) => {
      console.error('[useAdminAuth] getSession failed:', err)
    }).finally(finish)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s)
      await loadContext(s)
    })

    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [loadContext])

  const role: AdminRole = profile?.role ?? null
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'feedback_user'
  const isSuper = role === 'super_admin'
  const isFeedbackUser = role === 'feedback_user'

  const mfaEnforced =
    !!profile && (profile.mfa_required || !!settings?.require_2fa_global)
  const mfaPending = mfaEnforced && !profile?.mfa_enabled
  const mfaChallengeRequired = aal === 'aal1' && nextAal === 'aal2'

  const value: AdminAuthState = {
    session,
    profile,
    settings,
    role,
    isAdmin,
    isSuper,
    isFeedbackUser,
    aal,
    nextAal,
    mfaEnforced,
    mfaPending,
    mfaChallengeRequired,
    loading,
    refresh: () => loadContext(session),
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

/** Hook — reads from the singleton context. Safe to call from many components. */
export function useAdminAuth() {
  return useContext(AdminAuthContext)
}
