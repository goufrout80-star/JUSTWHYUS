// Deno Edge Function: send-invite-otp
// Called from the public invite-claim page when the recipient enters their email.
// Generates a 6-digit code, hashes it, stores it via the register_invite_otp RPC,
// then emails it via Resend from invitation@justwhyus.com.

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { renderOtpEmail } from '../_shared/email-template.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FROM = 'JUST WHY US <invitation@justwhyus.com>'

interface Payload {
  token: string
  email: string
  name?: string
}

function generateCode(): string {
  // 6-digit numeric, always 6 chars
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0')
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      return json({ ok: false, error: 'server_misconfigured' }, 500)
    }

    const body = (await req.json()) as Payload
    const token = (body.token ?? '').trim()
    const email = (body.email ?? '').trim().toLowerCase()
    const name = (body.name ?? 'there').trim()
    if (!token || !email) {
      return json({ ok: false, error: 'missing fields' }, 400)
    }

    const code = generateCode()
    const codeHash = await sha256Hex(code)

    // Service-role client bypasses RLS for the RPC call
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    })

    const { data: rpcData, error: rpcErr } = await sb.rpc('register_invite_otp', {
      p_token: token,
      p_email: email,
      p_code_hash: codeHash,
    })

    if (rpcErr) {
      return json({ ok: false, error: `db_error: ${rpcErr.message}` }, 500)
    }
    if (!rpcData?.ok) {
      return json({ ok: false, error: rpcData?.error ?? 'unknown' }, 400)
    }

    const html = renderOtpEmail({ name, code, expiresInMin: 5 })

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: `Your verification code: ${code}`,
        html,
        reply_to: 'invitation@justwhyus.com',
      }),
    })

    if (!resp.ok) {
      const txt = await resp.text()
      return json({ ok: false, error: `resend_failed: ${txt}` }, 502)
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
