import { cookies } from 'next/headers';
import { COOKIE_NAME, MAX_AGE_SECONDS, passwordVersion, signToken, verifyToken } from './auth.ts';
import { collections, publicUser } from './db.ts';
import type { UserProfile } from '../types.ts';

// Split from auth.ts only so the token/password primitives stay unit-testable:
// `next/headers` does not resolve under `node --test`.

/** Takes the document, not the id, so the cookie carries the password version. */
export async function setAuthCookie(user: { _id: string; passwordHash?: string }) {
  (await cookies()).set(COOKIE_NAME, signToken(user._id, 'session', user.passwordHash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

/**
 * The token proves *identity* only. Role, permissions, access grants and
 * suspension are read from the database on every request, so an admin
 * suspending someone takes effect immediately instead of when their week-long
 * token expires. That, plus the password-version check below, is why there is
 * no session collection to revoke.
 */
export async function currentUser(): Promise<UserProfile | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const claims = token && verifyToken(token, 'session');
  if (!claims) return null;
  // passwordHash is needed for the version check, so it is read and discarded
  // here rather than projected away.
  const doc = await (await collections.users()).findOne({ _id: claims.sub });
  if (!doc || doc.isSuspended) return null;
  // A password change (including a reset) invalidates every existing cookie.
  if (claims.pv !== passwordVersion(doc.passwordHash)) return null;
  return publicUser(doc);
}
