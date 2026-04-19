// Deno Edge Function: claim-invite
// Creates an auth user with a password + marks invite claimed.
//
// Called by the public /invite/:token page after:
//   - email-delivery + preverified (no OTP needed), OR
//   - link-delivery + OTP verified (invite.email already set)
//
// Body: { token, email, password }
// Returns: { ok: true }  OR  { ok:false, error }

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface Payload {
  token: string
  email: string
  password: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return json({ ok: false, error: 'server_misconfigured' }, 500)
    }

    const body = (await req.json()) as Payload
    const token = (body.token ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const password = body.password ?? ''

    if (!token || !email || !password) {
      return json({ ok: false, error: 'missing_fields' }, 400)
    }
    if (password.length < 10) {
      return json({ ok: false, error: 'password_too_short' }, 400)
    }

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    })

    // 1. Load & validate invite
    const { data: invite, error: invErr } = await sb
      .from('admin_invites')
      .select('id, token, email, display_name, role, delivery, expires_at, used_at')
      .eq('token', token)
      .maybeSingle()

    if (invErr) return json({ ok: false, error: 'db_error' }, 500)
    if (!invite) return json({ ok: false, error: 'invite_not_found' }, 404)
    if (invite.used_at) return json({ ok: false, error: 'invite_used' }, 409)
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return json({ ok: false, error: 'invite_expired' }, 410)
    }

    // 2. Enforce email binding
    // - For email-delivery invites: the email was set by admin and must match.
    // - For link-delivery invites: the email is attached by verify_invite_otp
    //   before we get here, so it must also match.
    if (!invite.email) {
      return json({ ok: false, error: 'email_not_verified' }, 400)
    }
    if (invite.email.toLowerCase() !== email) {
      return json({ ok: false, error: 'email_mismatch' }, 400)
    }

    // 3. Create or update the auth user (email pre-confirmed — we already
    //    vouched for it via either email-click or our own Resend OTP).
    let userId: string | null = null

    // Try to find existing auth user by paginating through listUsers
    let match: { id: string; email?: string | null } | undefined
    for (let page = 1; page <= 10; page++) {
      const { data: pageData } = await sb.auth.admin.listUsers({ page, perPage: 200 })
      if (!pageData?.users?.length) break
      match = pageData.users.find(
        (u) => (u.email ?? '').toLowerCase() === email,
      )
      if (match) break
      if (pageData.users.length < 200) break
    }

    if (match) {
      userId = match.id
      const { error: updErr } = await sb.auth.admin.updateUserById(match.id, {
        password,
        email_confirm: true,
      })
      if (updErr) return json({ ok: false, error: `update_user: ${updErr.message}` }, 500)
    } else {
      const { data: created, error: createErr } = await sb.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: invite.display_name },
      })
      if (createErr) {
        // Fallback: user may already exist but wasn't found in paginated list
        // (e.g. rare pagination edge case). Try finding again after error.
        if (createErr.message?.toLowerCase().includes('already')) {
          const { data: retry } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
          const again = retry?.users?.find((u) => (u.email ?? '').toLowerCase() === email)
          if (again) {
            userId = again.id
            const { error: updErr } = await sb.auth.admin.updateUserById(again.id, {
              password,
              email_confirm: true,
            })
            if (updErr) return json({ ok: false, error: `update_user: ${updErr.message}` }, 500)
          } else {
            return json({ ok: false, error: `create_user: ${createErr.message}` }, 500)
          }
        } else {
          return json({ ok: false, error: `create_user: ${createErr.message}` }, 500)
        }
      } else {
        userId = created?.user?.id ?? null
      }
    }

    if (!userId) return json({ ok: false, error: 'no_user_id' }, 500)

    // 4. Mark invite used + create admins row
    const { error: adminErr } = await sb.from('admins').upsert(
      {
        id: userId,
        email,
        display_name: invite.display_name,
        role: invite.role,
        invited_by: null,
        mfa_enabled: false,
        mfa_required: false,
      },
      { onConflict: 'email' },
    )
    if (adminErr) return json({ ok: false, error: `admin_insert: ${adminErr.message}` }, 500)

    const { error: markErr } = await sb
      .from('admin_invites')
      .update({ used_at: new Date().toISOString() })
      .eq('id', invite.id)
    if (markErr) return json({ ok: false, error: `mark_used: ${markErr.message}` }, 500)

    // 5. Log activity
    await sb.from('activity_log').insert({
      admin_email: email,
      admin_name: invite.display_name,
      action: 'invited',
      target_table: 'admin_invites',
      target_id: invite.id,
      target_name: email,
    })

    return json({ ok: true })
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
