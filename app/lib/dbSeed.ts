import { collections, dehydrate, ensureIndexes } from './db.ts';
import { hashPassword } from './auth.ts';
import {
  DEMO_ADMIN,
  DEMO_STUDENT,
  INITIAL_COURSES,
  INITIAL_MOCK_TESTS,
  INITIAL_QUESTIONS,
  INITIAL_RESOURCES,
} from '../data/seedData.ts';

/**
 * `npm run db:seed` — upserts the seed content so a fresh database matches what
 * localStorage used to fall back to. Upsert, not insert, so re-running it is
 * safe and never clobbers real accounts' progress.
 */
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'whiteboard123';

async function upsert<T extends { id: string }>(
  collection: { updateOne: (f: object, u: object, o: object) => Promise<unknown> },
  rows: T[],
  // The same doc mapper the API routes write through, so the seed cannot store
  // a shape the readers do not expect (it used to save `answer_choices`, which
  // QuestionDoc drops, leaving every seeded question with no choices).
  toDocument: (row: T) => { _id: string },
) {
  await Promise.all(
    rows.map((row) => {
      const { _id, ...rest } = toDocument(row);
      return collection.updateOne({ _id }, { $set: rest, $setOnInsert: { _id } }, { upsert: true });
    }),
  );
}

const passwordHash = await hashPassword(DEMO_PASSWORD);
const users = await collections.users();

await Promise.all([
  upsert(await collections.questions(), INITIAL_QUESTIONS, dehydrate.question),
  upsert(await collections.courses(), INITIAL_COURSES, dehydrate.course),
  upsert(await collections.resources(), INITIAL_RESOURCES, dehydrate.resource),
  upsert(await collections.mockTests(), INITIAL_MOCK_TESTS, dehydrate.mockTest),
  ...[DEMO_STUDENT, DEMO_ADMIN].map(({ id, status: _status, ...rest }) =>
    users.updateOne(
      { _id: id },
      { $set: rest, $setOnInsert: { _id: id, courseProgress: {}, passwordHash } },
      { upsert: true },
    ),
  ),
]);

await ensureIndexes();
console.log(`seeded. demo login: ${DEMO_STUDENT.phone} / ${DEMO_PASSWORD}`);
process.exit(0);
