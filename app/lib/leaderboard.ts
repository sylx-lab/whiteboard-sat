import { collections } from './db.ts';

/**
 * Who has solved the most of the question bank. Practice attempts only — a mock
 * test is a sitting, not self-directed solving, so it does not feed this.
 */
export interface LeaderRow {
  userId: string;
  name: string;
  /** Distinct questions answered correctly. */
  solved: number;
  /** Every attempt, including repeats and wrong ones. */
  attempted: number;
  correct: number;
}

export interface RankedLeader extends LeaderRow {
  accuracyPercent: number;
  rank: number;
}

/**
 * Sorting and rank assignment, kept pure so it is testable without a database.
 *
 * Ranks are competition-style: two people tied for 2nd are both 2nd and the next
 * is 4th. Ties break toward the higher accuracy, then toward fewer attempts —
 * solving 40 questions in 45 tries beats solving 40 in 300.
 */
export function rankLeaders(rows: LeaderRow[]): RankedLeader[] {
  const scored = rows.map((row) => ({
    ...row,
    accuracyPercent: row.attempted ? Math.round((row.correct / row.attempted) * 100) : 0,
  }));

  scored.sort(
    (a, b) =>
      b.solved - a.solved ||
      b.accuracyPercent - a.accuracyPercent ||
      a.attempted - b.attempted ||
      a.name.localeCompare(b.name),
  );

  let rank = 0;
  let previous: { solved: number; accuracyPercent: number } | null = null;
  return scored.map((row, index) => {
    if (!previous || previous.solved !== row.solved || previous.accuracyPercent !== row.accuracyPercent) {
      rank = index + 1;
      previous = { solved: row.solved, accuracyPercent: row.accuracyPercent };
    }
    return { ...row, rank };
  });
}

/**
 * `solved` counts **distinct** questions, not attempts: answering the same
 * question correctly ten times is one solve, so the board cannot be farmed by
 * re-answering one easy question.
 *
 * ponytail: aggregated on every request. It reads one index and the bank is
 * small; put a 60s `unstable_cache` around it if it ever shows up in traces.
 */
export async function topSolvers(limit = 50): Promise<RankedLeader[]> {
  const users = await collections.users();
  // Staff and admins author the bank, so they are not competing in it.
  const staff = await users.find({ role: { $ne: 'student' } }).project({ _id: 1 }).toArray();

  const attempts = await collections.practiceAttempts();
  const rows = await attempts
    .aggregate<LeaderRow>([
      { $match: { userId: { $nin: staff.map((s) => String(s._id)) } } },
      {
        $group: {
          _id: '$userId',
          attempted: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          solvedIds: { $addToSet: { $cond: ['$isCorrect', '$questionId', null] } },
        },
      },
      {
        $project: {
          attempted: 1,
          correct: 1,
          solved: { $size: { $setDifference: ['$solvedIds', [null]] } },
        },
      },
      { $match: { solved: { $gt: 0 } } },
      { $sort: { solved: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      // A suspended account keeps its attempts but leaves the public board.
      { $match: { 'user.isSuspended': { $ne: true } } },
      { $project: { _id: 0, userId: '$_id', name: '$user.name', solved: 1, attempted: 1, correct: 1 } },
    ])
    .toArray();

  return rankLeaders(rows);
}
