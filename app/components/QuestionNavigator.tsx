import React from 'react';
import { Flag } from 'lucide-react';
import { Question, QuestionInteractionState } from '../types';

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
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-1 border-b border-[#E2E8F0]">
        <h4 className="font-bold text-[#071126] text-[12px] uppercase tracking-[0.06em]">{title}</h4>
        <span className="text-[12px] text-[#58708A] font-mono">
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
          const isCorrect = isSubmitted && question && selectedAns === question.correct_answer;
          const isIncorrect = isSubmitted && question && selectedAns && selectedAns !== question.correct_answer;
          const isAnswered = !!selectedAns;
          const isMarked = !!interaction?.isMarkedForReview;

          let btnClass = 'bg-[#F1F8F7] border-[#E2E8F0] text-[#071126] hover:bg-slate-100';

          if (isCurrent) {
            btnClass = 'bg-[#087C76] border-[#087C76] text-white font-bold ring-2 ring-teal-200 shadow-xs';
          } else if (isCorrect) {
            btnClass = 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs';
          } else if (isIncorrect) {
            btnClass = 'bg-rose-500 border-rose-500 text-white font-bold shadow-xs';
          } else if (isAnswered) {
            btnClass = 'bg-teal-50 border-teal-200 text-[#087C76] font-semibold';
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
                  <div className="w-1.5 h-1.5 rounded-full bg-[#087C76]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-[#E2E8F0] grid grid-cols-2 gap-2 text-[11px] text-[#58708A]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-[4px] bg-[#087C76]" />
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
