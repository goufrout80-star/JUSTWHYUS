import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

export type AdminRole = 'super_admin' | 'admin' | null
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

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [aal, setAal] = useState<AAL>(null)
  const [nextAal, setNextAal] = useState<AAL>(null)
  const [loading, setLoading] = useState(true)

  const loadContext = async (s: Session | null) => {
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
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      await loadContext(session)
    }).catch(() => {
      /* session read failed — treat as logged out */
    }).finally(() => {
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      await loadContext(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const role: AdminRole = profile?.role ?? null
  const isAdmin = role === 'admin' || role === 'super_admin'
  const isSuper = role === 'super_admin'

  // Must enroll 2FA? (required by self or by global policy, but not yet enrolled)
  const mfaEnforced =
    !!profile && (profile.mfa_required || !!settings?.require_2fa_global)
  const mfaPending = mfaEnforced && !profile?.mfa_enabled

  // Must complete a 2FA challenge? (user has MFA set up but session is still aal1)
  const mfaChallengeRequired = aal === 'aal1' && nextAal === 'aal2'

  return {
    session,
    profile,
    settings,
    role,
    isAdmin,
    isSuper,
    aal,
    nextAal,
    mfaEnforced,
    mfaPending,
    mfaChallengeRequired,
    loading,
    refresh: () => loadContext(session),
  }
}
