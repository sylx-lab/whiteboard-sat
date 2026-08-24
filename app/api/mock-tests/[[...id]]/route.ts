import { canSeeMockTest, redactMockTest } from '../../../lib/access.ts';
import { crud, newId } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import type { MockTestDoc } from '../../../lib/db.ts';
import { deriveTotals, moduleTitle } from '../../../lib/mockTests.ts';
import type { MockTest } from '../../../types.ts';

const routes = crud<MockTest, MockTestDoc>({
  collection: collections.mockTests,
  permission: 'canManageMockTests',
  idPrefix: 'mock',
  toApp: hydrate.mockTest,
  toDoc: dehydrate.mockTest,
  normalize: (row, id) => {
    // A module stores copies of its questions, not ids, so a mock is a stable
    // snapshot — editing a question later cannot change a live exam.
    const modules = (row.modules ?? []).map((m, i) => ({
      ...m,
      id: m.id || newId(`mod${i + 1}`),
      testId: id,
      title: m.title || moduleTitle(m.section, m.moduleNumber),
      questions: m.questions ?? [],
    }));
    return {
      ...(row as MockTest),
      id,
      description: row.description ?? '',
      is_free: row.is_free ?? false,
      difficulty: row.difficulty ?? 'medium',
      modules,
      ...deriveTotals(modules),
    };
  },
  // The hub lists locked tests with a "Premium" badge and a real question
  // count, so the shape stays and the questions empty out.
  visibleTo: (test, user) => (canSeeMockTest(user, test) ? test : redactMockTest(test)),
});

export const { GET, POST, PATCH, DELETE } = routes;
