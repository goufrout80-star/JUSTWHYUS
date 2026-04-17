// Deno Edge Function: verify-otp
// Checks a 6-digit OTP against the otp_codes table.
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface Payload {
  email: string
  code: string
  purpose: string
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
    if (!body.email || !body.code || !body.purpose) {
      return json({ ok: false, error: 'missing fields' }, 400)
    }

    const sb = createClient(SUPABASE_URL, SERVICE_KEY)

    const { data, error } = await sb
      .from('otp_codes')
      .select('id, code, expires_at')
      .eq('email', body.email.toLowerCase())
      .eq('purpose', body.purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) {
      return json({ ok: false, error: 'No code found. Request a new one.' }, 400)
    }

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      // Clean up expired
      await sb.from('otp_codes').delete().eq('id', data.id)
      return json({ ok: false, error: 'Code expired. Request a new one.' }, 400)
    }

    // Check code
    if (data.code !== body.code.trim()) {
      return json({ ok: false, error: 'Invalid code.' }, 400)
    }

    // Valid — delete the code (single use)
    await sb.from('otp_codes').delete().eq('id', data.id)

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
