import { can } from '../../../features/admin/lib/permissions.ts';
import { canSeeMockTest, canSeeQuestion } from '../../../lib/access.ts';
import { bad, denied, readBody, requireUser } from '../../../lib/api.ts';
import { collections, dehydrate, hydrate } from '../../../lib/db.ts';
import { scoreAttempt } from '../../../lib/mockTests.ts';
import type { MockTestAttempt, PracticeAttempt, PracticeSession } from '../../../types.ts';

/**
 * Everything a student produces: graded practice attempts, mock test attempts,
 * and the in-progress practice session that survives a reload.
 *
 * One route rather than three because they share the same two rules — the
 * server decides whose they are, and the server does the grading. A client that
 * can post its own `isCorrect` or `scoreSummary` can post a 1600.
 */
type Ctx = { params: Promise<{ kind?: string[] }> };

/** GET /api/attempts — the signed-in user's history, for the dashboard. */
export async function GET(request: Request) {
  const user = await requireUser();
  if (denied(user)) return user;

  // Staff can read one student's history from the student detail view.
  const asked = new URL(request.url).searchParams.get('userId');
  const userId = asked && can(user, 'canManageStudents') ? asked : user.id;

  // ponytail: unbounded read, correct until someone racks up thousands of
  // attempts. Aggregate the dashboard's stats server-side when that happens.
  const [practice, mock, session] = await Promise.all([
    (await collections.practiceAttempts()).find({ userId }).sort({ attemptedAt: -1 }).toArray(),
    (await collections.mockAttempts()).find({ userId }).sort({ startedAt: -1 }).toArray(),
    (await collections.practiceSessions())
      .find({ userId, isCompleted: false })
      .sort({ startedAt: -1 })
      .limit(1)
      .next(),
  ]);

  return Response.json({
    practice: practice.map(hydrate.practiceAttempt),
    mock: mock.map(hydrate.mockAttempt),
    session: session ? hydrate.practiceSession(session) : null,
  });
}

/** POST /api/attempts/practice — { questionId, selectedAnswer, timeSpentSeconds }. */
export async function POST(request: Request, ctx: Ctx) {
  const { kind } = await ctx.params;
  if (kind?.[0] !== 'practice') return bad('POST /api/attempts/practice', 404);

  const user = await requireUser();
  if (denied(user)) return user;
  const body = await readBody(request);
  if (!body?.questionId || !body.selectedAnswer) {
    return bad('questionId and selectedAnswer are required');
  }

  const doc = await (await collections.questions()).findOne({ _id: String(body.questionId) });
  if (!doc) return bad('No such question', 404);
  const question = hydrate.question(doc);
  if (!canSeeQuestion(user, question)) return bad('That question is locked', 403);

  const now = new Date().toISOString();
  // The correct answer is read here, not taken from the request: grading is the
  // whole reason this endpoint exists.
  const attempt: PracticeAttempt = {
    id: `att-${Date.now()}`,
    userId: user.id,
    questionId: question.id,
    questionCode: question.code,
    selectedAnswer: body.selectedAnswer,
    correctAnswer: question.correct_answer,
    isCorrect: body.selectedAnswer === question.correct_answer,
    timeSpentSeconds: Number(body.timeSpentSeconds) || 0,
    attemptedAt: now,
    timestamp: now,
    domain: question.domain,
    subject: question.subject,
    difficulty: question.difficulty,
  };
  await (await collections.practiceAttempts()).insertOne(dehydrate.practiceAttempt(attempt));
  return Response.json({ item: attempt }, { status: 201 });
}

/**
 * PUT /api/attempts/mock/<id> — save or finalize a mock attempt.
 * PUT /api/attempts/session/<id> — save the in-progress practice session.
 *
 * Upserts, because both are saved repeatedly as the student works and the id is
 * minted client-side when the attempt starts.
 */
export async function PUT(request: Request, ctx: Ctx) {
  const { kind } = await ctx.params;
  const [what, id] = kind ?? [];
  if (!id) return bad('PUT /api/attempts/{mock,session}/<id>', 404);

  const user = await requireUser();
  if (denied(user)) return user;
  const body = await readBody(request);
  if (!body) return bad('Expected a JSON body');

  if (what === 'session') {
    const sessions = await collections.practiceSessions();
    const existing = await sessions.findOne({ _id: id });
    if (existing && existing.userId !== user.id) return bad('Not your session', 403);
    const session: PracticeSession = {
      ...(body as PracticeSession),
      id,
      userId: user.id,
      startedAt: existing?.startedAt ?? body.startedAt ?? new Date().toISOString(),
      isCompleted: body.isCompleted ?? false,
    };
    await sessions.replaceOne({ _id: id }, dehydrate.practiceSession(session), { upsert: true });
    return Response.json({ item: session });
  }

  if (what !== 'mock') return bad('PUT /api/attempts/{mock,session}/<id>', 404);

  const attempts = await collections.mockAttempts();
  const existing = await attempts.findOne({ _id: id });
  if (existing && existing.userId !== user.id) return bad('Not your attempt', 403);
  // A submitted attempt is final — otherwise a resit could be posted over it.
  if (existing?.status === 'completed') return bad('This attempt is already submitted', 409);

  const testDoc = await (await collections.mockTests()).findOne({
    _id: String(existing?.testId ?? body.testId ?? ''),
  });
  if (!testDoc) return bad('No such mock test', 404);
  const test = hydrate.mockTest(testDoc);
  if (!canSeeMockTest(user, test)) return bad('That mock test is locked', 403);

  const finishing = body.status === 'completed';
  const attempt: MockTestAttempt = {
    ...(body as MockTestAttempt),
    id,
    userId: user.id,
    testId: test.id,
    testTitle: test.title,
    startedAt: existing?.startedAt ?? body.startedAt ?? new Date().toISOString(),
    status: finishing ? 'completed' : 'in_progress',
    ...(finishing
      ? {
          completedAt: new Date().toISOString(),
          scoreSummary: scoreAttempt(test, body.interactions ?? {}),
        }
      : { scoreSummary: undefined }),
  };

  await attempts.replaceOne({ _id: id }, dehydrate.mockAttempt(attempt), { upsert: true });
  return Response.json({ item: attempt });
}
