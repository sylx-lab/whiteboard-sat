import React from 'react';
import { Trophy, Target } from 'lucide-react';
import type { RankedLeader } from '../../lib/leaderboard';

/**
 * Public board — no session required to read it. Rendered on the server, so
 * there is no loading state and no fetch from the client.
 */
export const LeaderboardView: React.FC<{
  rows: RankedLeader[];
  currentUserId: string | null;
  totalQuestions: number;
}> = ({ rows, currentUserId, totalQuestions }) => {
  const you = rows.find((r) => r.userId === currentUserId);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14 space-y-6">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--brand-text)]">
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
          Most of the question bank solved
        </h1>
        <p className="text-[13px] text-[var(--foreground-secondary)] leading-relaxed max-w-xl">
          Counted from practice questions students solve on their own — one point per question
          answered correctly, however many attempts it took. Mock tests do not count, and solving the
          same question again does not either.
        </p>
      </header>

      {you && (
        <div className="rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand-soft)] p-4 flex items-center gap-4">
          <span className="text-[22px] font-bold font-mono tabular-nums text-[var(--brand-text)]">
            #{you.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[var(--foreground)]">That&apos;s you</p>
            <p className="text-[12px] text-[var(--foreground-secondary)]">
              {you.solved} solved · {you.accuracyPercent}% accuracy
            </p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center space-y-2">
          <Target className="w-6 h-6 text-[var(--foreground-secondary)] mx-auto" />
          <p className="text-[13px] font-semibold text-[var(--foreground)]">Nobody is on the board yet</p>
          <p className="text-[12px] text-[var(--foreground-secondary)]">
            The first correct answer in the practice bank takes first place.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-3 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface-soft)] text-[11px] font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">
            <span>Rank</span>
            <span>Student</span>
            <span className="text-right">Solved</span>
            <span className="text-right">Accuracy</span>
          </div>
          <ol>
            {rows.map((row) => {
              const isYou = row.userId === currentUserId;
              return (
                <li
                  key={row.userId}
                  className={`grid grid-cols-[3rem_1fr_5rem_5rem] gap-3 px-4 py-3 items-center border-b border-[var(--border)] last:border-b-0 text-[13px] ${
                    isYou ? 'bg-[var(--brand-soft)]' : ''
                  }`}
                >
                  <span
                    className={`font-mono tabular-nums font-bold ${
                      row.rank <= 3 ? 'text-[var(--brand-text)]' : 'text-[var(--foreground-secondary)]'
                    }`}
                  >
                    {row.rank}
                  </span>
                  <span className="text-[var(--foreground)] font-medium truncate">
                    {row.name}
                    {isYou && <span className="text-[var(--foreground-secondary)] font-normal"> · you</span>}
                  </span>
                  <span className="text-right font-mono tabular-nums font-semibold text-[var(--foreground)]">
                    {row.solved}
                  </span>
                  <span className="text-right font-mono tabular-nums text-[var(--foreground-secondary)]">
                    {row.accuracyPercent}%
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {totalQuestions > 0 && (
        <p className="text-[12px] text-[var(--foreground-secondary)]">
          {totalQuestions} questions in the bank to work through.
        </p>
      )}
    </div>
  );
};
