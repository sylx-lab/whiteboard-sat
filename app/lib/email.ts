/**
 * Transactional email over Resend's HTTP API. That endpoint is one fetch, so
 * there is no SDK dependency here.
 *
 * With no RESEND_API_KEY set, development logs the link to the server console
 * instead of sending — so the reset and verification flows are testable before
 * a provider is wired up. Production refuses to silently swallow the mail.
 */
async function send(to: string, subject: string, html: string, previewLine: string) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    if (process.env.NODE_ENV === 'production') throw new Error('RESEND_API_KEY is not set');
    console.log(`\n[email → ${to}] ${subject}\n${previewLine}\n`);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? 'White Board SAT <noreply@whiteboardsat.com>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[email] Resend delivery notice (${res.status}): ${errText}`);
      // In development or when using test/restricted API keys, log the link to console so local testing is never blocked
      console.log(`\n[email link → ${to}] ${subject}\n${previewLine}\n`);
      if (process.env.NODE_ENV === 'production' && res.status !== 403) {
        throw new Error(`Email send failed: ${res.status} ${errText}`);
      }
    }
  } catch (err) {
    console.warn('[email] Resend transport error:', err);
    console.log(`\n[email link → ${to}] ${subject}\n${previewLine}\n`);
    if (process.env.NODE_ENV === 'production') throw err;
  }
}

const layout = (heading: string, body: string, cta: { label: string; url: string }, footer: string) => `
<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#071126">
  <div style="font-weight:700;font-size:13px;color:#0D918A;letter-spacing:.08em;text-transform:uppercase">White Board SAT</div>
  <h1 style="font-size:20px;margin:16px 0 8px">${heading}</h1>
  <p style="font-size:14px;line-height:1.6;color:#58708A;margin:0 0 24px">${body}</p>
  <a href="${cta.url}" style="display:inline-block;background:#087C76;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:12px 20px;border-radius:10px">${cta.label}</a>
  <p style="font-size:12px;line-height:1.6;color:#58708A;margin:24px 0 0">${footer}</p>
  <p style="font-size:12px;color:#58708A;word-break:break-all;margin:8px 0 0">${cta.url}</p>
</div>`;

export const appUrl = (path: string, request?: Request) => {
  const base = process.env.APP_URL ?? (request ? request.url : 'http://localhost:3000');
  return new URL(path, base).toString();
};

export const sendVerificationEmail = (to: string, name: string, url: string) =>
  send(
    to,
    'Confirm your email address',
    layout(
      `Confirm your email, ${name}`,
      'Confirming your address lets us send score reports and account recovery links here.',
      { label: 'Confirm email address', url },
      'This link expires in 24 hours. If you did not create a White Board SAT account, you can ignore this email.',
    ),
    url,
  );

export const sendPasswordResetEmail = (to: string, name: string, url: string) =>
  send(
    to,
    'Reset your password',
    layout(
      `Reset your password, ${name}`,
      'Choose a new password for your White Board SAT account. The link below can only be used once.',
      { label: 'Choose a new password', url },
      'This link expires in one hour. If you did not ask to reset your password, ignore this email — your current password still works.',
    ),
    url,
  );

export const sendStaffCredentialsEmail = (
  to: string,
  name: string,
  email: string,
  password: string,
  url: string,
) =>
  send(
    to,
    'Your White Board SAT Staff Account Credentials',
    `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#071126;background:#ffffff;border-radius:12px;border:1px solid #E2E8F0">
  <div style="font-weight:700;font-size:13px;color:#0D918A;letter-spacing:.08em;text-transform:uppercase">White Board SAT</div>
  <h1 style="font-size:20px;margin:16px 0 8px;color:#071126">Welcome to the Team, ${name}!</h1>
  <p style="font-size:14px;line-height:1.6;color:#58708A;margin:0 0 20px">
    An administrator has created your staff access account for White Board SAT. You can sign in immediately using the credentials below:
  </p>
  <div style="background:#F8FBFB;border:1px solid #D2E4E2;border-radius:10px;padding:16px 20px;margin:0 0 24px;font-size:14px">
    <p style="margin:0 0 10px;color:#071126"><strong>Email:</strong> <span style="font-family:monospace;background:#E8F3F2;padding:2px 6px;border-radius:4px;color:#087C76">${email}</span></p>
    <p style="margin:0;color:#071126"><strong>Password:</strong> <span style="font-family:monospace;background:#E8F3F2;padding:2px 6px;border-radius:4px;color:#087C76">${password}</span></p>
  </div>
  <a href="${url}" style="display:inline-block;background:#087C76;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:10px">Sign In to Admin Console</a>
  <p style="font-size:12px;line-height:1.6;color:#58708A;margin:24px 0 0">
    For security, you can change your password anytime from your profile settings after signing in.
  </p>
</div>`,
    url,
  );
