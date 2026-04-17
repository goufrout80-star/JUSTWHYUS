// Deno Edge Function: send-otp-email
// Generates a 6-digit OTP, stores it in otp_codes table, and sends via Resend.
//
// Env secrets required:
//   RESEND_API_KEY     — your Resend API key
//   SUPABASE_URL       — project URL
//   SUPABASE_SERVICE_ROLE_KEY — service-role key (to write otp_codes)
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'
import { renderOtpEmail } from '../_shared/email-template.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FROM = 'JUST WHY US <noreply@justwhyus.com>'
const OTP_TTL_MIN = 10

interface Payload {
  email: string
  name: string
  purpose: string // e.g. 'password_change'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY || !SUPABASE_URL || !SERVICE_KEY) {
      return json({ ok: false, error: 'Missing env config' }, 500)
    }

    const body = (await req.json()) as Payload
    if (!body.email || !body.name) {
      return json({ ok: false, error: 'missing fields' }, 400)
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60_000).toISOString()

    // Store in otp_codes table (service role to bypass RLS)
    const sb = createClient(SUPABASE_URL, SERVICE_KEY)

    // Delete any old codes for this email+purpose
    await sb
      .from('otp_codes')
      .delete()
      .eq('email', body.email.toLowerCase())
      .eq('purpose', body.purpose || 'password_change')

    // Insert new code
    const { error: insertErr } = await sb.from('otp_codes').insert({
      email: body.email.toLowerCase(),
      code,
      purpose: body.purpose || 'password_change',
      expires_at: expiresAt,
    })

    if (insertErr) {
      return json({ ok: false, error: `db: ${insertErr.message}` }, 500)
    }

    // Send email via Resend
    const html = renderOtpEmail({
      name: body.name,
      code,
      expiresInMin: OTP_TTL_MIN,
    })

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [body.email],
        subject: 'Your JUST WHY US verification code',
        html,
      }),
    })

    if (!resp.ok) {
      const txt = await resp.text()
      return json({ ok: false, error: `resend: ${txt}` }, 502)
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
