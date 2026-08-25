import { randomBytes } from 'node:crypto';
import { collections, ensureIndexes, hydrate } from './db.ts';
import type { UserDoc } from './db.ts';
import { hashPassword } from './auth.ts';

/**
 * `npm run db:admin -- "Name" <phone-or-email> [password]`
 *
 * Registration always creates a student and only an admin can promote anyone,
 * so a fresh database has no way in. This is that way in, and the only one:
 * there is no seeded account and no default password anywhere in the app.
 *
 * Run against an existing account, it promotes it instead of failing — which is
 * also how you hand the role to a real person rather than to a script's account.
 */
const [name, login, givenPassword] = process.argv.slice(2);

if (!name || !login) {
  console.error('Usage: npm run db:admin -- "Full Name" <phone-or-email> [password]');
  process.exit(1);
}

const isEmail = login.includes('@');
const identity = isEmail ? { email: login.trim().toLowerCase() } : { phone: login.trim() };

const users = await collections.users();
const existing = await users.findOne(identity);

if (existing) {
  await users.updateOne(
    { _id: existing._id },
    // permissions stay untouched: a full admin's are implicit (permissionsFor),
    // so there is nothing to grant, and nothing to accidentally take away.
    { $set: { role: 'admin', isSuspended: false } },
  );
  console.log(`Promoted ${existing.name} (${login}) to admin. Their password is unchanged.`);
  process.exit(0);
}

// Generated rather than defaulted: a printed-once random password cannot become
// the password every deployment of this app shares.
const password = givenPassword ?? randomBytes(9).toString('base64url');

const doc: UserDoc = {
  _id: `user-${Date.now()}-${randomBytes(3).toString('hex')}`,
  name: name.trim(),
  ...identity,
  role: 'admin',
  targetScore: 1600,
  createdAt: new Date().toISOString().split('T')[0],
  access: {
    premiumMath: true,
    premiumReadingWriting: true,
    redbookPractice: true,
    enrolledCourseIds: [],
    fullPremium: true,
  },
  courseProgress: {},
  passwordHash: await hashPassword(password),
  ...(isEmail ? { emailVerifiedAt: new Date().toISOString() } : {}),
};

await ensureIndexes();
await users.insertOne(doc);

console.log(`Created admin ${hydrate.user(doc).name} — sign in with ${login}`);
if (!givenPassword) console.log(`Password (shown once): ${password}`);
process.exit(0);
