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
        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#0D918A]">
          <Trophy className="w-3.5 h-3.5" />
          Leaderboard
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#071126]">
          Most of the question bank solved
        </h1>
        <p className="text-[13px] text-[#58708A] leading-relaxed max-w-xl">
          Counted from practice questions students solve on their own — one point per question
          answered correctly, however many attempts it took. Mock tests do not count, and solving the
          same question again does not either.
        </p>
      </header>

      {you && (
        <div className="rounded-2xl border border-[#0D918A]/30 bg-[#F1F8F7] p-4 flex items-center gap-4">
          <span className="text-[22px] font-bold font-mono tabular-nums text-[#087C76]">
            #{you.rank}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[#071126]">That&apos;s you</p>
            <p className="text-[12px] text-[#58708A]">
              {you.solved} solved · {you.accuracyPercent}% accuracy
            </p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-white p-10 text-center space-y-2">
          <Target className="w-6 h-6 text-[#58708A] mx-auto" />
          <p className="text-[13px] font-semibold text-[#071126]">Nobody is on the board yet</p>
          <p className="text-[12px] text-[#58708A]">
            The first correct answer in the practice bank takes first place.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-3 px-4 py-2.5 border-b border-[#E2E8F0] bg-[#F8FBFB] text-[11px] font-bold uppercase tracking-wider text-[#58708A]">
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
                  className={`grid grid-cols-[3rem_1fr_5rem_5rem] gap-3 px-4 py-3 items-center border-b border-[#E2E8F0] last:border-b-0 text-[13px] ${
                    isYou ? 'bg-[#F1F8F7]' : ''
                  }`}
                >
                  <span
                    className={`font-mono tabular-nums font-bold ${
                      row.rank <= 3 ? 'text-[#087C76]' : 'text-[#58708A]'
                    }`}
                  >
                    {row.rank}
                  </span>
                  <span className="text-[#071126] font-medium truncate">
                    {row.name}
                    {isYou && <span className="text-[#58708A] font-normal"> · you</span>}
                  </span>
                  <span className="text-right font-mono tabular-nums font-semibold text-[#071126]">
                    {row.solved}
                  </span>
                  <span className="text-right font-mono tabular-nums text-[#58708A]">
                    {row.accuracyPercent}%
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {totalQuestions > 0 && (
        <p className="text-[12px] text-[#58708A]">
          {totalQuestions} questions in the bank to work through.
        </p>
      )}
    </div>
  );
};
