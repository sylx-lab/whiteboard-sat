import { collections } from '../lib/db';
import { topSolvers } from '../lib/leaderboard';
import { currentUser } from '../lib/session';
import { LeaderboardView } from '../features/leaderboard/LeaderboardView';

export const metadata = { title: 'Leaderboard — White Board SAT' };

/**
 * A server component, unlike every other route here: the board is public data
 * with no interaction, so rendering it on the server skips the store, the fetch
 * and the loading state entirely. Reading the cookie is only to mark "you".
 */
export default async function LeaderboardPage() {
  const [rows, me, totalQuestions] = await Promise.all([
    topSolvers(),
    currentUser(),
    (await collections.questions()).countDocuments({ status: 'published' }),
  ]);

  return <LeaderboardView rows={rows} currentUserId={me?.id ?? null} totalQuestions={totalQuestions} />;
}
