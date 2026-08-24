import { createHash, createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const COOKIE_NAME = 'wbsat_token';
export const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function secret(): Buffer {
  const s = process.env.JWT_SECRET;
  // Never fall back to a default: a guessable signing key forges any session.
  if (!s) throw new Error('JWT_SECRET is not set');
  return Buffer.from(s);
}

const b64 = (v: string | Buffer) => Buffer.from(v).toString('base64url');
const mac = (body: string) => createHmac('sha256', secret()).update(body).digest('base64url');

/**
 * Tokens are scoped so one cannot be spent as another: a session cookie is not
 * a password-reset token, and a reset link is not a login.
 */
export type TokenPurpose = 'session' | 'verify_email' | 'reset_password';

export interface TokenPayload {
  sub: string;
  exp: number;
  purpose: TokenPurpose;
  /** Ties the token to the password it was issued under; see passwordVersion. */
  pv: string;
}

/**
 * A short digest of the stored password hash. Embedding it in a token makes
 * every token self-invalidating the moment the password changes — which gives
 * single-use reset links and "signed out everywhere after a reset" without a
 * token collection to write, index, and expire.
 */
export const passwordVersion = (passwordHash?: string) =>
  createHash('sha256').update(passwordHash ?? 'none').digest('base64url').slice(0, 16);

/**
 * HS256 JWT, ~10 lines of node:crypto rather than a dependency.
 * `alg` is written into the header for interoperability but is never *read*
 * back on verify — the algorithm is pinned to HS256, so the classic
 * `alg: none` / RS256-key-confusion forgeries do not apply.
 */
export function signToken(
  userId: string,
  purpose: TokenPurpose,
  passwordHash?: string,
  ttlSeconds = MAX_AGE_SECONDS,
): string {
  const claims: TokenPayload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    purpose,
    pv: passwordVersion(passwordHash),
  };
  const body = `${b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${b64(JSON.stringify(claims))}`;
  return `${body}.${mac(body)}`;
}

/** Returns null unless the signature, expiry and purpose all check out. */
export function verifyToken(token: string, purpose: TokenPurpose): TokenPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = mac(`${header}.${payload}`);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as TokenPayload;
    if (typeof claims.sub !== 'string' || typeof claims.exp !== 'number') return null;
    if (claims.purpose !== purpose || typeof claims.pv !== 'string') return null;
    if (claims.exp * 1000 <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

/** scrypt is a real password KDF and it is in the stdlib, so no bcrypt/argon2 dependency. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const [scheme, salt, expected] = (stored ?? '').split('$');
  if (scheme !== 'scrypt' || !salt || !expected) return false;
  const key = await scrypt(password, Buffer.from(salt, 'base64url'), 64);
  const want = Buffer.from(expected, 'base64url');
  return key.length === want.length && timingSafeEqual(key, want);
}

export const VERIFY_EMAIL_TTL = 24 * 60 * 60;
export const RESET_PASSWORD_TTL = 60 * 60;
