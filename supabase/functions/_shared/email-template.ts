/**
 * Branded HTML email templates for JUST WHY US.
 * Palette: VOID #080808 / INK #0D1A14 / TEAL #2BDBA4 / CREAM #F0EBD8 / CORAL #FF5C38
 */
interface InviteEmailArgs {
  name: string
  role: string
  invitedBy: string
  acceptUrl: string
  expiresInHours: number
}
export function renderInviteEmail(a: InviteEmailArgs): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your JUST WHY US admin invite</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#F0EBD8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0D1A14;border:1px solid rgba(43,219,164,0.15);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:40px 40px 24px 40px;text-align:center;">
          <div style="font-family:Inter,sans-serif;font-weight:900;font-size:22px;letter-spacing:0.35em;color:#2BDBA4;">JUST WHY US</div>
          <div style="height:1px;background:linear-gradient(to right,transparent,rgba(43,219,164,0.4),transparent);margin:24px 0;"></div>
        </td></tr>
        <tr><td style="padding:0 40px 24px 40px;">
          <h1 style="margin:0 0 16px 0;font-size:26px;font-weight:800;color:#F0EBD8;line-height:1.25;">
            Hello ${escapeHtml(a.name)},
          </h1>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:rgba(240,235,216,0.8);">
            <strong>${escapeHtml(a.invitedBy)}</strong> has invited you to join the JUST WHY US admin team as a <strong style="color:#2BDBA4;">${escapeHtml(a.role)}</strong>.
          </p>
          <p style="margin:0 0 28px 0;font-size:15px;line-height:1.6;color:rgba(240,235,216,0.8);">
            Click the button below to set your password and access the dashboard.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 32px 40px;">
          <a href="${a.acceptUrl}"
             style="display:inline-block;padding:16px 34px;background:#2BDBA4;color:#080808;font-family:Inter,sans-serif;font-weight:800;font-size:13px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;border-radius:4px;">
            Get Access →
          </a>
        </td></tr>
        <tr><td style="padding:0 40px 24px 40px;">
          <p style="margin:0 0 8px 0;font-size:12px;color:rgba(240,235,216,0.5);line-height:1.5;">
            This invite expires in <strong style="color:#F0EBD8;">${a.expiresInHours} hours</strong>. Single-use only.
          </p>
          <p style="margin:0;font-size:12px;color:rgba(240,235,216,0.4);line-height:1.5;word-break:break-all;">
            Or paste this link into your browser:<br/>
            <a href="${a.acceptUrl}" style="color:#2BDBA4;text-decoration:none;">${a.acceptUrl}</a>
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;border-top:1px solid rgba(43,219,164,0.1);background:#080808;">
          <p style="margin:0;font-size:11px;color:rgba(240,235,216,0.35);line-height:1.5;">
            If you weren't expecting this invite, just ignore this email — nothing will happen and your email won't be added to any system.
          </p>
          <p style="margin:12px 0 0 0;font-size:11px;color:rgba(240,235,216,0.25);">
            JUST WHY US · justwhyus.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
interface OtpEmailArgs {
  name: string
  code: string
  expiresInMin: number
}
export function renderOtpEmail(a: OtpEmailArgs): string {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Your verification code</title>
</head>
<body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#F0EBD8;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#0D1A14;border:1px solid rgba(43,219,164,0.15);border-radius:12px;overflow:hidden;">
        <tr><td style="padding:36px 40px 20px 40px;text-align:center;">
          <div style="font-family:Inter,sans-serif;font-weight:900;font-size:20px;letter-spacing:0.35em;color:#2BDBA4;">JUST WHY US</div>
        </td></tr>
        <tr><td style="padding:8px 40px 8px 40px;text-align:center;">
          <h1 style="margin:0 0 12px 0;font-size:20px;font-weight:800;color:#F0EBD8;">
            Hi ${escapeHtml(a.name)},
          </h1>
          <p style="margin:0 0 24px 0;font-size:14px;color:rgba(240,235,216,0.7);line-height:1.5;">
            Use this verification code to continue:
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 40px 24px 40px;">
          <div style="display:inline-block;padding:20px 30px;background:#080808;border:1px solid rgba(43,219,164,0.3);border-radius:8px;">
            <div style="font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:0.5em;color:#2BDBA4;">
              ${escapeHtml(a.code)}
            </div>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 32px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(240,235,216,0.5);">
            Expires in <strong style="color:#F0EBD8;">${a.expiresInMin} minutes</strong>.
          </p>
        </td></tr>
        <tr><td style="padding:22px 40px;border-top:1px solid rgba(43,219,164,0.1);background:#080808;">
          <p style="margin:0;font-size:11px;color:rgba(240,235,216,0.35);line-height:1.5;">
            If you didn't request this code, ignore this email — no action needed.
          </p>
          <p style="margin:12px 0 0 0;font-size:11px;color:rgba(240,235,216,0.25);">
            JUST WHY US · justwhyus.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
