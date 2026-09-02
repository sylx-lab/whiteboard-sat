import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  ArrowRight,
  Clock,
  Trophy,
  Eye,
} from 'lucide-react';
import {
  Question,
  Subject,
  Domain,
  Difficulty,
  QuestionInteractionState,
  UserProfile,
} from '../../types';
import { formatDomainName } from '../../lib/utils';
import { isSprQuestion, isSprAnswerCorrect } from '../../lib/spr';
import { MathRenderer } from '../../components/MathRenderer';
import { QuestionCard } from '../../components/QuestionCard';
import { QuestionNavigator } from '../../components/QuestionNavigator';
import { DesmosModal } from '../../components/DesmosModal';
import { FormulaReferenceModal } from '../../components/FormulaReferenceModal';
import { QuestionFeedbackModal } from '../../components/QuestionFeedbackModal';
import { sortQuestions, type QuestionSortOption } from '../../lib/questionSort';

interface PracticeHubProps {
  questions: Question[];
  currentUser: UserProfile | null;
  hasAccessToQuestion: (q: Question) => boolean;
  onLogAttempt: (question: Question, answer: string, timeSpent: number) => void;
  onToggleBookmark?: (questionId: string) => void;
  onOpenPricing: () => void;
  onOpenAuth?: () => void;
  onSubmitFeedback?: (questionId: string, message: string) => Promise<unknown>;
}

type SortOption = QuestionSortOption;

const getNow = () => Date.now();

export const PracticeHub: React.FC<PracticeHubProps> = ({
  questions,
  currentUser,
  hasAccessToQuestion,
  onLogAttempt,
  onToggleBookmark,
  onOpenPricing,
  onOpenAuth,
  onSubmitFeedback,
}) => {
  // High-Level Subject Switcher — All first, then Math / English
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');

  // Compact Toolbar Filters — multi-select (sketch: checkboxes)
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedAccess, setSelectedAccess] = useState<'all' | 'free' | 'premium'>('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filter Dropdown Open States
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Active Practice Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionInteractions, setSessionInteractions] = useState<Record<string, QuestionInteractionState>>({});
  const [sessionTimer, setSessionTimer] = useState(0);
  const questionStartMsRef = useRef<number>(0);
  const [isCrossOutMode, setIsCrossOutMode] = useState(false);
  const [isMobileMatrixOpen, setIsMobileMatrixOpen] = useState(false);
  const [isDesktopMatrixOpen, setIsDesktopMatrixOpen] = useState(false);

  // Reference Modals
  const [isDesmosOpen, setIsDesmosOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [reportingQuestion, setReportingQuestion] = useState<Question | null>(null);

  // Session Result Screen — shown on demand, not just when every question is answered
  const [showResults, setShowResults] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeAllDropdowns = () => {
    setDomainDropdownOpen(false);
    setDifficultyDropdownOpen(false);
    setSourceDropdownOpen(false);
    setAccessDropdownOpen(false);
    setSortDropdownOpen(false);
  };

  const toggleIn = <T,>(arr: T[], val: T, setter: (v: T[]) => void) =>
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Domain groupings
  const mathDomains: Domain[] = [
    'algebra',
    'advanced_math',
    'problem_solving_data_analysis',
    'geometry_trigonometry',
  ];
  const rwDomains: Domain[] = [
    'information_ideas',
    'craft_structure',
    'expression_ideas',
    'standard_english_conventions',
  ];

  // Extract unique sources for filter — only what you can actually access
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    questions
      .filter((q) => (selectedSubject === 'all' || q.subject === selectedSubject) && hasAccessToQuestion(q))
      .forEach((q) => { if (q.source) set.add(q.source); });
    return Array.from(set).sort();
  }, [questions, selectedSubject, hasAccessToQuestion]);

  // Topics grouped by domain (for the drawer — mirrors sketch page 3)
  const topicsByDomain = useMemo(() => {
    const map = new Map<Domain, Set<string>>();
    questions
      .filter((q) => (selectedSubject === 'all' || q.subject === selectedSubject) && hasAccessToQuestion(q))
      .forEach((q) => {
        if (!map.has(q.domain)) map.set(q.domain, new Set());
        map.get(q.domain)!.add(q.topic);
      });
    return map;
  }, [questions, selectedSubject, hasAccessToQuestion]);

  // Filtered & Sorted Question List — premium hidden unless you have access
  const filteredQuestions = useMemo(() => {
    let result = questions.filter((q) => {
      // Hide premium completely for students without access (not even as locked cards)
      if (!hasAccessToQuestion(q)) return false;

      // Subject filter — All shows both Math and Reading & Writing
      if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;

      // Domain — multi (empty = all) — sketch page 2: Algebra + Geometry checked
      if (selectedDomains.length > 0 && !selectedDomains.includes(q.domain)) return false;

      // Difficulty — multi (empty = all)
      if (selectedDifficulties.length > 0 && !selectedDifficulties.includes(q.difficulty)) return false;

      // Access filter (now only toggles within what you can actually see)
      if (selectedAccess === 'free' && !q.is_free) return false;
      if (selectedAccess === 'premium' && q.is_free) return false;

      // Topics — multi — sketch page 3 per-domain checklist
      if (selectedTopics.length > 0 && !selectedTopics.includes(q.topic)) return false;

      // Sources — multi — sketch page 4: College Panda / Suite 1b / Previous year
      if (selectedSources.length > 0 && !selectedSources.includes(q.source)) return false;

      // Search — includes stimulus so Reading passages are findable
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = q.code.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchSubtopic = q.subtopic.toLowerCase().includes(query);
        const matchText = q.question_text.toLowerCase().includes(query);
        const matchStimulus = (q.stimulus ?? '').toLowerCase().includes(query);
        if (!matchCode && !matchTopic && !matchSubtopic && !matchText && !matchStimulus) return false;
      }

      return true;
    });

    // Sorting (recommended, difficulty, newest)
    return sortQuestions(result, sortBy);
  }, [
    questions,
    selectedSubject,
    selectedDomains,
    selectedDifficulties,
    selectedAccess,
    selectedTopics,
    selectedSources,
    searchQuery,
    sortBy,
    hasAccessToQuestion,
  ]);

  // Stats — counts reflect what you can actually access (premium hidden)
  const accessibleForSubject = useMemo(
    () => questions.filter((q) => (selectedSubject === 'all' || q.subject === selectedSubject) && hasAccessToQuestion(q)),
    [questions, selectedSubject, hasAccessToQuestion]
  );
  const subjectTotal = accessibleForSubject.length;
  const subjectFree = accessibleForSubject.filter((q) => q.is_free).length;
  const subjectDomains = selectedSubject === 'all' ? 8 : 4;
  const hiddenPremiumCount = useMemo(
    () => questions.filter((q) => (selectedSubject === 'all' || q.subject === selectedSubject) && !hasAccessToQuestion(q)).length,
    [questions, selectedSubject, hasAccessToQuestion]
  );

  // Active filter counter
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += selectedDomains.length;
    count += selectedDifficulties.length;
    count += selectedTopics.length;
    count += selectedSources.length;
    if (selectedAccess !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedDomains, selectedDifficulties, selectedAccess, selectedTopics, selectedSources, searchQuery]);

  const resetAllFilters = () => {
    setSelectedDomains([]);
    setSelectedDifficulties([]);
    setSelectedAccess('all');
    setSelectedTopics([]);
    setSelectedSources([]);
    setSearchQuery('');
    setSortBy('recommended');
  };

  // Reset pagination when filters change (React pattern for state adjustment during render)
  const filterKey = `${selectedSubject}:${selectedDomains.join(',')}:${selectedDifficulties.join(',')}:${selectedAccess}:${selectedTopics.join(',')}:${selectedSources.join(',')}:${searchQuery}:${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  // Launch Practice Session — requires account
  const handleStartSession = (startQuestions = filteredQuestions, initialIdx = 0) => {
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }
    if (startQuestions.length === 0) return;
    const ids = startQuestions.map((q) => q.id);
    setSessionQuestionIds(ids);
    setCurrentIndex(initialIdx);

    const bookmarked = new Set(currentUser?.bookmarkedQuestionIds ?? []);
    const initialInteractions: Record<string, QuestionInteractionState> = {};
    ids.forEach((id) => {
      initialInteractions[id] = {
        questionId: id,
        selectedAnswer: null,
        enteredAnswer: null,
        isSubmitted: false,
        isMarkedForReview: false,
        isBookmarked: bookmarked.has(id),
        crossedOutChoices: [],
        timeSpentSeconds: 0,
      };
    });

    setSessionInteractions(initialInteractions);
    setSessionTimer(0);
    questionStartMsRef.current = getNow();
    setIsSessionActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentSessionQuestion = questions.find((q) => q.id === sessionQuestionIds[currentIndex]);
  const currentInteraction = currentSessionQuestion
    ? sessionInteractions[currentSessionQuestion.id]
    : undefined;

  // Timer increment while in active session — pauses while reviewing explanation (isSubmitted) so checking explanation doesn't inflate time
  const isTimerPaused = isSessionActive && !!currentInteraction?.isSubmitted;
  useEffect(() => {
    if (!isSessionActive) return;
    if (currentInteraction?.isSubmitted) return;
    const interval = setInterval(() => {
      setSessionTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive, currentInteraction?.isSubmitted, currentIndex]);

  // Question handlers in session
  const handleSelectAnswer = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (!currentSessionQuestion) return;
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        selectedAnswer: choiceId,
      },
    }));
  };

  const handleEnteredAnswer = (val: string) => {
    if (!currentSessionQuestion) return;
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        enteredAnswer: val,
      },
    }));
  };

  const handleToggleCrossOut = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    if (!currentSessionQuestion) return;
    const current = currentInteraction?.crossedOutChoices || [];
    const updated = current.includes(choiceId)
      ? current.filter((c) => c !== choiceId)
      : [...current, choiceId];

    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        crossedOutChoices: updated,
      },
    }));
  };

  const handleToggleBookmark = () => {
    if (!currentSessionQuestion) return;
    const qid = currentSessionQuestion.id;
    setSessionInteractions((prev) => ({
      ...prev,
      [qid]: {
        ...prev[qid],
        isBookmarked: !prev[qid]?.isBookmarked,
      },
    }));
    if (currentUser) onToggleBookmark?.(qid);
  };

  const handleToggleMarkForReview = () => {
    if (!currentSessionQuestion) return;
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        isMarkedForReview: !prev[currentSessionQuestion.id]?.isMarkedForReview,
      },
    }));
  };

  const handleSubmitAnswer = () => {
    if (!currentUser) {
      onOpenAuth?.();
      return;
    }
    if (!currentSessionQuestion || !currentInteraction) return;
    const isSpr = isSprQuestion(currentSessionQuestion);
    if (isSpr) {
      if (!String(currentInteraction.enteredAnswer ?? '').trim()) return;
    } else {
      if (!currentInteraction.selectedAnswer) return;
    }
    const elapsed = Math.max(1, Math.round((getNow() - questionStartMsRef.current) / 1000));
    // Persist per-question time
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        isSubmitted: true,
        timeSpentSeconds: (prev[currentSessionQuestion.id]?.timeSpentSeconds || 0) + elapsed,
      },
    }));
    const answerToLog = isSpr
      ? String(currentInteraction.enteredAnswer ?? '').trim()
      : (currentInteraction.selectedAnswer as string);
    onLogAttempt(currentSessionQuestion, answerToLog, elapsed);
  };

  const handleRetryProblem = () => {
    if (!currentSessionQuestion) return;
    questionStartMsRef.current = getNow();
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        selectedAnswer: null,
        enteredAnswer: null,
        isSubmitted: false,
        crossedOutChoices: [],
      },
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < sessionQuestionIds.length - 1) {
      questionStartMsRef.current = getNow();
      setCurrentIndex((idx) => idx + 1);
    }
  };

  // Session summary — shared by the in-progress banner and the finish screen
  const sessionStats = useMemo(() => {
    const total = sessionQuestionIds.length;
    let answered = 0;
    let correct = 0;
    const byDomain = new Map<Domain, { total: number; correct: number }>();
    sessionQuestionIds.forEach((id) => {
      const inter = sessionInteractions[id];
      const q = questions.find((qq) => qq.id === id);
      if (!inter?.isSubmitted || !q) return;
      answered += 1;
      const isCorrect = isSprQuestion(q) ? isSprAnswerCorrect(q, inter.enteredAnswer) : inter.selectedAnswer === q.correct_answer;
      if (isCorrect) correct += 1;
      const bucket = byDomain.get(q.domain) ?? { total: 0, correct: 0 };
      bucket.total += 1;
      if (isCorrect) bucket.correct += 1;
      byDomain.set(q.domain, bucket);
    });
    const incorrect = answered - correct;
    return {
      total,
      answered,
      correct,
      incorrect,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      domains: Array.from(byDomain.entries()).map(([domain, s]) => ({ domain, ...s })),
    };
  }, [sessionQuestionIds, sessionInteractions, questions]);

  const finishSession = () => {
    setShowResults(true);
  };

  const exitToBank = () => {
    setShowResults(false);
    setIsSessionActive(false);
  };

  // --- SESSION RESULT SCREEN ---
  if (isSessionActive && showResults) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-(--brand-soft) text-(--brand-text) flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--foreground)">Session Complete</h1>
          <p className="text-[13.5px] text-(--foreground-secondary)">
            {sessionStats.answered} of {sessionStats.total} question{sessionStats.total === 1 ? '' : 's'} answered · {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')} elapsed
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-(--surface) border border-(--border) text-center">
            <div className="text-2xl font-bold text-(--foreground) font-mono">{sessionStats.accuracy}%</div>
            <div className="text-[11px] text-(--foreground-secondary) mt-1">Accuracy</div>
          </div>
          <div className="p-4 rounded-xl bg-(--surface) border border-(--border) text-center">
            <div className="text-2xl font-bold text-emerald-700 font-mono">{sessionStats.correct}</div>
            <div className="text-[11px] text-(--foreground-secondary) mt-1">Correct</div>
          </div>
          <div className="p-4 rounded-xl bg-(--surface) border border-(--border) text-center">
            <div className="text-2xl font-bold text-rose-600 font-mono">{sessionStats.incorrect}</div>
            <div className="text-[11px] text-(--foreground-secondary) mt-1">Incorrect</div>
          </div>
          <div className="p-4 rounded-xl bg-(--surface) border border-(--border) text-center">
            <div className="text-2xl font-bold text-(--foreground-secondary) font-mono">{sessionStats.total - sessionStats.answered}</div>
            <div className="text-[11px] text-(--foreground-secondary) mt-1">Skipped</div>
          </div>
        </div>

        {sessionStats.domains.length > 0 && (
          <div className="rounded-xl bg-(--surface) border border-(--border) divide-y divide-(--border)">
            {sessionStats.domains.map(({ domain, total, correct }) => (
              <div key={domain} className="flex items-center justify-between px-4 py-2.5 text-[12.5px]">
                <span className="text-(--foreground)">{formatDomainName(domain)}</span>
                <span className="font-mono text-(--foreground-secondary)">{correct}/{total}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentIndex(0);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-(--surface) hover:bg-(--brand-soft) text-(--foreground) font-semibold text-[13px] rounded-xl border border-(--border) transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Review answers</span>
          </button>
          <button
            onClick={exitToBank}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-xl transition-colors cursor-pointer"
          >
            <span>Back to Practice Bank</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- ACTIVE SESSION RUNNER VIEW ---
  if (isSessionActive && currentSessionQuestion && currentInteraction) {
    const isLocked = !hasAccessToQuestion(currentSessionQuestion);

    return (
      <div className="max-w-310 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in duration-200">
        {/* Session Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-(--border)">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            <button
              onClick={finishSession}
              disabled={sessionStats.answered === 0}
              className="flex items-center gap-1 text-[12px] font-semibold text-white bg-(--brand-cta) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Finish</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="text-[12.5px] sm:text-[13px] font-bold text-(--foreground) truncate max-w-35 sm:max-w-none">
                {selectedSubject === 'all' ? 'Mixed Drill' : selectedSubject === 'math' ? 'Mathematics Drill' : 'Reading & Writing Drill'}
              </div>
              <span className="text-(--foreground-muted) hidden sm:inline">•</span>
              <span className="text-[11.5px] sm:text-[12px] text-(--foreground-secondary) font-mono">
                Item {currentIndex + 1} of {sessionQuestionIds.length}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 border rounded-lg text-[12px] font-mono ${
                isTimerPaused ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-(--brand-soft) border-(--border) text-(--foreground)'
              }`}
              title={isTimerPaused ? 'Timer paused while reviewing explanation' : 'Time spent solving'}
            >
              <Clock className={`w-3.5 h-3.5 ${isTimerPaused ? 'text-amber-600' : 'text-(--brand-text)'}`} />
              <span>
                {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
              </span>
              {isTimerPaused && <span className="ml-1 text-[10px] font-sans font-bold uppercase tracking-wider">Paused</span>}
            </div>

            {(selectedSubject === 'math' || selectedSubject === 'all') && (
              <button
                onClick={() => setIsDesmosOpen(true)}
                className="px-2.5 sm:px-3 py-1 bg-(--surface) hover:bg-(--brand-soft) text-[11.5px] sm:text-[12px] font-medium text-(--foreground) border border-(--border) rounded-lg transition-colors cursor-pointer active:scale-95"
              >
                Desmos
              </button>
            )}

            <button
              onClick={() => setIsFormulasOpen(true)}
              className="px-2.5 sm:px-3 py-1 bg-(--surface) hover:bg-(--brand-soft) text-[11.5px] sm:text-[12px] font-medium text-(--foreground) border border-(--border) rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              Formulas
            </button>

            {/* Desktop Matrix Expand Button — hidden by default */}
            <button
              onClick={() => setIsDesktopMatrixOpen((v) => !v)}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-(--surface) hover:bg-(--brand-soft) text-[11.5px] sm:text-[12px] font-medium text-(--foreground) border border-(--border) rounded-lg transition-colors cursor-pointer active:scale-95"
              aria-expanded={isDesktopMatrixOpen}
              aria-controls="practice-matrix"
            >
              {isDesktopMatrixOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              <span>{isDesktopMatrixOpen ? 'Hide Matrix' : `Matrix (${currentIndex + 1}/${sessionQuestionIds.length})`}</span>
            </button>
            {/* Mobile Navigator Matrix Toggle Button */}
            <button
              onClick={() => setIsMobileMatrixOpen(true)}
              className="lg:hidden px-2.5 sm:px-3 py-1 bg-(--brand-cta) text-white text-[11.5px] sm:text-[12px] font-medium rounded-lg shadow-xs cursor-pointer active:scale-95"
            >
              Matrix ({currentIndex + 1}/{sessionQuestionIds.length})
            </button>
          </div>
        </div>

        {/* Progress — clear at-a-glance while solving */}
        {(() => {
          const { total, answered, correct, incorrect } = sessionStats;
          const pct = total ? Math.round((answered / total) * 100) : 0;
          return (
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-3 sm:p-4 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-3 font-medium">
                  <span className="text-[var(--foreground)] font-bold">
                    Progress {answered}/{total}
                  </span>
                  <span className="hidden sm:inline text-[var(--foreground-muted)]">•</span>
                  <span className="text-emerald-700">{correct} correct</span>
                  <span className="text-[var(--foreground-muted)]">•</span>
                  <span className="text-rose-600">{incorrect} incorrect</span>
                  <span className="text-[var(--foreground-muted)]">•</span>
                  <span className="text-[var(--foreground-secondary)]">{total - answered} remaining</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[var(--foreground-secondary)]">{pct}%</span>
                  <button
                    onClick={() => setIsDesktopMatrixOpen(true)}
                    className="hidden lg:inline-flex text-[11px] font-semibold text-[var(--brand-text)] hover:underline"
                  >
                    See matrix
                  </button>
                  <button
                    onClick={() => setIsMobileMatrixOpen(true)}
                    className="lg:hidden text-[11px] font-semibold text-[var(--brand-text)] hover:underline"
                  >
                    See matrix
                  </button>
                </div>
              </div>
              <div className="h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-cta)] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isTimerPaused && answered < total && (
                <p className="text-[11px] text-[var(--foreground-secondary)]">Timer paused while you review the explanation.</p>
              )}
              {answered === total && total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-emerald-700">
                    All done! Timer stopped at {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}.
                  </p>
                  <button
                    onClick={finishSession}
                    className="text-[11px] font-semibold text-(--brand-text) hover:underline"
                  >
                    See results →
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Runner Question Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className={`${isDesktopMatrixOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5 sm:space-y-6`}>
            <QuestionCard
              question={currentSessionQuestion}
              interactionState={currentInteraction}
              onSelectAnswer={handleSelectAnswer}
              onEnteredAnswer={handleEnteredAnswer}
              onToggleCrossOut={handleToggleCrossOut}
              onToggleBookmark={handleToggleBookmark}
              onToggleMarkForReview={handleToggleMarkForReview}
              onSubmitAnswer={handleSubmitAnswer}
              onRetryProblem={handleRetryProblem}
              onNextQuestion={handleNextQuestion}
              isLocked={isLocked}
              onUnlock={onOpenPricing}
              onOpenDesmos={() => setIsDesmosOpen(true)}
              onOpenFormulas={() => setIsFormulasOpen(true)}
              onReportIssue={onSubmitFeedback ? () => setReportingQuestion(currentSessionQuestion) : undefined}
              isCrossOutModeActive={isCrossOutMode}
              onToggleCrossOutMode={() => setIsCrossOutMode(!isCrossOutMode)}
              showExplanationImmediately={true}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-(--surface) rounded-xl border border-(--border)">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  questionStartMsRef.current = getNow();
                  setCurrentIndex((idx) => Math.max(0, idx - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[12px] font-medium transition-colors ${
                  currentIndex === 0
                    ? 'text-(--foreground-muted) cursor-not-allowed'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--brand-soft) border border-(--border) cursor-pointer active:scale-95'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-[12px] text-(--foreground-secondary) font-mono">
                {currentIndex + 1} / {sessionQuestionIds.length}
              </span>

              <button
                disabled={currentIndex === sessionQuestionIds.length - 1}
                onClick={() => {
                  questionStartMsRef.current = getNow();
                  setCurrentIndex((idx) => Math.min(sessionQuestionIds.length - 1, idx + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  currentIndex === sessionQuestionIds.length - 1
                    ? 'text-(--foreground-muted) cursor-not-allowed'
                    : 'bg-(--brand-cta) hover:bg-(--brand-hover) text-white shadow-xs cursor-pointer active:scale-95'
                }`}
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsSessionActive(false)}
              className="flex items-center gap-1 text-[12px] font-medium text-(--foreground-secondary) hover:text-(--foreground) px-2.5 sm:px-3 py-1.5 rounded-lg border border-(--border) hover:bg-(--brand-soft) transition-colors cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>End Practice</span>
            </button>
          </div>

          {/* Desktop Right Matrix Navigator — hidden by default, expands on button */}
          {isDesktopMatrixOpen && (
            <div id="practice-matrix" className="hidden lg:block lg:col-span-4 space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <QuestionNavigator
                totalQuestions={sessionQuestionIds.length}
                currentIndex={currentIndex}
                interactions={sessionInteractions}
                questionIds={sessionQuestionIds}
                questions={questions}
                onSelectIndex={(idx) => {
                  questionStartMsRef.current = getNow();
                  setCurrentIndex(idx);
                }}
                title="Practice Matrix"
              />
              <button
                onClick={() => setIsDesktopMatrixOpen(false)}
                className="w-full py-2 text-[11px] font-medium text-(--foreground-secondary) hover:text-(--foreground) border border-(--border) rounded-lg bg-(--surface) hover:bg-(--surface-soft) transition-colors"
              >
                Collapse Matrix
              </button>
            </div>
          )}
        </div>

        {/* Mobile Matrix Drawer Bottom Sheet */}
        {isMobileMatrixOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end animate-in fade-in duration-150">
            <div className="w-full bg-(--surface) rounded-t-2xl max-h-[80vh] flex flex-col p-5 space-y-4 border-t border-(--border) shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-safe">
              <div className="flex items-center justify-between pb-2 border-b border-(--border)">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-(--brand-cta)" />
                  <span className="font-bold text-[13px] text-(--foreground) uppercase tracking-wider">Practice Matrix</span>
                </div>
                <button
                  onClick={() => setIsMobileMatrixOpen(false)}
                  className="p-1 text-(--foreground-secondary) hover:text-(--foreground) rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <QuestionNavigator
                totalQuestions={sessionQuestionIds.length}
                currentIndex={currentIndex}
                interactions={sessionInteractions}
                questionIds={sessionQuestionIds}
                questions={questions}
                onSelectIndex={(idx) => {
                  questionStartMsRef.current = getNow();
                  setCurrentIndex(idx);
                  setIsMobileMatrixOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="Select Item to Jump"
              />
            </div>
          </div>
        )}

        <DesmosModal isOpen={isDesmosOpen} onClose={() => setIsDesmosOpen(false)} />
        <FormulaReferenceModal isOpen={isFormulasOpen} onClose={() => setIsFormulasOpen(false)} />
        {onSubmitFeedback && (
          <QuestionFeedbackModal
            question={reportingQuestion}
            onClose={() => setReportingQuestion(null)}
            onSubmit={(message) => onSubmitFeedback(reportingQuestion!.id, message)}
          />
        )}
      </div>
    );
  }

  // --- PRACTICE HUB / QUESTION BROWSER VIEW ---
  // Free questions are visible to guests, but answering requires an account.
  return (
    <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Backdrop overlay for open dropdowns on touch */}
      {(domainDropdownOpen || difficultyDropdownOpen || sourceDropdownOpen || accessDropdownOpen || sortDropdownOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={closeAllDropdowns} />
      )}

      {/* ============================================================ */}
      {/* 1. PRACTICE HEADER & INTRO */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-5 sm:pb-6 border-b border-(--border)">
        <div className="space-y-2">
          <div className="text-[11px] font-bold tracking-wider text-(--brand-text) uppercase font-mono">
            PRACTICE LIBRARY
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-(--foreground)">
            Precision Question Bank
          </h1>
          <p className="text-[13.5px] sm:text-[14px] text-(--foreground-secondary) max-w-xl leading-relaxed">
            Practice the skills that matter most, with calibrated difficulty and step-by-step solutions.
          </p>

          {/* Small subtle statistics — premium hidden for non-access */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[11.5px] sm:text-[12px] font-mono">
            <span className="font-bold text-(--foreground)">{subjectTotal} Questions</span>
            <span className="text-(--foreground-muted)">•</span>
            <span className="text-(--brand-text) font-semibold">{subjectFree} Free</span>
            <span className="text-(--foreground-muted)">•</span>
            <span className="text-(--foreground-secondary)">{subjectDomains} Domains</span>
            {hiddenPremiumCount > 0 && (
              <button
                onClick={onOpenPricing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3" /> +{hiddenPremiumCount} premium locked
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => handleStartSession()}
          disabled={filteredQuestions.length === 0}
          className="btn-action w-full sm:w-auto px-6 py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 group active:scale-98"
        >
          <span>Start Practice · {filteredQuestions.length} Questions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {!currentUser && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Lock className="w-4 h-4 shrink-0 text-amber-700" />
            <p className="text-[13px] leading-relaxed">
              Free questions are visible, but you need to <span className="font-semibold">sign in</span> to answer, save progress, and view explanations.
            </p>
          </div>
          <button
            onClick={() => onOpenAuth?.()}
            className="shrink-0 px-5 py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[12.5px] rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Sign in / Create account
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. HIGH-LEVEL SUBJECT SWITCHER */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-3 sm:inline-flex p-1 rounded-xl bg-(--surface-soft) border border-(--border)/60 shadow-2xs w-full sm:w-auto">
          <button
            onClick={() => {
              setSelectedSubject('all');
              setSelectedDomains([]);
              setSelectedTopics([]);
              setSelectedSources([]);
            }}
            className={`py-2.5 px-4 sm:px-5 rounded-lg text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer text-center ${
              selectedSubject === 'all'
                ? 'bg-(--surface) shadow-xs font-semibold text-(--foreground)'
                : 'text-(--foreground-secondary) hover:text-(--foreground)'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => {
              setSelectedSubject('math');
              setSelectedDomains([]);
              setSelectedTopics([]);
              setSelectedSources([]);
            }}
            className={`py-2.5 px-4 sm:px-5 rounded-lg text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer text-center ${
              selectedSubject === 'math'
                ? 'bg-(--surface) shadow-xs font-semibold text-(--foreground)'
                : 'text-(--foreground-secondary) hover:text-(--foreground)'
            }`}
          >
            MATHEMATICS
          </button>
          <button
            onClick={() => {
              setSelectedSubject('reading_writing');
              setSelectedDomains([]);
              setSelectedTopics([]);
              setSelectedSources([]);
            }}
            className={`py-2.5 px-4 sm:px-5 rounded-lg text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer text-center ${
              selectedSubject === 'reading_writing'
                ? 'bg-(--surface) shadow-xs font-semibold text-(--foreground)'
                : 'text-(--foreground-secondary) hover:text-(--foreground)'
            }`}
          >
            READING & WRITING
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-[12px] font-medium text-(--brand-text) hover:underline cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. FILTER TOOLBAR & SEARCH */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left Filter Dropdowns — checkboxes (sketch pages 2-4) */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
          {/* Domain — multi checkbox */}
          <div className="relative">
            <button
              onClick={() => {
                setDomainDropdownOpen(!domainDropdownOpen);
                setDifficultyDropdownOpen(false);
                setSourceDropdownOpen(false);
                setAccessDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedDomains.length > 0
                  ? 'bg-teal-50 border-(--brand) text-(--brand-text) font-semibold'
                  : 'bg-(--surface) border-(--border) hover:bg-(--brand-soft) text-(--foreground)'
              }`}
            >
              <span className="truncate max-w-32.5">
                {selectedDomains.length === 0
                  ? 'Domain'
                  : selectedDomains.length === 1
                    ? formatDomainName(selectedDomains[0])
                    : `${selectedDomains.length} Domains`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-(--foreground-secondary) shrink-0" />
            </button>

            {domainDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-80 max-w-[calc(100vw-2rem)] bg-(--surface) rounded-xl shadow-lg border border-(--border) p-2.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-[11px] font-bold tracking-wider text-(--foreground-secondary) uppercase">Domains</span>
                  {selectedDomains.length > 0 && (
                    <button onClick={() => setSelectedDomains([])} className="text-[11px] font-semibold text-(--brand-text) hover:underline">Clear</button>
                  )}
                </div>
                {(() => {
                  const domains = selectedSubject === 'all' ? [...mathDomains, ...rwDomains] : selectedSubject === 'math' ? mathDomains : rwDomains;
                  const groupLabel = selectedSubject === 'all' ? 'All' : selectedSubject === 'math' ? 'Math' : 'Reading & Writing';
                  return (
                    <>
                      <div className="pb-1.5 px-1 text-[10px] font-bold text-(--foreground-secondary) uppercase tracking-wider">{groupLabel}</div>
                      <div className="grid grid-cols-1 gap-0.5 max-h-64 overflow-y-auto">
                        {domains.map((dom) => {
                          const checked = selectedDomains.includes(dom);
                          return (
                            <label key={dom} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-teal-50 text-(--brand-text)' : 'hover:bg-(--brand-soft) text-(--foreground)'}`}>
                              <input type="checkbox" checked={checked} onChange={() => toggleIn(selectedDomains, dom, setSelectedDomains)} className="w-3.5 h-3.5 rounded border-(--border) text-(--brand-cta) accent-[var(--brand-cta)]" />
                              <span className={`flex-1 truncate ${checked ? 'font-semibold' : ''}`}>{formatDomainName(dom)}</span>
                              {checked && <Check className="w-3.5 h-3.5 text-(--brand-text) shrink-0" />}
                            </label>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Difficulty — multi checkbox (sketch: easy/medium) */}
          <div className="relative">
            <button
              onClick={() => {
                setDifficultyDropdownOpen(!difficultyDropdownOpen);
                setDomainDropdownOpen(false);
                setSourceDropdownOpen(false);
                setAccessDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedDifficulties.length > 0
                  ? 'bg-teal-50 border-(--brand) text-(--brand-text) font-semibold'
                  : 'bg-(--surface) border-(--border) hover:bg-(--brand-soft) text-(--foreground)'
              }`}
            >
              <span className="capitalize">
                {selectedDifficulties.length === 0 ? 'Difficulty' : selectedDifficulties.length === 1 ? selectedDifficulties[0] : `${selectedDifficulties.length} Levels`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-(--foreground-secondary) shrink-0" />
            </button>

            {difficultyDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-48 bg-(--surface) rounded-xl shadow-lg border border-(--border) p-2 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-[11px] font-bold tracking-wider text-(--foreground-secondary) uppercase">Difficulty</span>
                  {selectedDifficulties.length > 0 && <button onClick={() => setSelectedDifficulties([])} className="text-[11px] font-semibold text-(--brand-text) hover:underline">Clear</button>}
                </div>
                {(['easy', 'medium', 'hard'] as const).map((diff) => {
                  const checked = selectedDifficulties.includes(diff);
                  return (
                    <label key={diff} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer capitalize transition-colors ${checked ? 'bg-teal-50 text-(--brand-text) font-semibold' : 'hover:bg-(--brand-soft) text-(--foreground)'}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleIn(selectedDifficulties, diff, setSelectedDifficulties)} className="w-3.5 h-3.5 rounded border-(--border) accent-[var(--brand-cta)]" />
                      <span className="flex-1">{diff}</span>
                      {checked && <Check className="w-3.5 h-3.5 text-(--brand-text)" />}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Source — multi checkbox (sketch: College Panda, Suite 1b, Previous year) */}
          <div className="relative">
            <button
              onClick={() => {
                setSourceDropdownOpen(!sourceDropdownOpen);
                setDomainDropdownOpen(false);
                setDifficultyDropdownOpen(false);
                setAccessDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedSources.length > 0
                  ? 'bg-teal-50 border-(--brand) text-(--brand-text) font-semibold'
                  : 'bg-(--surface) border-(--border) hover:bg-(--brand-soft) text-(--foreground)'
              }`}
            >
              <span className="truncate max-w-32.5">{selectedSources.length === 0 ? 'Source' : selectedSources.length === 1 ? selectedSources[0] : `${selectedSources.length} Sources`}</span>
              <ChevronDown className="w-3.5 h-3.5 text-(--foreground-secondary) shrink-0" />
            </button>
            {sourceDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-64 max-w-[calc(100vw-2rem)] bg-(--surface) rounded-xl shadow-lg border border-(--border) p-2 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-[11px] font-bold tracking-wider text-(--foreground-secondary) uppercase">Source</span>
                  {selectedSources.length > 0 && <button onClick={() => setSelectedSources([])} className="text-[11px] font-semibold text-(--brand-text) hover:underline">Clear</button>}
                </div>
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {availableSources.length === 0 ? (
                    <p className="px-2.5 py-2 text-[12px] text-(--foreground-secondary)">No sources for this subject</p>
                  ) : (
                    availableSources.map((src) => {
                      const checked = selectedSources.includes(src);
                      return (
                        <label key={src} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${checked ? 'bg-teal-50 text-(--brand-text) font-semibold' : 'hover:bg-(--brand-soft) text-(--foreground)'}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleIn(selectedSources, src, setSelectedSources)} className="w-3.5 h-3.5 rounded accent-[var(--brand-cta)]" />
                          <span className="flex-1 truncate">{src}</span>
                          {checked && <Check className="w-3.5 h-3.5 text-(--brand-text) shrink-0" />}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Access Dropdown (single, unchanged) */}
          <div className="relative">
            <button
              onClick={() => {
                setAccessDropdownOpen(!accessDropdownOpen);
                setDomainDropdownOpen(false);
                setDifficultyDropdownOpen(false);
                setSourceDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedAccess !== 'all'
                  ? 'bg-teal-50 border-(--brand) text-(--brand-text) font-semibold'
                  : 'bg-(--surface) border-(--border) hover:bg-(--brand-soft) text-(--foreground)'
              }`}
            >
              <span>
                {selectedAccess === 'all' ? 'Access' : selectedAccess === 'free' ? 'Free Only' : 'Premium Only'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-(--foreground-secondary) shrink-0" />
            </button>

            {accessDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-(--surface) rounded-xl shadow-lg border border-(--border) p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
              >
                {(['all', 'free', 'premium'] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => {
                      setSelectedAccess(acc);
                      setAccessDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      selectedAccess === acc
                        ? 'bg-teal-50 text-(--brand-text) font-semibold'
                        : 'text-(--foreground) hover:bg-(--brand-soft)'
                    }`}
                  >
                    <span>{acc === 'all' ? 'All Access' : acc === 'free' ? 'Free Only' : 'Premium Only'}</span>
                    {selectedAccess === acc && <Check className="w-3.5 h-3.5 text-(--brand-text)" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Filters Drawer Button */}
          <button
            onClick={() => setMoreFiltersOpen(true)}
            className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
              selectedTopics.length > 0
                ? 'bg-teal-50 border-(--brand) text-(--brand-text) font-semibold'
                : 'bg-(--surface) border-(--border) hover:bg-(--brand-soft) text-(--foreground)'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-(--foreground-secondary)" />
            <span>More Filters{selectedTopics.length > 0 ? ` (${selectedTopics.length})` : ''}</span>
          </button>
        </div>

        {/* Right Search Input with ⌘K */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-(--foreground-secondary) absolute left-3 top-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, topics or ID..."
            className="w-full h-10 pl-9 pr-14 border border-(--border) rounded-[10px] text-[12px] focus:outline-none focus:border-(--brand) bg-(--surface) transition-colors shadow-none text-(--foreground)"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-(--foreground-muted) hover:text-(--foreground) p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:block absolute right-2.5 top-2.5 pointer-events-none px-1.5 py-0.5 rounded bg-(--surface-soft) text-[10px] font-mono text-(--foreground-secondary) border border-(--border)">
              ⌘K
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RESULTS HEADER — sketch oval: “216 question” */}
      {/* ============================================================ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 sm:pt-2">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Oval count badge — directly matches sketch */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface) border-2 border-(--brand)/20 text-[12px] font-bold text-(--foreground) shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-(--brand-cta) shrink-0" />
            {filteredQuestions.length} question{filteredQuestions.length === 1 ? '' : 's'}
          </span>
          {activeFiltersCount > 0 && (
            <span className="text-[12px] text-(--foreground-secondary)">
              · {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
            </span>
          )}
          {selectedTopics.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-(--foreground-secondary) max-w-60 truncate">
              <span className="text-(--foreground-muted)">Topics:</span> {selectedTopics.slice(0, 2).join(', ')}{selectedTopics.length > 2 ? ` +${selectedTopics.length - 2}` : ''}
            </span>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-(--foreground) hover:text-(--brand-text) transition-colors cursor-pointer active:scale-95"
          >
            <span className="text-(--foreground-secondary)">Sort:</span>
            <span className="font-semibold capitalize">{sortBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-(--foreground-secondary)" />
          </button>

          {sortDropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-40 bg-(--surface) rounded-xl shadow-lg border border-(--border) p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
            >
              {(['recommended', 'difficulty', 'newest'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSortBy(opt);
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between capitalize ${
                    sortBy === opt
                      ? 'bg-teal-50 text-(--brand-text) font-semibold'
                      : 'text-(--foreground) hover:bg-(--brand-soft)'
                  }`}
                >
                  <span>{opt}</span>
                  {sortBy === opt && <Check className="w-3.5 h-3.5 text-(--brand-text)" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. QUESTION LIST */}
      {/* ============================================================ */}
      {filteredQuestions.length === 0 ? (
        <div className="p-10 sm:p-16 bg-(--surface) rounded-2xl border border-(--border) text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-(--brand-soft) text-(--foreground-secondary) flex items-center justify-center mx-auto border border-(--border)">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-(--foreground) text-base">No questions found</h3>
            <p className="text-[13px] text-(--foreground-secondary) max-w-sm mx-auto">
              No items match your active filters. Clear or adjust your parameters to browse available problems.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-(--navy-section) hover:bg-(--brand-cta) text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer active:scale-95"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {(() => {
            const visible = filteredQuestions.slice(0, visibleCount);
            return (
              <>
                {visible.map((q, idx) => {
                  const hasAccess = hasAccessToQuestion(q);

                  return (
                    <div
                      key={q.id}
                      className="group p-4 sm:p-5 bg-(--surface) rounded-[14px] border border-(--border) hover:border-(--brand)/50 hover:-translate-y-px hover:shadow-xs transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5"
                    >
                      {/* Left: ID & Metadata */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="font-mono font-bold text-(--foreground) bg-(--brand-soft) px-2 py-0.5 rounded border border-(--border)">
                            {q.code}
                          </span>
                          <span className="font-semibold text-(--foreground)">{formatDomainName(q.domain)}</span>
                          <span className="text-(--foreground-muted)">•</span>
                          <span className="text-(--foreground-secondary)">{q.topic}</span>
                          <span className="text-(--foreground-muted)">•</span>

                          {/* Semantic Difficulty */}
                          <span
                            className={`font-semibold capitalize ${
                              q.difficulty === 'easy'
                                ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200'
                                : q.difficulty === 'medium'
                                  ? 'text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200'
                                  : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>

                          {/* Semantic Access Badge */}
                          {q.is_free ? (
                            <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Free
                            </span>
                          ) : (
                            <span className="text-(--brand-text) font-semibold text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-100 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-(--brand-text)" />
                              Premium
                            </span>
                          )}
                        </div>

                        {/* Question Preview Text */}
                        <div className="text-[13.5px] text-(--foreground) font-normal leading-relaxed line-clamp-2 wrap-break-word">
                          <MathRenderer content={q.question_text} />
                        </div>
                      </div>

                      {/* Right: Action */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full md:w-auto">
                        {hasAccess ? (
                          <button
                            onClick={() => handleStartSession(filteredQuestions, idx)}
                            className="w-full md:w-auto px-5 py-2.5 bg-(--navy-section) hover:bg-(--brand-cta) text-white font-medium text-[12px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group/btn active:scale-95"
                          >
                            <span>Practice</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                          </button>
                        ) : (
                          <button
                            onClick={onOpenPricing}
                            className="w-full md:w-auto px-4 py-2.5 bg-(--surface) hover:bg-(--brand-soft) text-(--brand-text) font-semibold text-[12px] rounded-lg border border-(--border) transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Lock className="w-3.5 h-3.5 text-(--brand-text)" />
                            <span>Unlock Premium</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredQuestions.length > visible.length && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="px-5 py-2 bg-(--surface) hover:bg-(--brand-soft) border border-(--border) rounded-xl text-[12px] font-semibold text-(--foreground) transition-colors"
                    >
                      Load more ({filteredQuestions.length - visible.length} remaining)
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ADVANCED FILTER SIDE DRAWER */}
      {/* ============================================================ */}
      {moreFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-(--surface) h-full p-5 sm:p-6 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 pb-safe">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-(--border)">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-(--brand-text)" />
                  <h3 className="font-bold text-(--foreground) text-base">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setMoreFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Topics grouped by domain — mirrors sketch page 3 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-(--foreground-secondary) uppercase tracking-wider">
                    Topics by Domain
                  </label>
                  {selectedTopics.length > 0 && (
                    <button onClick={() => setSelectedTopics([])} className="text-[11px] font-semibold text-(--brand-text) hover:underline">Clear</button>
                  )}
                </div>
                <div className="space-y-4 max-h-[32vh] overflow-y-auto pr-1">
                  {Array.from(topicsByDomain.entries()).map(([domain, topics]) => {
                    const all = Array.from(topics).sort();
                    return (
                      <div key={domain} className="space-y-1.5">
                        <div className="text-[11px] font-bold text-(--foreground) bg-(--surface-soft) px-2.5 py-1 rounded-lg border border-(--border)/60 flex items-center justify-between">
                          <span>{formatDomainName(domain)}</span>
                          <span className="text-[10px] font-mono text-(--foreground-secondary)">{all.length}</span>
                        </div>
                        <div className="space-y-0.5 pl-1">
                          {all.map((top) => {
                            const checked = selectedTopics.includes(top);
                            return (
                              <label key={top} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-[12px] transition-colors ${checked ? 'bg-teal-50 text-(--brand-text) font-medium' : 'hover:bg-(--brand-soft) text-(--foreground)'}`}>
                                <input type="checkbox" checked={checked} onChange={() => toggleIn(selectedTopics, top, setSelectedTopics)} className="w-3.5 h-3.5 rounded accent-[var(--brand-cta)] shrink-0" />
                                <span className="flex-1 leading-tight">{top}</span>
                                {checked && <Check className="w-3.5 h-3.5 text-(--brand-text) shrink-0" />}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {topicsByDomain.size === 0 && <p className="text-[12px] text-(--foreground-secondary) px-2">No topics for this subject</p>}
                </div>
              </div>

              {/* Sources — sketch page 4: College Panda / Suite 1b / Previous year */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-(--foreground-secondary) uppercase tracking-wider">Source</label>
                  {selectedSources.length > 0 && <button onClick={() => setSelectedSources([])} className="text-[11px] font-semibold text-(--brand-text) hover:underline">Clear</button>}
                </div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto pr-1">
                  {availableSources.map((src) => {
                    const checked = selectedSources.includes(src);
                    return (
                      <label key={src} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-[12px] transition-colors ${checked ? 'bg-teal-50 text-(--brand-text) font-medium' : 'hover:bg-(--brand-soft) text-(--foreground)'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleIn(selectedSources, src, setSelectedSources)} className="w-3.5 h-3.5 rounded accent-[var(--brand-cta)]" />
                        <span className="flex-1 truncate">{src}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-(--brand-text) shrink-0" />}
                      </label>
                    );
                  })}
                  {availableSources.length === 0 && <p className="text-[12px] text-(--foreground-secondary) px-2">No sources</p>}
                </div>
              </div>

              {/* Difficulty — multi checkbox */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-(--foreground-secondary) uppercase tracking-wider">Difficulty</label>
                  {selectedDifficulties.length > 0 && <button onClick={() => setSelectedDifficulties([])} className="text-[11px] font-semibold text-(--brand-text) hover:underline">Clear</button>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => {
                    const checked = selectedDifficulties.includes(diff);
                    return (
                      <label key={diff} className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-medium border capitalize cursor-pointer transition-colors ${checked ? 'bg-(--brand-cta) text-white border-(--brand-cta) font-bold' : 'bg-(--brand-soft) text-(--foreground) border-(--border) hover:bg-(--surface-soft)'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleIn(selectedDifficulties, diff, setSelectedDifficulties)} className="w-3.5 h-3.5 rounded accent-white hidden" />
                        {diff}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Access Quick Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-(--foreground-secondary) uppercase tracking-wider">
                  Access Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setSelectedAccess(selectedAccess === 'free' ? 'all' : 'free')
                    }
                    className={`py-2 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer active:scale-95 ${
                      selectedAccess === 'free'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-(--brand-soft) text-(--foreground) border-(--border) hover:bg-(--surface-soft)'
                    }`}
                  >
                    Free Only
                  </button>
                  <button
                    onClick={() =>
                      setSelectedAccess(selectedAccess === 'premium' ? 'all' : 'premium')
                    }
                    className={`py-2 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer active:scale-95 ${
                      selectedAccess === 'premium'
                        ? 'bg-(--brand-cta) text-white border-(--brand-cta) font-bold'
                        : 'bg-(--brand-soft) text-(--foreground) border-(--border) hover:bg-(--surface-soft)'
                    }`}
                  >
                    Premium Only
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-(--border) flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTopics([]);
                  setSelectedSources([]);
                  setSelectedDifficulties([]);
                  setSelectedDomains([]);
                  setSelectedAccess('all');
                }}
                className="flex-1 py-2.5 bg-(--surface-soft) hover:bg-(--border) text-(--foreground) text-[13px] font-medium rounded-lg transition-colors cursor-pointer active:scale-95"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setMoreFiltersOpen(false)}
                className="flex-1 py-2.5 bg-(--brand-cta) hover:bg-(--brand-hover) text-white text-[13px] font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
