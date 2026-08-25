import { collections, dehydrate, ensureIndexes } from './db.ts';
import {
  INITIAL_COURSES,
  INITIAL_MOCK_TESTS,
  INITIAL_QUESTIONS,
  INITIAL_RESOURCES,
} from '../data/seedData.ts';

/**
 * `npm run db:seed` — upserts the starting content: the question bank, courses,
 * resources and mock tests. Upsert, not insert, so re-running it is safe and
 * never clobbers edits to anything else.
 *
 * It creates no accounts. `npm run db:admin` is how the first admin is made.
 */

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

await Promise.all([
  upsert(await collections.questions(), INITIAL_QUESTIONS, dehydrate.question),
  upsert(await collections.courses(), INITIAL_COURSES, dehydrate.course),
  upsert(await collections.resources(), INITIAL_RESOURCES, dehydrate.resource),
  upsert(await collections.mockTests(), INITIAL_MOCK_TESTS, dehydrate.mockTest),
]);

await ensureIndexes();
console.log('seeded: questions, courses, resources, mock tests. No accounts — run `npm run db:admin`.');
process.exit(0);
