import { bad, denied, readBody, requireUser } from '../../lib/api.ts';
import { collections, hydrate } from '../../lib/db.ts';

/**
 * The signed-in user editing their own record: profile fields, lesson progress,
 * bookmarks. Deliberately narrow — role, permissions and access grants are not
 * writable here at any price; those live behind /api/users/<id>.
 *
 * Reading is /api/auth/me, which already returns the same object.
 */
export async function PATCH(request: Request) {
  const user = await requireUser();
  if (denied(user)) return user;
  const body = await readBody(request);
  if (!body) return bad('Expected a JSON body');

  const users = await collections.users();
  const set: Record<string, unknown> = {};

  if (typeof body.name === 'string' && body.name.trim()) set.name = body.name.trim();
  if (body.targetScore !== undefined) set.targetScore = Number(body.targetScore) || 1600;
  if (typeof body.examDate === 'string') set.examDate = body.examDate;
  if (Array.isArray(body.bookmarkedQuestionIds)) {
    set.bookmarkedQuestionIds = body.bookmarkedQuestionIds.map(String);
  }

  // { lessonToggle: { courseId, lessonId } } — read-modify-write, since which of
  // $addToSet / $pull applies is exactly what "toggle" means.
  const toggle = body.lessonToggle;
  if (toggle?.courseId && toggle?.lessonId) {
    const doc = await users.findOne({ _id: user.id });
    const done = doc?.courseProgress?.[toggle.courseId] ?? [];
    set[`courseProgress.${toggle.courseId}`] = done.includes(toggle.lessonId)
      ? done.filter((id) => id !== toggle.lessonId)
      : [...done, toggle.lessonId];
  }

  if (!Object.keys(set).length) return bad('Nothing to change');
  await users.updateOne({ _id: user.id }, { $set: set });

  const updated = await users.findOne({ _id: user.id });
  return Response.json({ user: updated ? hydrate.user(updated) : null });
}
