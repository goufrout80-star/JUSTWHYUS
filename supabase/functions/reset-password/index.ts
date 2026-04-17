// Deno Edge Function: reset-password
// Resets a user's password using service role (for forgot password flow)
//
// Env secrets required:
//   SUPABASE_URL       — project URL
//   SUPABASE_SERVICE_ROLE_KEY — service-role key
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface Payload {
  email: string
  newPassword: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json({ ok: false, error: 'Missing env config' }, 500)
    }

    const body = (await req.json()) as Payload
    if (!body.email || !body.newPassword) {
      return json({ ok: false, error: 'missing fields' }, 400)
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY)

    // Get user by email
    const { data: { users }, error: listErr } = await sb.auth.admin.listUsers()
    if (listErr) {
      return json({ ok: false, error: `Failed to list users: ${listErr.message}` }, 500)
    }

    const user = users.find((u: any) => u.email.toLowerCase() === body.email.toLowerCase())
    if (!user) {
      return json({ ok: false, error: 'User not found' }, 404)
    }

    // Update password using admin API
    const { error: updateErr } = await sb.auth.admin.updateUserById(user.id, {
      password: body.newPassword,
    })

    if (updateErr) {
      return json({ ok: false, error: `Failed to update password: ${updateErr.message}` }, 500)
    }

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
