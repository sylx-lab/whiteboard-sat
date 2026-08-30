import React from 'react';
import { Flag } from 'lucide-react';
import { Question, QuestionInteractionState } from '../types';
import { isSprAnswerCorrect, isSprQuestion } from '../lib/spr';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  interactions: Record<string, QuestionInteractionState>;
  questionIds: string[];
  questions?: Question[];
  onSelectIndex: (index: number) => void;
  title?: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  totalQuestions,
  currentIndex,
  interactions,
  questionIds,
  questions = [],
  onSelectIndex,
  title = 'Practice Matrix',
}) => {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="bg-[var(--surface)] rounded-[16px] border border-[var(--border)] p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
        <h4 className="font-bold text-[var(--foreground)] text-[12px] uppercase tracking-[0.06em]">{title}</h4>
        <span className="text-[12px] text-[var(--foreground-secondary)] font-mono">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Grid of Question Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {questionIds.map((qId, index) => {
          const interaction = interactions[qId];
          const question = questionMap.get(qId);
          const isCurrent = index === currentIndex;
          const isSubmitted = interaction?.isSubmitted || false;
          const selectedAns = interaction?.selectedAnswer;
          const enteredAns = String(interaction?.enteredAnswer ?? '').trim();
          const isSpr = isSprQuestion(question ?? null);
          const isAnswered = isSpr ? !!enteredAns : !!selectedAns;
          const isCorrect = isSubmitted && question
            ? isSpr
              ? isSprAnswerCorrect(question, enteredAns)
              : selectedAns === question.correct_answer
            : false;
          const isIncorrect = isSubmitted && question ? isAnswered && !isCorrect : false;
          const isMarked = !!interaction?.isMarkedForReview;

          let btnClass = 'bg-[var(--brand-soft)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]';

          if (isCurrent) {
            btnClass = 'bg-[var(--brand-cta)] border-[var(--brand-cta)] text-white font-bold ring-2 ring-teal-200 shadow-xs';
          } else if (isCorrect) {
            btnClass = 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs';
          } else if (isIncorrect) {
            btnClass = 'bg-rose-500 border-rose-500 text-white font-bold shadow-xs';
          } else if (isAnswered) {
            btnClass = 'bg-teal-50 border-teal-200 text-[var(--brand-text)] font-semibold';
          }

          return (
            <button
              key={qId}
              onClick={() => onSelectIndex(index)}
              className={`relative h-11 rounded-[10px] border text-[12px] font-mono flex items-center justify-center transition-colors cursor-pointer ${btnClass}`}
            >
              <span>{index + 1}</span>

              {/* Review Flag Badge */}
              {isMarked && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Flag className="w-2.5 h-2.5 fill-white" />
                </div>
              )}

              {/* Answered dot indicator if not current and not submitted */}
              {!isCurrent && isAnswered && !isSubmitted && !isMarked && (
                <div className="absolute bottom-1 right-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-cta)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-[11px] text-[var(--foreground-secondary)]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[4px] bg-[var(--brand-cta)]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[4px] bg-emerald-600" />
          <span>Correct (+1)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[4px] bg-rose-500" />
          <span>Incorrect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Flagged</span>
        </div>
      </div>
    </div>
  );
};
