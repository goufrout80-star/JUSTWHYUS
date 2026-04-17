import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface BrandRequest {
  id: string
  company_name: string
  website: string | null
  niche: string | null
  budget_range: string | null
  campaign_goal: string | null
  email: string
  message: string | null
  status: string
  created_at: string
  reviewed_by?: string | null
  reviewed_at?: string | null
}

export interface CreatorApplication {
  id: string
  name: string
  handle: string | null
  platform: string | null
  niche: string | null
  audience_size: string | null
  content_format: string | null
  email: string
  best_content_link: string | null
  status: string
  created_at: string
  reviewed_by?: string | null
  reviewed_at?: string | null
}

export interface AdminRow {
  id: string
  email: string
  display_name: string
  role: 'super_admin' | 'admin'
  feedback_access: boolean
  invited_by: string | null
  created_at: string
  mfa_enabled: boolean
  mfa_required: boolean
}

export interface PendingInvite {
  id: string
  token: string
  email: string | null
  display_name: string
  role: 'super_admin' | 'admin'
  feedback_access: boolean
  invited_by: string
  expires_at: string
  used_at: string | null
  created_at: string
  delivery: 'link' | 'email'
}

export interface AppSettingsRow {
  id: number
  require_2fa_global: boolean
}

export interface ActivityRow {
  id: string
  admin_email: string
  admin_name: string
  action: 'approved' | 'rejected' | 'deleted' | 'invited' | 'removed'
  target_table: string
  target_id: string | null
  target_name: string | null
  created_at: string
}

interface ActorInfo {
  email: string
  name: string
}

export function useAdminData(actor: ActorInfo | null) {
  const [brandRequests, setBrandRequests] = useState<BrandRequest[]>([])
  const [creatorApps, setCreatorApps] = useState<CreatorApplication[]>([])
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [activity, setActivity] = useState<ActivityRow[]>([])
  const [settings, setSettings] = useState<AppSettingsRow | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const [brands, creators, adminsRes, activityRes, invitesRes, settingsRes] =
      await Promise.all([
        supabase
          .from('brand_requests')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('creator_applications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: true }),
        supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('admin_invites')
          .select('*')
          .is('used_at', null)
          .order('created_at', { ascending: false }),
        supabase
          .from('app_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle(),
      ])

    if (brands.data) setBrandRequests(brands.data as BrandRequest[])
    if (creators.data) setCreatorApps(creators.data as CreatorApplication[])
    if (adminsRes.data) setAdmins(adminsRes.data as AdminRow[])
    if (activityRes.data) setActivity(activityRes.data as ActivityRow[])
    if (invitesRes.data) setInvites(invitesRes.data as PendingInvite[])
    if (settingsRes.data) setSettings(settingsRes.data as AppSettingsRow)

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('admin_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'brand_requests' },
        () => fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'creator_applications' },
        () => fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admins' },
        () => fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log' },
        () => fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_invites' },
        () => fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        () => fetchAll(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  const logActivity = async (
    action: ActivityRow['action'],
    target_table: string,
    target_id: string | null,
    target_name: string | null,
  ) => {
    if (!actor) return
    await supabase.from('activity_log').insert({
      admin_email: actor.email,
      admin_name: actor.name,
      action,
      target_table,
      target_id,
      target_name,
    })
  }

  const updateStatus = async (
    table: string,
    id: string,
    status: string,
    targetName?: string,
  ) => {
    const now = new Date().toISOString()
    const reviewerLabel = actor ? `${actor.name} (${actor.email})` : null
    await supabase
      .from(table)
      .update({ status, reviewed_by: reviewerLabel, reviewed_at: now })
      .eq('id', id)
    await logActivity(
      status === 'approved' ? 'approved' : 'rejected',
      table,
      id,
      targetName ?? null,
    )
    await fetchAll()
  }

  const deleteRecord = async (
    table: string,
    id: string,
    targetName?: string,
  ) => {
    await logActivity('deleted', table, id, targetName ?? null)
    await supabase.from(table).delete().eq('id', id)
    await fetchAll()
  }

  const genToken = () => {
    const arr = new Uint8Array(36)
    crypto.getRandomValues(arr)
    return Array.from(arr, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 48)
  }

  const createInvite = async (
    email: string | null,
    display_name: string,
    role: 'admin' | 'super_admin' = 'admin',
    delivery: 'link' | 'email' = 'link',
  ) => {
    const token = genToken()
    const { data, error } = await supabase
      .from('admin_invites')
      .insert({
        token,
        email: email ? email.toLowerCase().trim() : null,
        display_name: display_name.trim(),
        role,
        delivery,
        invited_by: actor?.email ?? 'system',
      })
      .select()
      .single()
    if (!error) {
      await logActivity(
        'invited',
        'admin_invites',
        data?.id ?? null,
        email ?? display_name,
      )
      await fetchAll()
    }
    return { data: data as PendingInvite | null, error }
  }

  const revokeInvite = async (id: string, email: string | null) => {
    const { error } = await supabase.from('admin_invites').delete().eq('id', id)
    if (!error) {
      await logActivity('removed', 'admin_invites', id, email ?? 'link invite')
      await fetchAll()
    }
    return { error }
  }

  const regenerateInvite = async (id: string) => {
    // Extends expiry 6h + rotates token
    const token = genToken()
    const expires_at = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabase
      .from('admin_invites')
      .update({ token, expires_at })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetchAll()
    return { data: data as PendingInvite | null, error }
  }

  const removeAdmin = async (id: string, email: string) => {
    const { error } = await supabase.from('admins').delete().eq('id', id)
    if (!error) {
      await logActivity('removed', 'admins', id, email)
      await fetchAll()
    }
    return { error }
  }

  const setAdminMfaRequired = async (id: string, required: boolean) => {
    const { error } = await supabase
      .from('admins')
      .update({ mfa_required: required })
      .eq('id', id)
    if (!error) await fetchAll()
    return { error }
  }

  const setGlobalMfaRequired = async (required: boolean) => {
    const { error } = await supabase
      .from('app_settings')
      .update({ require_2fa_global: required, updated_at: new Date().toISOString() })
      .eq('id', 1)
    if (!error) await fetchAll()
    return { error }
  }

  const setFeedbackAccess = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from('admins')
      .update({ feedback_access: enabled })
      .eq('id', id)
    if (!error) await fetchAll()
    return { error }
  }

  return {
    brandRequests,
    creatorApps,
    admins,
    invites,
    activity,
    settings,
    loading,
    updateStatus,
    deleteRecord,
    createInvite,
    revokeInvite,
    regenerateInvite,
    removeAdmin,
    setAdminMfaRequired,
    setGlobalMfaRequired,
    setFeedbackAccess,
    refetch: fetchAll,
  }
}
