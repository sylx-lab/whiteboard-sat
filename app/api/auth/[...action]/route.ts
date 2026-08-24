import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { collections, publicUser } from '../../../lib/db.ts';
import type { UserDoc } from '../../../lib/db.ts';
import {
  RESET_PASSWORD_TTL,
  VERIFY_EMAIL_TTL,
  hashPassword,
  passwordVersion,
  signToken,
  verifyPassword,
  verifyToken,
} from '../../../lib/auth.ts';
import { sendPasswordResetEmail, sendVerificationEmail } from '../../../lib/email.ts';
import { clearAuthCookie, currentUser, setAuthCookie } from '../../../lib/session.ts';

// ponytail: one catch-all instead of six route.ts files that would each be
// three lines of handler under ten lines of identical imports.
type Ctx = { params: Promise<{ action: string[] }> };

const STATE_COOKIE = 'wbsat_oauth_state';
const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

const newUser = (fields: Partial<UserDoc> & { name: string }): UserDoc => ({
  _id: `user-${Date.now()}-${randomBytes(3).toString('hex')}`,
  role: 'student',
  targetScore: 1550,
  createdAt: new Date().toISOString().split('T')[0],
  access: {
    premiumMath: false,
    premiumReadingWriting: false,
    redbookPractice: false,
    enrolledCourseIds: [],
    fullPremium: false,
  },
  courseProgress: {},
  ...fields,
});

export async function GET(request: Request, ctx: Ctx) {
  const { action } = await ctx.params;

  if (action[0] === 'me') {
    return Response.json({ user: await currentUser() });
  }

  if (action[0] === 'verify-email') return verifyEmail(request);
  if (action[0] === 'google' && action.length === 1) return googleRedirect(request);
  if (action[0] === 'google' && action[1] === 'callback') return googleCallback(request);

  return bad('Unknown auth route', 404);
}

export async function POST(request: Request, ctx: Ctx) {
  const { action } = await ctx.params;

  if (action[0] === 'logout') {
    await clearAuthCookie();
    return Response.json({ ok: true });
  }

  const body = await request.json().catch(() => null);
  if (!body) return bad('Expected a JSON body');
  const users = await collections.users();

  if (action[0] === 'register') {
    const { name, phone, email, password, targetScore } = body;
    if (!name?.trim() || !password) return bad('Name and password are required');
    if (!phone?.trim() && !email?.trim()) return bad('A phone number or email is required');
    if (password.length < 8) return bad('Password must be at least 8 characters');

    const clash = await users.findOne({
      $or: [phone ? { phone } : null, email ? { email } : null].filter(Boolean) as object[],
    });
    if (clash) return bad('An account with that phone or email already exists', 409);

    const doc = newUser({
      name: name.trim(),
      ...(phone?.trim() ? { phone: phone.trim() } : {}),
      ...(email?.trim() ? { email: email.trim().toLowerCase() } : {}),
      ...(targetScore ? { targetScore: Number(targetScore) } : {}),
      passwordHash: await hashPassword(password),
    });
    await users.insertOne(doc);
    if (doc.email) await emailVerification(doc, request);
    await setAuthCookie(doc);
    return Response.json({ user: publicUser(doc) }, { status: 201 });
  }

  if (action[0] === 'forgot-password') {
    const id = String(body.email ?? '').trim().toLowerCase();
    const doc = id ? await users.findOne({ $or: [{ email: id }, { phone: id }] }) : null;

    if (doc?.email) {
      const token = signToken(doc._id, 'reset_password', doc.passwordHash, RESET_PASSWORD_TTL);
      await sendPasswordResetEmail(
        doc.email,
        doc.name,
        appUrl(`/reset-password?token=${token}`, request),
      );
    }
    // Always the same answer: a different response for a missing account would
    // turn this endpoint into a check for who has one.
    return Response.json({ ok: true });
  }

  if (action[0] === 'reset-password') {
    const { token, password } = body;
    if (!token || !password) return bad('A reset token and a new password are required');
    if (password.length < 8) return bad('Password must be at least 8 characters');

    const claims = verifyToken(String(token), 'reset_password');
    const doc = claims && (await users.findOne({ _id: claims.sub }));
    // The token carries the password version it was issued under, so a link
    // that has already been used — or one issued before a later change — fails
    // here. That is what makes it single-use, with no token collection.
    if (!claims || !doc || claims.pv !== passwordVersion(doc.passwordHash)) {
      return bad('This reset link is invalid or has already been used. Request a new one.', 400);
    }

    const passwordHash = await hashPassword(password);
    await users.updateOne({ _id: doc._id }, { $set: { passwordHash } });
    // Signs out every other device: their cookies carry the old version.
    await setAuthCookie({ ...doc, passwordHash });
    return Response.json({ user: publicUser({ ...doc, passwordHash }) });
  }

  if (action[0] === 'resend-verification') {
    const me = await currentUser();
    if (!me) return bad('Sign in first', 401);
    if (me.emailVerifiedAt) return Response.json({ ok: true, alreadyVerified: true });
    const doc = await users.findOne({ _id: me.id });
    if (!doc?.email) return bad('Add an email address to your account first');
    await emailVerification(doc, request);
    return Response.json({ ok: true });
  }

  if (action[0] === 'login') {
    const { phoneOrEmail, password } = body;
    if (!phoneOrEmail?.trim() || !password) return bad('Enter your phone or email and password');
    const id = phoneOrEmail.trim();
    const doc = await users.findOne({ $or: [{ phone: id }, { email: id.toLowerCase() }] });

    // Always run the hash comparison so a missing account and a wrong password
    // take the same time — otherwise the endpoint enumerates who has an account.
    const ok = await verifyPassword(password, doc?.passwordHash);
    if (!doc || !ok) return bad('Incorrect phone/email or password', 401);
    if (doc.isSuspended) return bad('This account is suspended. Contact support.', 403);

    await setAuthCookie(doc);
    return Response.json({ user: publicUser(doc) });
  }

  return bad('Unknown auth route', 404);
}

// ---------------------------------------------------------------- Google OAuth

/** APP_URL overrides the request origin for link building behind a proxy. */
const appUrl = (path: string, request: Request) =>
  new URL(path, process.env.APP_URL ?? request.url).toString();

const redirectUri = (request: Request) => appUrl('/api/auth/google/callback', request);

function googleEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set');
  return { clientId, clientSecret };
}



async function googleRedirect(request: Request) {
  const { clientId } = googleEnv();
  const state = randomBytes(16).toString('base64url');

  // The state cookie is the CSRF check: the callback only proceeds if the state
  // Google hands back matches the one this browser was issued.
  (await cookies()).set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri(request),
    response_type: 'code',
    scope: 'openid email profile',
    state,
  }).toString();
  return Response.redirect(url, 302);
}

async function googleCallback(request: Request) {
  const { clientId, clientSecret } = googleEnv();
  const params = new URL(request.url).searchParams;
  const code = params.get('code');

  const jar = await cookies();
  const expectedState = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  if (!code || !expectedState || params.get('state') !== expectedState) {
    return bad('Google sign-in failed the state check. Please try again.', 401);
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri(request),
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return bad('Google rejected the sign-in code', 401);

  // The id_token came straight from Google's token endpoint over TLS using our
  // client secret, so per Google's own guidance its signature does not need
  // re-verifying here — which is why there is no JWKS fetch or JWT library.
  const { id_token: idToken } = (await tokenRes.json()) as { id_token?: string };
  const payload = idToken && JSON.parse(Buffer.from(idToken.split('.')[1] ?? '', 'base64url').toString() || 'null');
  if (!payload?.sub || !payload.email_verified) return bad('Google did not return a verified email', 401);

  const users = await collections.users();
  const email = String(payload.email).toLowerCase();
  let doc = await users.findOne({ $or: [{ googleId: payload.sub }, { email }] });

  if (!doc) {
    doc = newUser({
      name: payload.name || email,
      email,
      googleId: payload.sub,
      // Google already proved this address; email_verified was checked above.
      emailVerifiedAt: new Date().toISOString(),
    });
    await users.insertOne(doc);
  } else if (!doc.googleId) {
    // Existing password account with the same verified email — link, don't fork.
    await users.updateOne({ _id: doc._id }, { $set: { googleId: payload.sub } });
  }

  if (doc.isSuspended) return bad('This account is suspended. Contact support.', 403);
  await setAuthCookie(doc);
  return Response.redirect(new URL('/dashboard', request.url), 302);
}

// ------------------------------------------------------- Email verification

function emailVerification(doc: UserDoc, request: Request) {
  const token = signToken(doc._id, 'verify_email', doc.passwordHash, VERIFY_EMAIL_TTL);
  return sendVerificationEmail(
    doc.email!,
    doc.name,
    appUrl(`/api/auth/verify-email?token=${token}`, request),
  );
}

/**
 * Clicked from an email, so it answers with a redirect rather than JSON.
 * Verification is deliberately not a gate on signing in — phone is the primary
 * account key here, and blocking login on an unread email mostly generates
 * support tickets.
 */
async function verifyEmail(request: Request) {
  const token = new URL(request.url).searchParams.get('token');
  const claims = token && verifyToken(token, 'verify_email');
  if (!claims) return Response.redirect(appUrl('/dashboard?verified=expired', request), 302);

  const users = await collections.users();
  await users.updateOne(
    { _id: claims.sub, emailVerifiedAt: { $exists: false } },
    { $set: { emailVerifiedAt: new Date().toISOString() } },
  );
  return Response.redirect(appUrl('/dashboard?verified=1', request), 302);
}
