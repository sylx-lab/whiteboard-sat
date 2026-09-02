import React from 'react';
import {
  Bookmark,
  Flag,
  Calculator,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  Sparkles,
  Play,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Clock,
  MessageSquareWarning,
} from 'lucide-react';
import { Question, QuestionInteractionState, AnswerChoice } from '../types';
import { MathRenderer } from './MathRenderer';
import { formatDomainName, getDifficultyColor } from '../lib/utils';
import { isSprQuestion, isSprAnswerCorrect } from '../lib/spr';

interface QuestionCardProps {
  question: Question;
  interactionState?: QuestionInteractionState;
  onSelectAnswer: (choiceId: 'A' | 'B' | 'C' | 'D') => void;
  onEnteredAnswer?: (value: string) => void;
  onToggleCrossOut: (choiceId: 'A' | 'B' | 'C' | 'D') => void;
  onToggleBookmark: () => void;
  onToggleMarkForReview: () => void;
  onSubmitAnswer?: () => void;
  onRetryProblem?: () => void;
  onNextQuestion?: () => void;
  isLocked?: boolean;
  onUnlock?: () => void;
  onOpenDesmos?: () => void;
  onOpenFormulas?: () => void;
  onReportIssue?: () => void;
  isCrossOutModeActive: boolean;
  onToggleCrossOutMode: () => void;
  showExplanationImmediately?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  interactionState,
  onSelectAnswer,
  onEnteredAnswer,
  onToggleCrossOut,
  onToggleBookmark,
  onToggleMarkForReview,
  onSubmitAnswer,
  onRetryProblem,
  onNextQuestion,
  isLocked = false,
  onUnlock,
  onOpenDesmos,
  onOpenFormulas,
  onReportIssue,
  isCrossOutModeActive,
  onToggleCrossOutMode,
  showExplanationImmediately = true,
}) => {
  const selectedAnswer = interactionState?.selectedAnswer || null;
  const enteredAnswer = interactionState?.enteredAnswer ?? null;
  const isSubmitted = interactionState?.isSubmitted || false;
  const isBookmarked = interactionState?.isBookmarked || false;
  const isMarkedForReview = interactionState?.isMarkedForReview || false;
  const crossedOutChoices = interactionState?.crossedOutChoices || [];
  const isSpr = isSprQuestion(question);
  const sprCorrect = isSpr ? isSprAnswerCorrect(question, enteredAnswer) : false;
  const canSubmitSpr = isSpr ? Boolean(String(enteredAnswer ?? '').trim()) : Boolean(selectedAnswer);

  // Normalize question text, stimulus, correct answer, and explanation across all schema formats
  const questionText =
    question.question_text ||
    (question as any).questionText ||
    (question as any).text ||
    (question as any).prompt ||
    (question as any).content ||
    (question as any).question ||
    '';

  const stimulusText =
    question.stimulus ||
    (question as any).passage ||
    (question as any).context ||
    '';

  const correctAnswer =
    question.correct_answer ||
    (question as any).correctAnswer ||
    (question as any).correct ||
    '';

  const explanationText =
    question.explanation ||
    (question as any).solution ||
    '';

  const normalizedChoices: AnswerChoice[] = React.useMemo(() => {
    const raw =
      question.choices ||
      question.answer_choices ||
      (question as any).options ||
      (question as any).answers;

    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((choice: any, index: number) => {
        if (typeof choice === 'string') {
          const letters: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
          return { id: letters[index] || 'A', text: choice };
        }
        return {
          id: (choice.id || choice.key || choice.label || choice.letter || ['A', 'B', 'C', 'D'][index] || 'A') as 'A' | 'B' | 'C' | 'D',
          text: choice.text ?? choice.value ?? choice.content ?? choice.option ?? '',
          imageUrl: choice.imageUrl ?? choice.image ?? choice.figureUrl,
        };
      });
    }
    if (typeof raw === 'object') {
      return (['A', 'B', 'C', 'D'] as const)
        .filter((id) => (raw as Record<string, any>)[id] !== undefined)
        .map((id) => {
          const val = (raw as Record<string, any>)[id];
          if (typeof val === 'object' && val !== null) {
            return {
              id,
              text: val.text ?? '',
              imageUrl: val.imageUrl ?? val.image,
            };
          }
          return {
            id,
            text: String(val || ''),
          };
        });
    }
    return [];
  }, [question]);

  const isCorrectSelection = isSubmitted
    ? isSpr
      ? sprCorrect
      : selectedAnswer === correctAnswer
    : false;

  const diffStyle = getDifficultyColor(question.difficulty);

  if (isLocked) {
    return (
      <div className="bg-(--surface) rounded-2xl border border-(--border) p-6 sm:p-8 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto text-(--brand-text) border border-teal-100">
          <Lock className="w-5 h-5" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-(--foreground-secondary)">{question.code}</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-(--brand-text) text-[10px] font-bold border border-teal-100">PREMIUM BANK</span>
          </div>
          <h3 className="text-base font-bold text-(--foreground)">
            {formatDomainName(question.domain)}: {question.topic}
          </h3>
          <p className="text-[13px] text-(--foreground-secondary) leading-relaxed">
            This advanced question is part of the White Board SAT verified premium question bank. Unlock the pass to access full explanations, interactive tools, and domain analytics.
          </p>
        </div>
        <button
          onClick={onUnlock}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-(--brand-cta) hover:bg-(--brand-hover) text-white text-[13px] font-semibold rounded-[10px] transition-colors shadow-xs cursor-pointer active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Unlock Full Question Bank
        </button>
      </div>
    );
  }

  const renderContentBody = () => (
    <div className="space-y-5">
      {/* Unified passage — stimulus + question appear as one continuous block, no separate headers */}
      {stimulusText && (
        <div className="text-[15px] sm:text-[15.5px] text-(--foreground) font-serif leading-[1.8] space-y-4">
          <MathRenderer content={stimulusText} />
        </div>
      )}

      {/* Figure — a diagram or graph the question refers to */}
      {question.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- an R2 URL, not a build-time asset
        <img
          src={question.imageUrl}
          alt="Figure for this question"
          className="max-h-80 w-auto max-w-full rounded-xl border border-(--border) bg-(--surface) object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}

      {/* Question Text */}
      <div className="text-[16px] sm:text-[18px] text-(--foreground) font-normal leading-[1.65] warp-break-words">
        <MathRenderer content={questionText} />
      </div>

      {/* Answer Input — SPR grid-in vs 4-choice MCQ */}
      {isSpr ? (
        <div className="space-y-3 pt-2">
          <div className={`rounded-xl border-2 p-4 space-y-3 ${isSubmitted ? (sprCorrect ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/30' : 'bg-rose-50 border-rose-500 ring-1 ring-rose-500/30') : 'bg-(--surface) border-(--border) focus-within:border-(--brand-cta) focus-within:ring-1 focus-within:ring-(--brand-cta)/30'}`}>
            <label htmlFor={`spr-input-${question.id}`} className="text-[11px] font-bold tracking-wider uppercase text-(--foreground-secondary)">
              Student-Produced Response — type your answer
            </label>
            <input
              id={`spr-input-${question.id}`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              spellCheck={false}
              placeholder="Enter number, decimal, or fraction (e.g. 7, 2.5, 3/4, -1.5)"
              value={enteredAnswer ?? ''}
              onChange={(e) => onEnteredAnswer?.(e.target.value)}
              disabled={isSubmitted}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitted && String(enteredAnswer ?? '').trim() && onSubmitAnswer) {
                  e.preventDefault();
                  onSubmitAnswer();
                }
              }}
              className={`w-full h-12 px-4 rounded-xl border bg-(--surface) text-[16px] font-mono font-medium text-(--foreground) placeholder:text-(--foreground-muted)/60 focus:outline-none ${isSubmitted ? 'border-transparent bg-transparent p-0 h-auto text-[18px]' : 'border-(--border)'}`}
            />
            {!isSubmitted && (
              <p className="text-[11px] text-(--foreground-secondary) leading-relaxed">
                Grid-in: enter as integer, decimal, or fraction. Equivalents count — e.g. <span className="font-mono font-semibold">.5</span> = <span className="font-mono font-semibold">1/2</span> = <span className="font-mono font-semibold">0.5</span>.
              </p>
            )}
            {isSubmitted && (
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                {sprCorrect ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct — your answer: <span className="font-mono">{enteredAnswer}</span>
                  </span>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800">
                      <XCircle className="w-4 h-4 text-rose-600" /> Your answer: <span className="font-mono">{enteredAnswer || '—'}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Correct: <span className="font-mono">{String(question.correct_answer)}</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {normalizedChoices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            const isCrossed = crossedOutChoices.includes(choice.id);
            const isCorrectChoice = choice.id === correctAnswer;
            const isUserWrongSelection = isSubmitted && isSelected && !isCorrectChoice;

            let cardStyle = 'bg-(--surface) border-(--border) hover:border-(--brand-cta)/60 hover:bg-(--brand-soft) text-(--foreground)';

            if (isCrossed) {
              cardStyle = 'bg-(--surface-soft)/60 border-(--border) text-(--foreground-muted) opacity-45';
            } else if (isSubmitted) {
              if (isCorrectChoice) {
                cardStyle = 'bg-emerald-50/80 border-2 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/30';
              } else if (isUserWrongSelection) {
                cardStyle = 'bg-rose-50/80 border-2 border-rose-500 text-rose-950 shadow-xs ring-1 ring-rose-500/30';
              } else {
                cardStyle = 'bg-(--surface) border-(--border) text-(--foreground-muted) opacity-70';
              }
            } else if (isSelected) {
              cardStyle = 'bg-teal-50/50 border-2 border-(--brand-cta) text-(--foreground) shadow-xs';
            }

            return (
              <div
                key={choice.id}
                role="button"
                tabIndex={isSubmitted || isCrossed ? -1 : 0}
                aria-label={`Choice ${choice.id}`}
                aria-disabled={isSubmitted || isCrossed}
                onClick={() => {
                  if (isSubmitted) return;
                  if (isCrossed) return;
                  if (isCrossOutModeActive) {
                    onToggleCrossOut(choice.id);
                  } else {
                    onSelectAnswer(choice.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isSubmitted || isCrossed) return;
                    if (isCrossOutModeActive) onToggleCrossOut(choice.id);
                    else onSelectAnswer(choice.id);
                  }
                }}
                className={`group/choice relative flex items-center justify-between min-h-13.5 sm:min-h-16 px-3.5 sm:px-5 py-3 rounded-xl border transition-all duration-150 cursor-pointer select-none active:scale-[0.99] touch-manipulation ${cardStyle}`}
              >
                {/* Left & Center Main Area */}
                <div className="flex items-center flex-1 mr-2 sm:mr-3 min-w-0">
                  {/* Choice Identifier */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-[12px] shrink-0 mr-3 sm:mr-4 transition-colors ${isSubmitted && isCorrectChoice
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isSubmitted && isUserWrongSelection
                        ? 'bg-rose-600 text-white shadow-xs'
                        : isSelected
                          ? 'bg-(--brand-cta) text-white shadow-xs'
                          : isCrossed
                            ? 'bg-(--border) text-(--foreground-muted) line-through'
                            : 'bg-(--surface-soft) text-(--foreground)'
                      }`}
                  >
                    {choice.id}
                  </div>

                  {/* Choice Text and Optional Graph/Figure */}
                  <div className={`flex-1 text-[14.5px] sm:text-[15px] font-normal leading-[1.55] wrap-break-word min-w-0 space-y-2 ${isCrossed ? 'line-through' : ''}`}>
                    {choice.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={choice.imageUrl}
                        alt={`Figure for choice ${choice.id}`}
                        className="max-h-48 w-auto rounded-lg border border-(--border) bg-(--surface) object-contain p-1.5 shadow-2xs"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    {choice.text && <MathRenderer content={choice.text} />}
                  </div>
                </div>

                {/* Right End: Strikethrough ABC Button & Indicators */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {!isSubmitted && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCrossOut(choice.id);
                      }}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-90 ${isCrossed
                        ? 'bg-(--navy-section) text-white border-(--foreground) shadow-sm'
                        : isCrossOutModeActive
                          ? 'bg-(--surface) text-(--foreground) border-(--border-strong) hover:bg-(--surface-soft) shadow-2xs'
                          : 'bg-(--surface) text-(--foreground-muted) border-(--border) opacity-85 sm:opacity-0 sm:group-hover/choice:opacity-100 hover:text-(--foreground) hover:border-(--border-strong) shadow-2xs'
                        }`}
                      title={`Eliminate option ${choice.id}`}
                    >
                      <span className="relative inline-block">
                        {choice.id}
                        <span className="absolute -inset-x-0.5 top-1/2 h-[1.5px] bg-current -translate-y-1/2 pointer-events-none" />
                      </span>
                    </button>
                  )}

                  {isSubmitted && isCorrectChoice && (
                    <div className="text-emerald-700 font-bold text-[12px] flex items-center gap-1.5 ml-1 sm:ml-2 bg-emerald-100/80 px-2 sm:px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="hidden sm:inline">Correct Answer</span>
                    </div>
                  )}
                  {isSubmitted && isUserWrongSelection && (
                    <div className="text-rose-700 font-bold text-[12px] flex items-center gap-1.5 ml-1 sm:ml-2 bg-rose-100/80 px-2 sm:px-2.5 py-1 rounded-lg">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="hidden sm:inline">Your Selection</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Instant Validation Alert Banner */}
      {isSubmitted && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in duration-200 ${isCorrectSelection
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
        >
          {isCorrectSelection ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div className="flex-1 text-[13.5px] font-semibold">
            {isCorrectSelection ? (
              <span>Correct! Great job on this question (+1 Verified Mastery).</span>
            ) : (
              <span>Incorrect · Review the step-by-step explanation & video walkthrough below.</span>
            )}
          </div>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
        {!isSubmitted ? (
          <button
            onClick={onSubmitAnswer}
            disabled={isSpr ? !canSubmitSpr : !selectedAnswer}
            className={`px-6 py-3.5 rounded-xl font-semibold text-[13.5px] transition-colors flex items-center gap-2 cursor-pointer ${(isSpr ? canSubmitSpr : !!selectedAnswer)
              ? 'bg-(--brand-cta) hover:bg-(--brand-hover) text-white shadow-xs'
              : 'bg-(--surface-soft) text-(--foreground-muted) cursor-not-allowed border border-(--border)'
              }`}
          >
            <span>Check Answer & Explanation</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {onRetryProblem && (
              <button
                onClick={onRetryProblem}
                className="px-5 py-3 bg-(--surface) hover:bg-(--surface-soft) text-(--foreground) font-semibold text-[13px] rounded-xl border border-(--border) transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-(--foreground-secondary)" />
                <span>Retry Problem</span>
              </button>
            )}

            {onNextQuestion && (
              <button
                onClick={onNextQuestion}
                className="px-6 py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13.5px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Comprehensive Explanation & Video Solution Panel */}
      {isSubmitted && showExplanationImmediately && (
        <div className="mt-8 pt-6 border-t border-(--border) space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-(--brand-soft) p-4 rounded-xl border border-teal-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-(--brand-cta) text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-(--foreground)">Step-by-Step Solution & Masterclass Walkthrough</h4>
                <p className="text-[12px] text-(--brand-text)">Verified College Board Digital SAT Standard Rationale</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-(--surface) text-(--brand-text) font-semibold text-[11px] border border-teal-200">
                {formatDomainName(question.domain)}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${diffStyle?.bg || 'bg-amber-50 text-amber-700'} ${diffStyle?.border || 'border-amber-200'}`}>
                {question.difficulty?.toUpperCase() || 'MEDIUM'}
              </span>
            </div>
          </div>

          {/* Concept Breakdown Rationale — only if explanation is provided */}
          {explanationText.trim() && (
            <div className="space-y-3">
              <h5 className="text-[12px] font-mono font-bold uppercase tracking-wider text-(--foreground-secondary)">Concept Rationale & Trap Avoidance</h5>
              <div className="p-5 rounded-xl bg-(--brand-soft) border border-(--border) text-[14px] text-(--foreground) leading-[1.65]">
                <MathRenderer content={explanationText} />
              </div>
            </div>
          )}

          {/* Key Strategy / Shortcut Tip Callout Box */}
          <div className="bg-(--brand-soft) border-l-4 border-(--brand-cta) p-4 rounded-r-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-(--brand-text) uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-(--brand-text)" />
              <span>SAT Test Day Shortcut & Speed Strategy</span>
            </div>
            <p className="text-[13px] text-(--foreground) leading-relaxed">
              For this question type, leverage the built-in Desmos graphing calculator or back-solve choice values directly to confirm equality in under 45 seconds. Watch out for negative sign distribution traps in step 2.
            </p>
          </div>

          {/* Embedded YouTube Video Walkthrough Panel — uses explanation_resource_link when set */}
          {(() => {
            const raw = (question.explanation_resource_link || '').trim();
            if (!raw) return null;
            let embed: string | null = null;
            try {
              const u = new URL(raw);
              if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) embed = `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
              else if (u.hostname === 'youtu.be') embed = `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
              else if (u.hostname.includes('youtube.com') && u.pathname.includes('/embed/')) embed = raw;
            } catch { /* not a URL, ignore */ }
            return (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-wider text-(--foreground)">
                    <Play className="w-3.5 h-3.5 text-(--brand-text) fill-(--brand-text)" />
                    <span>Instructor Video Breakdown</span>
                  </div>
                  <a
                    href={raw}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] text-(--brand-text) hover:text-(--brand-text) font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {embed ? (
                  <div className="rounded-xl overflow-hidden border border-(--border) bg-black shadow-xs aspect-video">
                    <iframe src={embed} title="Instructor Video Breakdown" className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                ) : (
                  <a href={raw} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border border-(--border) bg-(--navy-section) shadow-xs relative aspect-video flex flex-col items-center justify-center text-center p-6 group hover:opacity-95 transition-opacity">
                    <div className="relative z-20 flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-(--brand-cta) hover:bg-(--brand-hover) text-white flex items-center justify-center shadow-md transition-colors cursor-pointer">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                      <div>
                        <h6 className="text-white font-bold text-sm sm:text-base">White Board SAT Masterclass · Speed Breakdown & Concept Review</h6>
                        <p className="text-(--foreground-muted) text-xs mt-1">Instructor: Dr. Al-Mubin • 4 min walkthrough</p>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[11px] text-(--foreground-muted) font-mono">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 03:45 HD Walkthrough</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded text-white font-sans">Chapter 4: Solving Systems</span>
                    </div>
                  </a>
                )}
              </div>
            );
          })()}

          {question.explanation_resource_link && !(() => { try { const u=new URL(question.explanation_resource_link); return u.hostname.includes('youtube'); } catch { return false; } })() && (
            <div className="pt-1">
              <a
                href={question.explanation_resource_link}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-(--brand-text) hover:text-(--brand-text) font-semibold hover:underline inline-flex items-center gap-1.5"
              >
                <span>Review foundational concept in SAT Masterclass course &rarr;</span>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-(--surface) rounded-2xl border border-(--border) shadow-xs overflow-hidden transition-all">
      {/* Question Header & Meta Bar */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-(--brand-soft) border-b border-(--border) flex items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="font-mono font-bold text-(--foreground) bg-(--surface) px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-(--border) shadow-2xs text-[11px] sm:text-xs shrink-0">
            {question.code}
          </span>
          <span className="font-semibold text-(--foreground) truncate text-[11.5px] sm:text-[12px]">
            {formatDomainName(question.domain)}
          </span>
          <span className="text-(--foreground-muted) hidden sm:inline">•</span>
          <span className="text-(--foreground-secondary) hidden md:inline truncate">{question.topic}</span>
          <span className={`px-2 py-0.5 rounded-md text-[10.5px] sm:text-[11px] font-semibold border shrink-0 ${diffStyle?.bg || 'bg-amber-50 text-amber-700'} ${diffStyle?.border || 'border-amber-200'}`}>
            {question.difficulty?.toUpperCase() || 'MEDIUM'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {question.subject === 'math' && onOpenDesmos && (
            <button
              onClick={onOpenDesmos}
              className="hidden sm:flex h-8 sm:h-9 px-2.5 sm:px-3 items-center gap-1 sm:gap-1.5 text-(--foreground) hover:text-(--brand-text) bg-(--surface) hover:bg-(--brand-soft) border border-(--border) rounded-lg transition-colors font-medium text-[11px] sm:text-[12px] cursor-pointer"
              title="Open Desmos Graphing Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-(--brand-text)" />
              <span className="hidden md:inline">Desmos</span>
            </button>
          )}

          {question.subject === 'math' && onOpenFormulas && (
            <button
              onClick={onOpenFormulas}
              className="hidden sm:flex h-8 sm:h-9 px-2.5 sm:px-3 items-center gap-1 sm:gap-1.5 text-(--foreground) hover:text-(--brand-text) bg-(--surface) hover:bg-(--brand-soft) border border-(--border) rounded-lg transition-colors font-medium text-[11px] sm:text-[12px] cursor-pointer"
              title="Open Formula Reference Sheet"
            >
              <BookOpen className="w-3.5 h-3.5 text-(--brand-text)" />
              <span className="hidden md:inline">Formulas</span>
            </button>
          )}

          {/* ABC Elimination Toggle Button — hidden for SPR (no choices to eliminate) */}
          {!isSpr && (
            <button
              onClick={onToggleCrossOutMode}
              className={`h-8 sm:h-9 px-2 sm:px-3 flex items-center gap-1 sm:gap-1.5 rounded-lg border transition-colors font-semibold text-[11px] sm:text-[12px] cursor-pointer active:scale-95 ${isCrossOutModeActive
                ? 'bg-(--brand-cta) text-white border-(--brand-cta) shadow-xs'
                : 'bg-(--surface) text-(--foreground) hover:bg-(--brand-soft) border-(--border)'
                }`}
              title="Toggle Bluebook ABC answer elimination mode"
            >
              <span className="font-mono font-bold tracking-tight relative inline-block text-[11px] sm:text-xs">
                ABC
                <span className="absolute -inset-x-px top-1/2 h-[1.5px] bg-current -translate-y-1/2 pointer-events-none" />
              </span>
              <span className="hidden sm:inline font-medium">Eliminate</span>
            </button>
          )}

          <button
            onClick={onToggleMarkForReview}
            className={`h-8 sm:h-9 px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 rounded-lg border transition-colors cursor-pointer active:scale-95 ${isMarkedForReview
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-(--surface) text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--brand-soft) border-(--border)'
              }`}
            title={isMarkedForReview ? 'Marked for review' : 'Mark for review'}
          >
            <Flag className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Flag</span>
          </button>

          <button
            onClick={onToggleBookmark}
            className={`h-8 sm:h-9 px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 rounded-lg border transition-colors cursor-pointer active:scale-95 ${isBookmarked
              ? 'bg-teal-50 text-(--brand-text) border-teal-200'
              : 'bg-(--surface) text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--brand-soft) border-(--border)'
              }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark question'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-(--brand-text) text-(--brand-text)' : ''}`} />
            <span className="hidden sm:inline">Bookmark</span>
          </button>

          {onReportIssue && (
            <button
              onClick={onReportIssue}
              className="h-8 sm:h-9 px-2 sm:px-2.5 flex items-center gap-1 sm:gap-1.5 rounded-lg border border-(--border) bg-(--surface) text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--brand-soft) transition-colors cursor-pointer active:scale-95"
              title="Report an issue with this question"
            >
              <MessageSquareWarning className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified single-passage layout — no split pane, no "Reading Passage / Question Prompt" labels */}
      <div className="p-5 sm:p-8">
        {renderContentBody()}
      </div>
    </div>
  );
};
