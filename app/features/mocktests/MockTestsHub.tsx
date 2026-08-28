import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Calculator,
  BookOpen,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  MockTest,
  MockTestAttempt,
  QuestionInteractionState,
  UserProfile,
  Domain,
} from '../../types';
import { isPlayable } from '../../lib/mockTests';
import { formatDomainName } from '../../lib/utils';
import { QuestionCard } from '../../components/QuestionCard';
import { QuestionNavigator } from '../../components/QuestionNavigator';
import { DesmosModal } from '../../components/DesmosModal';
import { FormulaReferenceModal } from '../../components/FormulaReferenceModal';

interface MockTestsHubProps {
  mockTests: MockTest[];
  mockAttempts: MockTestAttempt[];
  currentUser: UserProfile | null;
  hasAccessToMockTest: (test: MockTest) => boolean;
  onSaveAttempt: (attempt: MockTestAttempt) => void;
  onFinalizeTest: (attemptId: string) => Promise<MockTestAttempt | undefined>;
  onOpenPricing: () => void;
}

export const MockTestsHub: React.FC<MockTestsHubProps> = ({
  mockTests,
  mockAttempts,
  currentUser,
  hasAccessToMockTest,
  onSaveAttempt,
  onFinalizeTest,
  onOpenPricing,
}) => {
  // Test Runner State
  const [activeAttempt, setActiveAttempt] = useState<MockTestAttempt | null>(null);
  const [activeTest, setActiveTest] = useState<MockTest | null>(null);
  const [selectedResultAttempt, setSelectedResultAttempt] = useState<MockTestAttempt | null>(null);
  const [isCrossOutMode, setIsCrossOutMode] = useState(false);

  // Modals
  const [isDesmosOpen, setIsDesmosOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);

  // Start new mock test attempt
  const handleStartTest = (test: MockTest) => {
    // Starting a test reads modules[0].timeLimitMinutes, so an unconfigured test would
    // throw. The Start button is disabled for these; this is the belt-and-braces check.
    if (!isPlayable(test)) return;

    const existing = mockAttempts.find(
      (a) => a.testId === test.id && a.userId === (currentUser?.id || 'guest') && a.status === 'in_progress'
    );
    if (existing) {
      setActiveAttempt(existing);
      setActiveTest(test);
      return;
    }

    // Create fresh attempt
    const initialInteractions: Record<string, QuestionInteractionState> = {};
    test.modules.forEach((mod) => {
      mod.questions.forEach((q) => {
        initialInteractions[q.id] = {
          questionId: q.id,
          selectedAnswer: null,
          isSubmitted: false,
          isMarkedForReview: false,
          isBookmarked: false,
          crossedOutChoices: [],
          timeSpentSeconds: 0,
        };
      });
    });

    const firstPlayableIdx = test.modules.findIndex((m) => m.questions.length > 0);
    const startModIdx = firstPlayableIdx >= 0 ? firstPlayableIdx : 0;
    const firstModule = test.modules[startModIdx] || test.modules[0];
    const newAttempt: MockTestAttempt = {
      id: `m-att-${test.id}-${currentUser?.id || 'guest'}`,
      userId: currentUser?.id || 'guest',
      testId: test.id,
      testTitle: test.title,
      status: 'in_progress',
      currentModuleIndex: startModIdx,
      currentQuestionIndex: 0,
      timeRemainingSeconds: (firstModule?.timeLimitMinutes || 35) * 60,
      interactions: initialInteractions,
      startedAt: new Date().toISOString(),
    };

    onSaveAttempt(newAttempt);
    setActiveAttempt(newAttempt);
    setActiveTest(test);
  };

  // Resume active test
  const handleResumeTest = (attempt: MockTestAttempt) => {
    const test = mockTests.find((t) => t.id === attempt.testId);
    if (test) {
      setActiveAttempt(attempt);
      setActiveTest(test);
    }
  };

  // Countdown timer for active module
  useEffect(() => {
    if (!activeAttempt || activeAttempt.status !== 'in_progress') return;

    const interval = setInterval(() => {
      setActiveAttempt((prev) => {
        if (!prev) return null;
        const remaining = Math.max(0, prev.timeRemainingSeconds - 1);
        const updated = { ...prev, timeRemainingSeconds: remaining };
        onSaveAttempt(updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAttempt?.id]);

  // Handle Answer Selection in Active Test
  const handleSelectTestAnswer = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (!activeAttempt || !activeTest) return;
    const currentModule = activeTest.modules[activeAttempt.currentModuleIndex];
    const currentQ = currentModule.questions[activeAttempt.currentQuestionIndex];
    if (!currentQ) return;

    const updated = {
      ...activeAttempt,
      interactions: {
        ...activeAttempt.interactions,
        [currentQ.id]: {
          ...activeAttempt.interactions[currentQ.id],
          selectedAnswer: choiceId,
        },
      },
    };
    setActiveAttempt(updated);
    onSaveAttempt(updated);
  };

  const handleToggleCrossOutTest = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (!activeAttempt || !activeTest) return;
    const currentModule = activeTest.modules[activeAttempt.currentModuleIndex];
    const currentQ = currentModule.questions[activeAttempt.currentQuestionIndex];
    if (!currentQ) return;

    const cur = activeAttempt.interactions[currentQ.id];
    const crossed = cur.crossedOutChoices.includes(choiceId)
      ? cur.crossedOutChoices.filter((c) => c !== choiceId)
      : [...cur.crossedOutChoices, choiceId];

    const updated = {
      ...activeAttempt,
      interactions: {
        ...activeAttempt.interactions,
        [currentQ.id]: {
          ...cur,
          crossedOutChoices: crossed,
        },
      },
    };
    setActiveAttempt(updated);
    onSaveAttempt(updated);
  };

  const handleToggleMarkReviewTest = () => {
    if (!activeAttempt || !activeTest) return;
    const currentModule = activeTest.modules[activeAttempt.currentModuleIndex];
    const currentQ = currentModule.questions[activeAttempt.currentQuestionIndex];
    if (!currentQ) return;

    const cur = activeAttempt.interactions[currentQ.id];
    const updated = {
      ...activeAttempt,
      interactions: {
        ...activeAttempt.interactions,
        [currentQ.id]: {
          ...cur,
          isMarkedForReview: !cur.isMarkedForReview,
        },
      },
    };
    setActiveAttempt(updated);
    onSaveAttempt(updated);
  };

  // Submit Current Module and Advance or Finalize
  const handleSubmitModule = async () => {
    if (!activeAttempt || !activeTest) return;

    let nextModuleIdx = activeAttempt.currentModuleIndex + 1;
    // Skip empty modules
    while (
      nextModuleIdx < activeTest.modules.length &&
      activeTest.modules[nextModuleIdx].questions.length === 0
    ) {
      nextModuleIdx++;
    }

    if (nextModuleIdx < activeTest.modules.length) {
      // Advance to next module
      const nextMod = activeTest.modules[nextModuleIdx];
      const updated: MockTestAttempt = {
        ...activeAttempt,
        currentModuleIndex: nextModuleIdx,
        currentQuestionIndex: 0,
        timeRemainingSeconds: (nextMod.timeLimitMinutes || 35) * 60,
      };
      setActiveAttempt(updated);
      onSaveAttempt(updated);
    } else {
      // Finalize full test. The scored attempt comes back from the server;
      // the local copy has no scoreSummary, which is what used to leave the
      // results screen showing its placeholder numbers.
      const scored = await onFinalizeTest(activeAttempt.id);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setActiveAttempt(null);
      setActiveTest(null);
      setSelectedResultAttempt(scored ?? { ...activeAttempt, status: 'completed' as const });
    }
  };

  // An in-progress attempt saved before the test was edited can point past the end of
  // the current modules. Resolving these up front means a stale attempt falls through
  // to the test list instead of crashing the runner on an undefined module.
  const isRunning = Boolean(activeAttempt && activeTest && activeAttempt.status === 'in_progress');
  const runnerModule =
    isRunning && activeTest ? activeTest.modules[activeAttempt!.currentModuleIndex] : undefined;
  const runnerQuestion = runnerModule?.questions[activeAttempt!.currentQuestionIndex];

  // --- 1. FULL SCREEN DIGITAL SAT TEST RUNNER ---
  if (activeAttempt && activeTest && runnerModule && runnerQuestion) {
    const currentModule = runnerModule;
    const currentQ = runnerQuestion;
    const moduleQuestionIds = currentModule.questions.map((q) => q.id);
    const interaction = activeAttempt.interactions[currentQ.id];

    const timeMins = Math.floor(activeAttempt.timeRemainingSeconds / 60);
    const timeSecs = activeAttempt.timeRemainingSeconds % 60;

    return (
      <div className="fixed inset-0 z-50 bg-[var(--surface)] flex flex-col overflow-hidden select-none">
        {/* Exam Top Header */}
        <header className="bg-[var(--navy-section)] text-white px-6 py-3.5 flex items-center justify-between border-b border-[var(--border-strong)]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[var(--brand-cta)] flex items-center justify-center font-bold text-[11px]">
              WB
            </div>
            <div>
              <div className="font-semibold text-[13px] text-white leading-tight">{activeTest.title}</div>
              <div className="text-[11px] text-[var(--brand-text)] font-medium">{currentModule.title}</div>
            </div>
          </div>

          {/* Module Timer */}
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-lg bg-slate-900/80 border border-[var(--border-strong)] font-mono text-[13px] font-semibold">
            <Clock className="w-3.5 h-3.5 text-[var(--brand-text)]" />
            <span className={activeAttempt.timeRemainingSeconds < 120 ? 'text-rose-400 animate-pulse' : 'text-white'}>
              {timeMins}:{timeSecs.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Tools & Exit */}
          <div className="flex items-center gap-2">
            {currentModule.section === 'math' && (
              <>
                <button
                  onClick={() => setIsDesmosOpen(true)}
                  className="px-2.5 py-1 bg-[var(--navy-section)] hover:bg-[var(--border-strong)] text-[var(--foreground-secondary)] text-[11px] font-medium rounded-lg flex items-center gap-1 border border-[var(--border-strong)] transition-colors"
                >
                  <Calculator className="w-3 h-3 text-[var(--brand-text)]" />
                  <span className="hidden sm:inline">Desmos</span>
                </button>
                <button
                  onClick={() => setIsFormulasOpen(true)}
                  className="px-2.5 py-1 bg-[var(--navy-section)] hover:bg-[var(--border-strong)] text-[var(--foreground-secondary)] text-[11px] font-medium rounded-lg flex items-center gap-1 border border-[var(--border-strong)] transition-colors"
                >
                  <BookOpen className="w-3 h-3 text-[var(--foreground-muted)]" />
                  <span className="hidden sm:inline">Formulas</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setActiveAttempt(null);
                setActiveTest(null);
              }}
              className="px-3 py-1 bg-[var(--navy-section)] hover:bg-[var(--border-strong)] text-[var(--foreground-muted)] text-[11px] font-medium rounded-lg border border-[var(--border-strong)] transition-colors"
            >
              Pause & Exit
            </button>
          </div>
        </header>

        {/* Test Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <QuestionCard
              question={currentQ}
              interactionState={interaction}
              onSelectAnswer={handleSelectTestAnswer}
              onToggleCrossOut={handleToggleCrossOutTest}
              onToggleBookmark={() => { }}
              onToggleMarkForReview={handleToggleMarkReviewTest}
              onOpenDesmos={() => setIsDesmosOpen(true)}
              onOpenFormulas={() => setIsFormulasOpen(true)}
              isCrossOutModeActive={isCrossOutMode}
              onToggleCrossOutMode={() => setIsCrossOutMode(!isCrossOutMode)}
              showExplanationImmediately={false}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <button
                disabled={activeAttempt.currentQuestionIndex === 0}
                onClick={() =>
                  setActiveAttempt((prev) =>
                    prev ? { ...prev, currentQuestionIndex: Math.max(0, prev.currentQuestionIndex - 1) } : null
                  )
                }
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${activeAttempt.currentQuestionIndex === 0
                    ? 'text-[var(--foreground-muted)] cursor-not-allowed'
                    : 'text-[var(--foreground-muted)] hover:text-[var(--navy-section)] hover:bg-[var(--surface-soft)] border border-[var(--border)]'
                  }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-[12px] text-[var(--foreground-muted)] font-mono">
                {activeAttempt.currentQuestionIndex + 1} / {moduleQuestionIds.length}
              </span>

              {activeAttempt.currentQuestionIndex < moduleQuestionIds.length - 1 ? (
                <button
                  onClick={() =>
                    setActiveAttempt((prev) =>
                      prev
                        ? {
                          ...prev,
                          currentQuestionIndex: Math.min(moduleQuestionIds.length - 1, prev.currentQuestionIndex + 1),
                        }
                        : null
                    )
                  }
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-medium bg-[var(--navy-section)] hover:bg-[var(--navy-section)] text-white shadow-xs transition-colors"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitModule}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <span>
                    {activeAttempt.currentModuleIndex < activeTest.modules.length - 1
                      ? 'Submit Module & Continue'
                      : 'Finalize & Submit Test'}
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Module Question Palette */}
          <div className="lg:col-span-4 space-y-4">
            <QuestionNavigator
              totalQuestions={moduleQuestionIds.length}
              currentIndex={activeAttempt.currentQuestionIndex}
              interactions={activeAttempt.interactions}
              questionIds={moduleQuestionIds}
              onSelectIndex={(idx) =>
                setActiveAttempt((prev) => (prev ? { ...prev, currentQuestionIndex: idx } : null))
              }
              title={`${currentModule.title} Palette`}
            />

            <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] text-[12px] space-y-3">
              <div className="font-semibold text-[var(--navy-section)]">Module Status</div>
              <div className="flex justify-between text-[var(--foreground-muted)]">
                <span>Questions:</span>
                <strong className="font-mono text-[var(--navy-section)]">{moduleQuestionIds.length}</strong>
              </div>
              <div className="flex justify-between text-[var(--foreground-secondary)]">
                <span>Answered:</span>
                <strong className="font-mono text-[var(--brand-text)]">
                  {moduleQuestionIds.filter((id) => activeAttempt.interactions[id]?.selectedAnswer).length} / {moduleQuestionIds.length}
                </strong>
              </div>
              <button
                onClick={handleSubmitModule}
                className="w-full py-2.5 bg-[var(--navy-section)] hover:bg-[var(--navy-section)] text-white font-medium rounded-lg transition-colors text-[12px]"
              >
                {activeAttempt.currentModuleIndex < activeTest.modules.length - 1
                  ? 'Proceed to Next Module'
                  : 'Submit Test for Scoring'}
              </button>
            </div>
          </div>
        </div>

        <DesmosModal isOpen={isDesmosOpen} onClose={() => setIsDesmosOpen(false)} />
        <FormulaReferenceModal isOpen={isFormulasOpen} onClose={() => setIsFormulasOpen(false)} />
      </div>
    );
  }

  // --- 2. MOCK TESTS HUB BROWSER VIEW ---
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--brand-text)]">Standardized Testing</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">Digital SAT Mock Simulator</h1>
          <p className="text-[13px] text-[var(--foreground-secondary)] leading-[1.5] max-w-xl">
            Simulate the Digital SAT with timed modules, realistic difficulty, and detailed performance analysis.
          </p>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {mockTests.map((test) => {
          const hasAccess = hasAccessToMockTest(test);
          const attempt = mockAttempts.find(
            (a) => a.testId === test.id && a.userId === (currentUser?.id || 'guest')
          );
          const status = attempt ? attempt.status : 'not_started';
          // Tests still being assembled in the admin console have no questions to sit.
          const playable = isPlayable(test);

          return (
            <div
              key={test.id}
              className="bg-[var(--surface)] rounded-[16px] border border-[var(--border)] p-6 flex flex-col justify-between h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_24px_-6px_rgba(15,23,42,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.03)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] border ${test.is_free
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-[var(--brand-soft)] text-[var(--brand-text)] border-teal-100'
                      }`}
                  >
                    {test.is_free ? 'FREE DIAGNOSTIC' : 'PREMIUM FULL TEST'}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800'
                        : status === 'in_progress'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-[var(--surface-soft)] text-[var(--foreground-secondary)]'
                      }`}
                  >
                    {status === 'completed'
                      ? 'COMPLETED'
                      : status === 'in_progress'
                        ? 'IN PROGRESS'
                        : 'NOT STARTED'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-[var(--foreground)] text-base leading-snug">{test.title}</h3>
                  <p className="text-[12px] text-[var(--foreground-secondary)] leading-[1.5] min-h-[48px]">{test.description}</p>
                </div>

                <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)] space-y-1 text-[12px] text-[var(--foreground-secondary)]">
                  <div className="flex justify-between">
                    <span>Total Structure:</span>
                    <strong className="text-[var(--foreground)]">4 Modules (2 RW + 2 Math)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <strong className="text-[var(--foreground)]">{test.totalTimeMinutes} Minutes</strong>
                  </div>
                </div>

                {/* Completed Score Badge */}
                {attempt?.scoreSummary && (
                  <div className="p-3 bg-[var(--brand-soft)] rounded-xl border border-teal-100 flex items-center justify-between text-[12px]">
                    <div>
                      <span className="text-[var(--foreground-secondary)] block text-[10px]">Estimated Score</span>
                      <strong className="text-[15px] font-bold text-[var(--brand-text)] font-mono">
                        {attempt.scoreSummary.totalScoreEstimated} / 1600
                      </strong>
                    </div>
                    <button
                      onClick={() => setSelectedResultAttempt(attempt)}
                      className="px-2.5 py-1 bg-[var(--surface)] text-[var(--brand-text)] font-semibold rounded-lg border border-teal-200 text-[11px] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer active:scale-[0.98]"
                    >
                      View Report
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[var(--border)] mt-auto">
                {hasAccess ? (
                  status === 'in_progress' ? (
                    <button
                      onClick={() => handleResumeTest(attempt!)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-[12px] rounded-[10px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Resume In-Progress Test</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTest(test)}
                      disabled={!playable}
                      title={playable ? undefined : 'This test is still being prepared'}
                      className="w-full py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] disabled:bg-[var(--border)] disabled:text-[var(--foreground-secondary)] disabled:cursor-not-allowed disabled:hover:bg-[var(--border)] text-white font-medium text-[12px] rounded-[10px] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer group/btn active:scale-[0.98] disabled:active:scale-100"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>
                        {!playable
                          ? 'Coming soon'
                          : status === 'completed'
                          ? 'Retake Mock Test'
                          : 'Start Mock Test'}
                      </span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={onOpenPricing}
                    className="w-full py-2.5 bg-[var(--brand-soft)] hover:bg-teal-100/60 text-[var(--brand-text)] font-semibold text-[12px] rounded-[10px] border border-teal-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Lock className="w-3.5 h-3.5 text-[var(--brand-text)]" />
                    <span>Unlock with Pass</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 3. DIAGNOSTIC SCORE REPORT MODAL --- */}
      {selectedResultAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[var(--brand-text)] uppercase tracking-wider">
                  Diagnostic Performance Report
                </span>
                <h3 className="text-lg font-bold text-[var(--foreground)]">{selectedResultAttempt.testTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedResultAttempt(null)}
                className="p-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Score Headline Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-[var(--brand-soft)] border border-teal-100 text-center space-y-1">
                  <div className="text-[11px] font-bold text-[var(--brand-text)] uppercase tracking-wider">Estimated Total</div>
                  <div className="text-3xl font-extrabold text-[var(--foreground)] font-mono">
                    {selectedResultAttempt.scoreSummary?.totalScoreEstimated ?? '—'}
                  </div>
                  <div className="text-[11px] text-[var(--brand-text)]">Scale: 400 – 1600</div>
                </div>

                <div className="p-5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-center space-y-1">
                  <div className="text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Mathematics</div>
                  <div className="text-2xl font-bold text-[var(--foreground)] font-mono">
                    {selectedResultAttempt.scoreSummary?.mathScoreEstimated ?? 0}
                  </div>
                  <div className="text-[11px] text-[var(--foreground-secondary)]">
                    {selectedResultAttempt.scoreSummary?.mathCorrect ?? 0} / {selectedResultAttempt.scoreSummary?.mathTotal ?? 0} correct
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] text-center space-y-1">
                  <div className="text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">Reading & Writing</div>
                  <div className="text-2xl font-bold text-[var(--foreground)] font-mono">
                    {selectedResultAttempt.scoreSummary?.rwScoreEstimated ?? 0}
                  </div>
                  <div className="text-[11px] text-[var(--foreground-secondary)]">
                    {selectedResultAttempt.scoreSummary?.rwCorrect ?? 0} / {selectedResultAttempt.scoreSummary?.rwTotal ?? 0} correct
                  </div>
                </div>
              </div>

              {/* Accuracy Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[12px]">
                <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--foreground-secondary)] block text-[11px]">Accuracy</span>
                  <strong className="text-sm text-[var(--foreground)] font-mono">
                    {selectedResultAttempt.scoreSummary?.accuracyPercent ?? 0}%
                  </strong>
                </div>
                <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--foreground-secondary)] block text-[11px]">Correct</span>
                  <strong className="text-sm text-emerald-600 font-mono">
                    {selectedResultAttempt.scoreSummary?.totalCorrect ?? 0}
                  </strong>
                </div>
                <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--foreground-secondary)] block text-[11px]">Incorrect</span>
                  <strong className="text-sm text-rose-600 font-mono">
                    {(selectedResultAttempt.scoreSummary?.totalQuestions ?? 0) -
                      (selectedResultAttempt.scoreSummary?.totalCorrect ?? 0)}
                  </strong>
                </div>
                <div className="p-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
                  <span className="text-[var(--foreground-secondary)] block text-[11px]">National Percentile</span>
                  <strong className="text-sm text-[var(--brand-text)] font-mono">97th</strong>
                </div>
              </div>

              {/* Domain Performance Breakdown */}
              <div className="space-y-3">
                <h4 className="text-[12px] font-bold text-[var(--navy-section)] uppercase tracking-wider">
                  Domain Performance Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                  {selectedResultAttempt.scoreSummary?.domainBreakdown &&
                    Object.entries(selectedResultAttempt.scoreSummary.domainBreakdown).map(
                      ([domKey, stat]: [string, { correct: number; total: number }]) => {
                        const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                        return (
                          <div key={domKey} className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-1.5">
                            <div className="flex justify-between font-medium text-[var(--navy-section)]">
                              <span>{formatDomainName(domKey as Domain)}</span>
                              <span className="font-mono text-[var(--foreground-muted)]">
                                {stat.correct}/{stat.total} ({acc}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${acc >= 75 ? 'bg-emerald-500' : acc >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                style={{ width: `${acc}%` }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-[var(--surface-soft)] border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setSelectedResultAttempt(null)}
                className="px-5 py-2 bg-[var(--navy-section)] hover:bg-[var(--navy-section)] text-white font-medium text-[12px] rounded-lg transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
