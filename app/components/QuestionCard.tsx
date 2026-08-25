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
} from 'lucide-react';
import { Question, QuestionInteractionState } from '../types';
import { MathRenderer } from './MathRenderer';
import { formatDomainName, getDifficultyColor } from '../lib/utils';

interface QuestionCardProps {
  question: Question;
  interactionState?: QuestionInteractionState;
  onSelectAnswer: (choiceId: 'A' | 'B' | 'C' | 'D') => void;
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
  isCrossOutModeActive: boolean;
  onToggleCrossOutMode: () => void;
  showExplanationImmediately?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  interactionState,
  onSelectAnswer,
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
  isCrossOutModeActive,
  onToggleCrossOutMode,
  showExplanationImmediately = true,
}) => {
  const selectedAnswer = interactionState?.selectedAnswer || null;
  const isSubmitted = interactionState?.isSubmitted || false;
  const isBookmarked = interactionState?.isBookmarked || false;
  const isMarkedForReview = interactionState?.isMarkedForReview || false;
  const crossedOutChoices = interactionState?.crossedOutChoices || [];

  const isCorrectSelection = isSubmitted && selectedAnswer === question.correct_answer;

  const diffStyle = getDifficultyColor(question.difficulty);

  if (isLocked) {
    return (
      <div className="bg-[var(--surface)] rounded-[16px] border border-[var(--border)] p-8 text-center space-y-5 shadow-xs">
        <div className="w-12 h-12 bg-teal-50 rounded-[12px] flex items-center justify-center mx-auto text-[var(--brand-text)] border border-teal-100">
          <Lock className="w-5 h-5" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">{question.code}</span>
            <span className="px-2 py-0.5 rounded bg-teal-50 text-[var(--brand-text)] text-[10px] font-bold border border-teal-100">PREMIUM BANK</span>
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            {formatDomainName(question.domain)}: {question.topic}
          </h3>
          <p className="text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
            This advanced question is part of the White Board SAT verified premium question bank. Unlock the pass to access full explanations, interactive tools, and domain analytics.
          </p>
        </div>
        <button
          onClick={onUnlock}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white text-[13px] font-semibold rounded-[10px] transition-colors shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Unlock Full Question Bank
        </button>
      </div>
    );
  }

  const renderContentBody = () => (
    <div className="space-y-5">
      {/* Figure — a diagram or graph the question refers to */}
      {question.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- an R2 URL, not a build-time asset
        <img
          src={question.imageUrl}
          alt="Figure for this question"
          className="max-h-80 w-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] object-contain"
        />
      )}

      {/* Question Text */}
      <div className="text-[17px] sm:text-[18px] text-[var(--foreground)] font-normal leading-[1.65]">
        <MathRenderer content={question.question_text} />
      </div>

      {/* Answer Choices */}
      <div className="space-y-3 pt-2">
        {(question.answer_choices || question.choices || []).map((choice) => {
          const isSelected = selectedAnswer === choice.id;
          const isCrossed = crossedOutChoices.includes(choice.id);
          const isCorrectChoice = choice.id === question.correct_answer;
          const isUserWrongSelection = isSubmitted && isSelected && !isCorrectChoice;

          let cardStyle = 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--brand-cta)]/60 hover:bg-[var(--brand-soft)] text-[var(--foreground)]';

          if (isCrossed) {
            cardStyle = 'bg-[var(--surface-soft)]/60 border-[var(--border)] text-[var(--foreground-muted)] opacity-45';
          } else if (isSubmitted) {
            if (isCorrectChoice) {
              cardStyle = 'bg-emerald-50/80 border-2 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/30';
            } else if (isUserWrongSelection) {
              cardStyle = 'bg-rose-50/80 border-2 border-rose-500 text-rose-950 shadow-xs ring-1 ring-rose-500/30';
            } else {
              cardStyle = 'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-muted)] opacity-70';
            }
          } else if (isSelected) {
            cardStyle = 'bg-teal-50/50 border-2 border-[var(--brand-cta)] text-[var(--foreground)] shadow-xs';
          }

          return (
            <div
              key={choice.id}
              onClick={() => {
                if (isSubmitted) return;
                if (isCrossed) return;
                if (isCrossOutModeActive) {
                  onToggleCrossOut(choice.id);
                } else {
                  onSelectAnswer(choice.id);
                }
              }}
              className={`group/choice relative flex items-center justify-between min-h-[58px] sm:min-h-[64px] px-4 sm:px-5 py-3 rounded-[12px] border transition-all duration-150 cursor-pointer select-none ${cardStyle}`}
            >
              {/* Left & Center Main Area */}
              <div className="flex items-center flex-1 mr-3">
                {/* Choice Identifier */}
                <div
                  className={`w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-[12px] shrink-0 mr-4 transition-colors ${isSubmitted && isCorrectChoice
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isSubmitted && isUserWrongSelection
                        ? 'bg-rose-600 text-white shadow-xs'
                        : isSelected
                          ? 'bg-[var(--brand-cta)] text-white shadow-xs'
                          : isCrossed
                            ? 'bg-[var(--border)] text-[var(--foreground-muted)] line-through'
                            : 'bg-[var(--surface-soft)] text-[var(--foreground)]'
                    }`}
                >
                  {choice.id}
                </div>

                {/* Choice Text */}
                <div className={`flex-1 text-[15px] font-normal leading-[1.55] ${isCrossed ? 'line-through' : ''}`}>
                  <MathRenderer content={choice.text} />
                </div>
              </div>

              {/* Right End: Strikethrough ABC Button & Indicators */}
              <div className="flex items-center gap-2 shrink-0">
                {!isSubmitted && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleCrossOut(choice.id);
                    }}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${isCrossed
                        ? 'bg-[var(--navy-section)] text-white border-[var(--foreground)] shadow-sm'
                        : isCrossOutModeActive
                          ? 'bg-[var(--surface)] text-[var(--foreground)] border-[var(--border-strong)] hover:bg-[var(--surface-soft)] shadow-2xs'
                          : 'bg-[var(--surface)] text-[var(--foreground-muted)] border-[var(--border)] opacity-0 group-hover/choice:opacity-100 hover:text-[var(--foreground)] hover:border-[var(--border-strong)] shadow-2xs'
                      }`}
                    title={`Eliminate option ${choice.id}`}
                  >
                    <span className="relative inline-block">
                      {choice.id}
                      <span className="absolute inset-x-[-2px] top-1/2 h-[1.5px] bg-current -translate-y-1/2 pointer-events-none" />
                    </span>
                  </button>
                )}

                {isSubmitted && isCorrectChoice && (
                  <div className="text-emerald-700 font-bold text-[12px] flex items-center gap-1.5 ml-2 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Correct Answer</span>
                  </div>
                )}
                {isSubmitted && isUserWrongSelection && (
                  <div className="text-rose-700 font-bold text-[12px] flex items-center gap-1.5 ml-2 bg-rose-100/80 px-2.5 py-1 rounded-lg">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="hidden sm:inline">Your Selection</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Instant Validation Alert Banner */}
      {isSubmitted && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in duration-200 ${isCorrectSelection
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
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
            disabled={!selectedAnswer}
            className={`px-6 py-3.5 rounded-xl font-semibold text-[13.5px] transition-colors flex items-center gap-2 cursor-pointer ${selectedAnswer
                ? 'bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white shadow-xs'
                : 'bg-[var(--surface-soft)] text-[var(--foreground-muted)] cursor-not-allowed border border-[var(--border)]'
              }`}
          >
            <span>Check Answer & Explanation</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {onRetryProblem && (
              <button
                onClick={onRetryProblem}
                className="px-5 py-3 bg-[var(--surface)] hover:bg-[var(--surface-soft)] text-[var(--foreground)] font-semibold text-[13px] rounded-xl border border-[var(--border)] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-[var(--foreground-secondary)]" />
                <span>Retry Problem</span>
              </button>
            )}

            {onNextQuestion && (
              <button
                onClick={onNextQuestion}
                className="px-6 py-3 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[13.5px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs ml-auto"
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
        <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-6 animate-in fade-in duration-300">
          {/* Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--brand-soft)] p-4 rounded-xl border border-teal-200/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-cta)] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[13.5px] font-bold text-[var(--foreground)]">Step-by-Step Solution & Masterclass Walkthrough</h4>
                <p className="text-[12px] text-[var(--brand-text)]">Verified College Board Digital SAT Standard Rationale</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[var(--brand-text)] font-semibold text-[11px] border border-teal-200">
                {formatDomainName(question.domain)}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${diffStyle.bg} ${diffStyle.border}`}>
                {question.difficulty?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Concept Breakdown Rationale */}
          <div className="space-y-3">
            <h5 className="text-[12px] font-mono font-bold uppercase tracking-wider text-[var(--foreground-secondary)]">Concept Rationale & Trap Avoidance</h5>
            <div className="p-5 rounded-xl bg-[var(--brand-soft)] border border-[var(--border)] text-[14px] text-[var(--foreground)] leading-[1.65]">
              <MathRenderer content={question.explanation} />
            </div>
          </div>

          {/* Key Strategy / Shortcut Tip Callout Box */}
          <div className="bg-[var(--brand-soft)] border-l-4 border-[var(--brand-cta)] p-4 rounded-r-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--brand-text)] uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span>SAT Test Day Shortcut & Speed Strategy</span>
            </div>
            <p className="text-[13px] text-[var(--foreground)] leading-relaxed">
              For this question type, leverage the built-in Desmos graphing calculator or back-solve choice values directly to confirm equality in under 45 seconds. Watch out for negative sign distribution traps in step 2.
            </p>
          </div>

          {/* Embedded YouTube Video Walkthrough Panel */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                <Play className="w-3.5 h-3.5 text-[var(--brand-text)] fill-[var(--brand-text)]" />
                <span>Instructor Video Breakdown</span>
              </div>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-[var(--brand-text)] hover:text-[var(--brand-text)] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--navy-section)] shadow-xs relative aspect-video flex flex-col items-center justify-center text-center p-6 group">
              <div className="relative z-20 flex flex-col items-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
                <div>
                  <h6 className="text-white font-bold text-sm sm:text-base">White Board SAT Masterclass · Speed Breakdown & Concept Review</h6>
                  <p className="text-[var(--foreground-muted)] text-xs mt-1">Instructor: Dr. Al-Mubin • 4 min walkthrough</p>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-[11px] text-[var(--foreground-muted)] font-mono">
                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 03:45 HD Walkthrough</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white font-sans">Chapter 4: Solving Systems</span>
              </div>
            </div>
          </div>

          {question.explanation_resource_link && (
            <div className="pt-1">
              <a
                href={question.explanation_resource_link}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[var(--brand-text)] hover:text-[var(--brand-text)] font-semibold hover:underline inline-flex items-center gap-1.5"
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
    <div className="bg-[var(--surface)] rounded-[16px] border border-[var(--border)] shadow-xs overflow-hidden transition-all">
      {/* Question Header & Meta Bar */}
      <div className="px-6 py-3.5 bg-[var(--brand-soft)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-bold text-[var(--foreground)] bg-[var(--surface)] px-2.5 py-1 rounded-[8px] border border-[var(--border)] shadow-2xs">
            {question.code}
          </span>
          <span className="font-semibold text-[var(--foreground)]">
            {formatDomainName(question.domain)}
          </span>
          <span className="text-[var(--foreground-muted)]">•</span>
          <span className="text-[var(--foreground-secondary)] hidden sm:inline">{question.topic}</span>
          <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-semibold border ${diffStyle.bg} ${diffStyle.border}`}>
            {question.difficulty?.toUpperCase() || 'MEDIUM'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {question.subject === 'math' && onOpenDesmos && (
            <button
              onClick={onOpenDesmos}
              className="h-9 px-3 flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--brand-text)] bg-[var(--surface)] hover:bg-[var(--brand-soft)] border border-[var(--border)] rounded-[8px] transition-colors font-medium text-[12px] cursor-pointer"
              title="Open Desmos Graphing Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span className="hidden sm:inline">Desmos</span>
            </button>
          )}

          {question.subject === 'math' && onOpenFormulas && (
            <button
              onClick={onOpenFormulas}
              className="h-9 px-3 flex items-center gap-1.5 text-[var(--foreground)] hover:text-[var(--brand-text)] bg-[var(--surface)] hover:bg-[var(--brand-soft)] border border-[var(--border)] rounded-[8px] transition-colors font-medium text-[12px] cursor-pointer"
              title="Open Formula Reference Sheet"
            >
              <BookOpen className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span className="hidden sm:inline">Formulas</span>
            </button>
          )}

          {/* ABC Elimination Toggle Button */}
          <button
            onClick={onToggleCrossOutMode}
            className={`h-9 px-3.5 flex items-center gap-1.5 rounded-[8px] border transition-colors font-semibold text-[12px] cursor-pointer ${isCrossOutModeActive
                ? 'bg-[var(--brand-cta)] text-white border-[var(--brand-cta)] shadow-xs'
                : 'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--brand-soft)] border-[var(--border)]'
              }`}
            title="Toggle Bluebook ABC answer elimination mode"
          >
            <span className="font-mono font-bold tracking-tight relative inline-block">
              ABC
              <span className="absolute inset-x-[-1px] top-1/2 h-[1.5px] bg-current -translate-y-1/2 pointer-events-none" />
            </span>
            <span className="hidden sm:inline font-medium">Eliminate</span>
          </button>

          <button
            onClick={onToggleMarkForReview}
            className={`h-9 px-3 flex items-center gap-1.5 rounded-[8px] border transition-colors cursor-pointer ${isMarkedForReview
                ? 'bg-amber-50 text-amber-700 border-amber-300'
                : 'bg-[var(--surface)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--brand-soft)] border-[var(--border)]'
              }`}
            title={isMarkedForReview ? 'Marked for review' : 'Mark for review'}
          >
            <Flag className={`w-3.5 h-3.5 ${isMarkedForReview ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Flag</span>
          </button>

          <button
            onClick={onToggleBookmark}
            className={`h-9 px-3 flex items-center gap-1.5 rounded-[8px] border transition-colors cursor-pointer ${isBookmarked
                ? 'bg-teal-50 text-[var(--brand-text)] border-teal-200'
                : 'bg-[var(--surface)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--brand-soft)] border-[var(--border)]'
              }`}
            title={isBookmarked ? 'Bookmarked' : 'Bookmark question'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[var(--brand-text)] text-[var(--brand-text)]' : ''}`} />
            <span className="hidden sm:inline">Bookmark</span>
          </button>
        </div>
      </div>

      {/* Bluebook Split-Pane Layout (When Passage / Stimulus Exists) */}
      {question.stimulus ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)] min-h-[500px]">
          {/* Left Column: Reading Passage (Stimulus) */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[var(--brand-soft)]/60 overflow-y-auto max-h-[750px]">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--foreground-secondary)] mb-4">
              Reading Passage / Source Context
            </div>
            <div className="text-[15px] text-[var(--foreground)] font-serif leading-[1.8] space-y-4">
              <MathRenderer content={question.stimulus} />
            </div>
          </div>

          {/* Right Column: Question & Choices */}
          <div className="lg:col-span-6 p-6 sm:p-8 overflow-y-auto max-h-[750px]">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--brand-text)] mb-2">
              Question Prompt
            </div>
            {renderContentBody()}
          </div>
        </div>
      ) : (
        /* Standard Single Column Layout for Math & Non-Passage Items */
        <div className="p-6 sm:p-8">
          {renderContentBody()}
        </div>
      )}
    </div>
  );
};
