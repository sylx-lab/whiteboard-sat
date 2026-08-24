import { test } from 'node:test';
import assert from 'node:assert';

process.env.JWT_SECRET = 'test-secret-not-the-real-one';
const { signToken, verifyToken, passwordVersion, hashPassword, verifyPassword } =
  await import('./auth.ts');

const HASH = 'scrypt$abc$def';

test('a token round-trips and carries the user id', () => {
  assert.equal(verifyToken(signToken('user-1', 'session', HASH), 'session')?.sub, 'user-1');
});

test('a tampered payload is rejected', () => {
  const [header, , signature] = signToken('user-1', 'session', HASH).split('.');
  const forged = Buffer.from(
    JSON.stringify({ sub: 'admin', exp: 2 ** 31, purpose: 'session', pv: passwordVersion(HASH) }),
  ).toString('base64url');
  assert.equal(verifyToken(`${header}.${forged}.${signature}`, 'session'), null);
});

test('an unsigned "alg: none" token is rejected', () => {
  const none = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ sub: 'admin', exp: 2 ** 31, purpose: 'session', pv: 'x' }),
  ).toString('base64url');
  assert.equal(verifyToken(`${none}.${payload}.`, 'session'), null);
});

test('an expired token is rejected', () => {
  assert.equal(verifyToken(signToken('user-1', 'session', HASH, -1), 'session'), null);
});

test('garbage is rejected rather than throwing', () => {
  for (const junk of ['', 'a.b', 'a.b.c', 'a.b.c.d']) {
    assert.equal(verifyToken(junk, 'session'), null);
  }
});

test('a token cannot be spent for a different purpose', () => {
  const reset = signToken('user-1', 'reset_password', HASH);
  assert.equal(verifyToken(reset, 'session'), null, 'reset link must not be a login');
  assert.equal(verifyToken(reset, 'verify_email'), null);
  assert.ok(verifyToken(reset, 'reset_password'));

  const session = signToken('user-1', 'session', HASH);
  assert.equal(verifyToken(session, 'reset_password'), null, 'cookie must not reset a password');
});

test('the password version changes with the password, making reset links single-use', () => {
  const claims = verifyToken(signToken('user-1', 'reset_password', HASH), 'reset_password');
  assert.equal(claims?.pv, passwordVersion(HASH));
  // Redeeming the link rewrites the hash, so the same token no longer matches.
  assert.notEqual(claims?.pv, passwordVersion('scrypt$new$hash'));
  // An account with no password yet still gets a stable, non-empty version.
  assert.equal(passwordVersion(undefined), passwordVersion(undefined));
  assert.notEqual(passwordVersion(undefined), passwordVersion(HASH));
});

test('passwords verify against their own hash only', async () => {
  const hash = await hashPassword('correct horse battery');
  assert.ok(await verifyPassword('correct horse battery', hash));
  assert.equal(await verifyPassword('wrong', hash), false);
  assert.equal(await verifyPassword('anything', undefined), false);
  // salted: the same password must not produce the same hash twice
  assert.notEqual(hash, await hashPassword('correct horse battery'));
});
