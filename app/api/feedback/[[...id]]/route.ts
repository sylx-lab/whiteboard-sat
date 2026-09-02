import { bad, denied, newId, readBody, requirePermission, requireUser } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import type { QuestionFeedback } from '../../../types.ts';

/**
 * A student flagging something wrong with a question. Reviewing it reuses
 * `canManagePractice` — the people who fix questions are the people who should
 * see reports about them, so this does not need a permission of its own.
 */
type Ctx = { params: Promise<{ id?: string[] }> };

/** GET /api/feedback — a student's own reports, or the full fix queue for staff. */
export async function GET(request: Request, ctx: Ctx) {
  const user = await requireUser();
  if (denied(user)) return user;
  const feedback = await collections.feedback();
  const id = (await ctx.params).id?.[0];

  if (id) {
    const doc = await feedback.findOne({ _id: id });
    if (!doc) return bad('Not found', 404);
    const item = hydrate.feedback(doc);
    const staff = await requirePermission('canManagePractice');
    if (item.userId !== user.id && denied(staff)) return staff;
    return Response.json({ item });
  }

  const staff = await requirePermission('canManagePractice');
  const filter: Record<string, unknown> = denied(staff) ? { userId: user.id } : {};
  const status = new URL(request.url).searchParams.get('status');
  if (status) filter.status = status;

  const docs = await feedback.find(filter).sort({ createdAt: -1 }).toArray();
  return Response.json({ items: docs.map(hydrate.feedback) });
}

/** POST /api/feedback — a signed-in student reporting an issue with a question. */
export async function POST(request: Request) {
  const user = await requireUser();
  if (denied(user)) return user;
  const body = await readBody(request);
  if (!body?.questionId || !String(body.message ?? '').trim()) {
    return bad('questionId and message are required');
  }

  const question = await (await collections.questions()).findOne({ _id: String(body.questionId) });
  if (!question) return bad('No such question', 404);

  const item: QuestionFeedback = {
    id: newId('fb'),
    questionId: question._id,
    questionCode: question.code,
    userId: user.id,
    userName: user.name,
    message: String(body.message).trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  await (await collections.feedback()).insertOne(dehydrate.feedback(item));
  return Response.json({ item }, { status: 201 });
}

/** PATCH /api/feedback/<id> — { status: 'open' | 'resolved' }, staff only. */
export async function PATCH(request: Request, ctx: Ctx) {
  const staff = await requirePermission('canManagePractice');
  if (denied(staff)) return staff;
  const id = (await ctx.params).id?.[0];
  if (!id) return bad('Which report? PATCH /api/feedback/<id>');

  const body = await readBody(request);
  const status = body?.status as QuestionFeedback['status'] | undefined;
  if (status !== 'open' && status !== 'resolved') {
    return bad("status must be 'open' or 'resolved'");
  }

  const feedback = await collections.feedback();
  const existing = await feedback.findOne({ _id: id });
  if (!existing) return bad('Not found', 404);

  const patch =
    status === 'resolved'
      ? { status, resolvedAt: new Date().toISOString(), resolvedBy: staff.name }
      : { status };
  await feedback.updateOne({ _id: id }, { $set: patch });

  return Response.json({ item: { ...hydrate.feedback(existing), ...patch } });
}
