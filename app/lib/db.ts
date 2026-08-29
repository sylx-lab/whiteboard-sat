import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';
import { deriveTotals } from './mockTests.ts';
import type {
  Course,
  MockTest,
  MockTestAttempt,
  PaymentSubmission,
  PracticeAttempt,
  PracticeSession,
  Question,
  ResourceItem,
  UserProfile,
  PaymentSettings,
  ProductPlan,
} from '../types.ts';

/**
 * Document shapes = the app types, with `id` moved to `_id` and the store's
 * legacy alias/derived fields dropped. See CLAUDE.md: `answer_choices` mirrors
 * `choices`, MockTest totals come from `deriveTotals`, `status` mirrors
 * `isSuspended`, `timestamp` mirrors `attemptedAt`. Persisting both halves is
 * how they drift, so only one is stored.
 */
type Doc<T extends { id: string }> = Omit<T, 'id'> & { _id: string };

export const fromDoc = <T extends { _id: string }>({ _id, ...rest }: T) => ({ id: _id, ...rest });
export const toDoc = <T extends { id: string }>({ id, ...rest }: T) => ({ _id: id, ...rest });

export type QuestionDoc = Doc<Omit<Question, 'answer_choices'>>;
export type CourseDoc = Doc<Course>;
export type ResourceDoc = Doc<ResourceItem>;
export type MockTestDoc = Doc<Omit<MockTest, 'totalQuestions' | 'totalTimeMinutes'>>;
export type MockAttemptDoc = Doc<MockTestAttempt>;
export type PracticeAttemptDoc = Doc<Omit<PracticeAttempt, 'timestamp'>>;
export type PaymentDoc = Doc<Omit<PaymentSubmission, 'createdAt' | 'productTitle'>>;
export type PracticeSessionDoc = Doc<PracticeSession>;
export type PaymentSettingsDoc = Doc<PaymentSettings>;
export type PlanDoc = Doc<ProductPlan>;
/**
 * courseProgress was its own localStorage key; it is 1:1 with a user, so it embeds.
 * `passwordHash` is DB-only and never leaves the server; see publicUser().
 */
export type UserDoc = Doc<Omit<UserProfile, 'status'>> & {
  courseProgress: Record<string, string[]>;
  passwordHash?: string;
};

/**
 * The only way a user document should reach the client. Destructuring rather
 * than a Mongo projection so the compiler also knows the secrets are gone.
 */
export const publicUser = (doc: UserDoc): UserProfile => {
  const { passwordHash: _hash, ...rest } = doc;
  return fromDoc(rest) as UserProfile;
};

/**
 * Doc -> app type. The Doc types above deliberately store one half of each
 * alias/derived pair; these put the mirror back, so client code that reads
 * `answer_choices`, `totalQuestions`, `createdAt`, `timestamp` or `status`
 * keeps working without the database holding two copies that can disagree.
 */
export const hydrate = {
  question: (d: QuestionDoc): Question => {
    const q = fromDoc(d) as Question;
    // `?? q.answer_choices` covers documents written before the seed used
    // dehydrate.question and stored the alias instead of `choices`.
    const choices = q.choices ?? q.answer_choices ?? [];
    return { ...q, choices, answer_choices: choices };
  },
  course: (d: CourseDoc): Course => fromDoc(d) as Course,
  resource: (d: ResourceDoc): ResourceItem => fromDoc(d) as ResourceItem,
  mockTest: (d: MockTestDoc): MockTest => {
    const t = fromDoc(d) as Omit<MockTest, 'totalQuestions' | 'totalTimeMinutes'>;
    return { ...t, ...deriveTotals(t.modules) };
  },
  mockAttempt: (d: MockAttemptDoc): MockTestAttempt => fromDoc(d) as MockTestAttempt,
  practiceAttempt: (d: PracticeAttemptDoc): PracticeAttempt => {
    const a = fromDoc(d) as Omit<PracticeAttempt, 'timestamp'>;
    return { ...a, timestamp: a.attemptedAt };
  },
  practiceSession: (d: PracticeSessionDoc): PracticeSession => fromDoc(d) as PracticeSession,
  payment: (d: PaymentDoc): PaymentSubmission => {
    const p = fromDoc(d) as Omit<PaymentSubmission, 'createdAt' | 'productTitle'>;
    return { ...p, createdAt: p.submittedAt, productTitle: p.productName };
  },
  paymentSettings: (d: PaymentSettingsDoc): PaymentSettings => fromDoc(d) as PaymentSettings,
  plan: (d: PlanDoc): ProductPlan => fromDoc(d) as ProductPlan,
  /** publicUser + the `status` mirror of isSuspended. Never returns passwordHash. */
  user: (d: UserDoc): UserProfile => {
    const u = publicUser(d);
    return { ...u, status: u.isSuspended ? 'suspended' : 'active' };
  },
};

/** App type -> doc, dropping the mirrors hydrate() puts back. */
export const dehydrate = {
  question: ({ answer_choices, ...q }: Question): QuestionDoc =>
    toDoc({ ...q, choices: q.choices ?? answer_choices ?? [] }),
  course: (c: Course): CourseDoc => toDoc(c),
  resource: (r: ResourceItem): ResourceDoc => toDoc(r),
  mockTest: ({ totalQuestions: _q, totalTimeMinutes: _m, ...t }: MockTest): MockTestDoc => toDoc(t),
  mockAttempt: (a: MockTestAttempt): MockAttemptDoc => toDoc(a),
  practiceAttempt: ({ timestamp: _t, ...a }: PracticeAttempt): PracticeAttemptDoc => toDoc(a),
  practiceSession: (s: PracticeSession): PracticeSessionDoc => toDoc(s),
  payment: ({ createdAt: _c, productTitle: _pt, ...p }: PaymentSubmission): PaymentDoc => toDoc(p),
  paymentSettings: (s: PaymentSettings): PaymentSettingsDoc => toDoc(s),
  plan: (p: ProductPlan): PlanDoc => toDoc(p),
};

// ponytail: no Mongoose. types.ts is already the schema, and the unique
// indexes below are the only constraints app code cannot enforce itself.
// Add $jsonSchema validators if untrusted writers ever reach the DB.

// ponytail: sized for serverless (Vercel-style), where each instance owns its
// own pool. On a single long-running Node server raise maxPoolSize to ~50 and
// minPoolSize to ~10.
// Cached on globalThis so `next dev` HMR reuses one pool instead of leaking one per reload.
const g = globalThis as { _mongo?: Promise<MongoClient> };
const connect = () => (g._mongo ??= new MongoClient(process.env.MONGODB_URI!, {
  maxPoolSize: 5,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 30_000,
  serverSelectionTimeoutMS: 5_000,
}).connect());

export async function db(): Promise<Db> {
  return (await connect()).db();
}

export const collections = {
  users: async () => (await db()).collection<UserDoc>('users'),
  questions: async () => (await db()).collection<QuestionDoc>('questions'),
  courses: async () => (await db()).collection<CourseDoc>('courses'),
  resources: async () => (await db()).collection<ResourceDoc>('resources'),
  mockTests: async () => (await db()).collection<MockTestDoc>('mockTests'),
  mockAttempts: async () => (await db()).collection<MockAttemptDoc>('mockAttempts'),
  practiceAttempts: async () => (await db()).collection<PracticeAttemptDoc>('practiceAttempts'),
  payments: async () => (await db()).collection<PaymentDoc>('payments'),
  practiceSessions: async () => (await db()).collection<PracticeSessionDoc>('practiceSessions'),
  paymentSettings: async () => (await db()).collection<PaymentSettingsDoc>('paymentSettings'),
  plans: async () => (await db()).collection<PlanDoc>('plans'),
};

/**
 * Timestamps stay ISO-8601 UTC strings, as the app types already have them:
 * they sort and range-query correctly as strings, so no conversion layer is
 * needed. Switch to BSON Date only if analytics needs $dateTrunc.
 */
export async function ensureIndexes() {
  const c = collections;
  await Promise.all([
    (await c.users()).createIndexes([
      { key: { phone: 1 }, unique: true, sparse: true },
      { key: { email: 1 }, unique: true, sparse: true },
      { key: { role: 1 } },
    ]),
    (await c.questions()).createIndexes([
      { key: { code: 1 }, unique: true },
      // the bank's drill-down + the editor's datalists
      { key: { domain: 1, topic: 1, status: 1 } },
      { key: { status: 1, is_free: 1 } },
      { key: { question_text: 'text', stimulus: 'text', topic: 'text' } },
    ]),
    (await c.courses()).createIndex({ slug: 1 }, { unique: true }),
    (await c.resources()).createIndex({ category: 1, subject: 1 }),
    (await c.mockAttempts()).createIndex({ userId: 1, startedAt: -1 }),
    (await c.practiceAttempts()).createIndexes([
      { key: { userId: 1, attemptedAt: -1 } },   // dashboard history
      { key: { userId: 1, domain: 1 } },         // domainStats breakdown
    ]),
    // resume-in-progress lookup; mock attempts already persisted, practice did not
    (await c.practiceSessions()).createIndex({ userId: 1, isCompleted: 1, startedAt: -1 }),
    (await c.payments()).createIndexes([
      { key: { status: 1, submittedAt: -1 } },   // admin verification queue
      { key: { userId: 1 } },
    ]),
  ]);
}

if (process.argv[1]?.endsWith('db.ts')) {
  await ensureIndexes();
  console.log('indexes ensured');
  await (await connect()).close();
}
