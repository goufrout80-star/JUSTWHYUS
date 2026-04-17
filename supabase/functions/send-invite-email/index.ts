// Deno Edge Function: send-invite-email
// Called from the client (super admin) after creating an admin_invites row.
// Uses Resend to send a branded HTML email from invitation@justwhyus.com.
//
// Env secrets required:
//   RESEND_API_KEY  — your Resend API key
//   PUBLIC_SITE_URL — e.g. https://justwhyus.com (falls back to origin)
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { renderInviteEmail } from '../_shared/email-template.ts'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM = 'JUST WHY US <noreply@justwhyus.com>'
const SITE_URL =
  Deno.env.get('PUBLIC_SITE_URL') ?? 'https://justwhyus.com'
interface Payload {
  token: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  invitedBy: string
}
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    if (!RESEND_API_KEY) {
      return json({ ok: false, error: 'RESEND_API_KEY not configured' }, 500)
    }
    const body = (await req.json()) as Payload
    if (!body.token || !body.email || !body.name) {
      return json({ ok: false, error: 'missing fields' }, 400)
    }
    const acceptUrl = `${SITE_URL.replace(/\/$/, '')}/invite/${encodeURIComponent(
      body.token,
    )}?preverified=1`
    const html = renderInviteEmail({
      name: body.name,
      role: body.role === 'super_admin' ? 'Super Admin' : 'Admin',
      invitedBy: body.invitedBy || 'A super admin',
      acceptUrl,
      expiresInHours: 6,
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
        subject: 'You have been invited to JUST WHY US',
        html,
        reply_to: 'invitation@justwhyus.com',
      }),
    })
    if (!resp.ok) {
      const txt = await resp.text()
      return json({ ok: false, error: `resend_failed: ${txt}` }, 502)
    }
    const data = await resp.json()
    return json({ ok: true, id: data?.id ?? null })
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
