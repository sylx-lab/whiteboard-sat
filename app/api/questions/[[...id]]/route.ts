import type { Filter } from 'mongodb';
import { can } from '../../../features/admin/lib/permissions.ts';
import { canSeeQuestion, redactQuestion } from '../../../lib/access.ts';
import { bad, crud, denied, readBody, requirePermission, today } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import type { QuestionDoc } from '../../../lib/db.ts';
import type { Question } from '../../../types.ts';

const routes = crud<Question, QuestionDoc>({
  collection: collections.questions,
  permission: 'canManagePractice',
  idPrefix: 'q',
  toApp: hydrate.question,
  toDoc: dehydrate.question,
  normalize: (row, id) => {
    const choices = row.choices ?? row.answer_choices ?? [];
    return {
      ...(row as Question),
      id,
      choices,
      answer_choices: choices,
      status: row.status ?? 'draft',
      is_free: row.is_free ?? false,
      created_at: row.created_at ?? today(),
      updated_at: today(),
    };
  },
  visibleTo: (q, user) => (canSeeQuestion(user, q) ? q : redactQuestion(q)),
  query: (params, user) => {
    const filter: Record<string, unknown> = {};
    for (const key of ['domain', 'subject', 'topic', 'subtopic', 'source', 'difficulty', 'status']) {
      const value = params.get(key);
      if (value) filter[key] = value;
    }
    const search = params.get('q');
    if (search) filter.$text = { $search: search };
    // Drafts and archived questions are the bank's private workings; the
    // student-facing filters above must never surface them.
    if (!can(user, 'canManagePractice')) filter.status = 'published';
    return filter as Filter<QuestionDoc>;
  },
});

export const { GET, POST, DELETE } = routes;

/**
 * With an id: edit one question. Without one: the Topics view's bulk rename,
 * `[{ id, topic }]` — one round trip for a merge that touches 40 questions,
 * mirroring store.applyTopicUpdates writing them in a single state update.
 */
export async function PATCH(request: Request, ctx: { params: Promise<{ id?: string[] }> }) {
  const id = (await ctx.params).id?.[0];
  if (id) return routes.PATCH(request, ctx);

  const user = await requirePermission('canManagePractice');
  if (denied(user)) return user;
  const body = await readBody(request);
  if (!Array.isArray(body)) return bad('Expected [{ id, topic }] for a bulk topic update');
  const updates = body.filter((u) => typeof u?.id === 'string' && typeof u?.topic === 'string');
  if (!updates.length) return bad('Nothing to update');

  const questions = await collections.questions();
  const { modifiedCount } = await questions.bulkWrite(
    updates.map((u) => ({
      updateOne: {
        filter: { _id: u.id },
        update: { $set: { topic: u.topic, updated_at: today() } },
      },
    })),
  );
  return Response.json({ ok: true, updated: modifiedCount });
}
