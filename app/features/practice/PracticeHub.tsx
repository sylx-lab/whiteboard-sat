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
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Clock,
  Trophy,
  Eye,
  Target,
  Bookmark,
  Flag,
  BarChart2,
} from 'lucide-react';
import {
  Question,
  Subject,
  Domain,
  Difficulty,
  QuestionInteractionState,
  UserProfile,
  PracticeAttempt,
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
  attempts?: PracticeAttempt[];
  onLogAttempt: (question: Question, answer: string, timeSpent: number) => void;
  onToggleBookmark?: (questionId: string) => void;
  onOpenPricing: () => void;
  onOpenAuth?: () => void;
  onSubmitFeedback?: (questionId: string, message: string) => Promise<unknown>;
}

type SortOption = QuestionSortOption;

const getNow = () => Date.now();

const FilterStep: React.FC<{ n: number; title: string; hint?: string; children?: React.ReactNode }> = ({ n, title, hint, children }) => (
  <fieldset className="min-w-0 space-y-2.5">
    <legend className="flex items-center gap-2 text-[12.5px] font-bold text-(--foreground)">
      <span className="w-5 h-5 rounded-full bg-(--brand-soft) text-(--brand-text) text-[11px] flex items-center justify-center font-mono">{n}</span>
      {title}
      {hint && <span className="font-normal text-[11.5px] text-(--foreground-secondary)">· {hint}</span>}
    </legend>
    <div className="flex flex-wrap gap-2">{children}</div>
  </fieldset>
);

const Chip: React.FC<{ on: boolean; onClick: () => void; count?: number; children: React.ReactNode }> = ({ on, onClick, count, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={`h-9 px-3 rounded-[10px] border text-[12px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors active:scale-95 ${
      on ? 'bg-(--brand-cta) border-(--brand-cta) text-white' : 'bg-(--surface) border-(--border) text-(--foreground) hover:bg-(--brand-soft)'
    }`}
  >
    {on && <Check className="w-3.5 h-3.5" />}
    {children}
    {count !== undefined && <span className={`font-mono text-[11px] ${on ? 'text-white/80' : 'text-(--foreground-secondary)'}`}>{count}</span>}
  </button>
);

export const PracticeHub: React.FC<PracticeHubProps> = ({
  questions,
  currentUser,
  hasAccessToQuestion,
  attempts = [],
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

  // Latest saved result per question (attempts arrive newest first), so a question
  // solved last week still shows green/red in the matrix.
  const history = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of attempts) if (!(a.questionId in map)) map[a.questionId] = a.isCorrect;
    return map;
  }, [attempts]);

  // Dropping a domain also drops its topics, or they would keep filtering unseen.
  const toggleDomain = (d: Domain) => {
    if (selectedDomains.includes(d)) {
      const gone = topicsByDomain.get(d) ?? new Set<string>();
      setSelectedTopics(selectedTopics.filter((t) => !gone.has(t)));
    }
    toggleIn(selectedDomains, d, setSelectedDomains);
  };

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
  const domainCounts = useMemo(() => {
    const m = new Map<Domain, number>();
    for (const q of accessibleForSubject) m.set(q.domain, (m.get(q.domain) ?? 0) + 1);
    return m;
  }, [accessibleForSubject]);
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
    let flagged = 0;
    let totalTimeSpentAnswered = 0;
    const byDomain = new Map<Domain, { total: number; correct: number }>();

    sessionQuestionIds.forEach((id) => {
      const inter = sessionInteractions[id];
      const q = questions.find((qq) => qq.id === id);
      if (inter?.isMarkedForReview) flagged += 1;
      if (!inter?.isSubmitted || !q) return;
      answered += 1;
      totalTimeSpentAnswered += (inter.timeSpentSeconds || 0);
      const isCorrect = isSprQuestion(q) ? isSprAnswerCorrect(q, inter.enteredAnswer) : inter.selectedAnswer === q.correct_answer;
      if (isCorrect) correct += 1;
      const bucket = byDomain.get(q.domain) ?? { total: 0, correct: 0 };
      bucket.total += 1;
      if (isCorrect) bucket.correct += 1;
      byDomain.set(q.domain, bucket);
    });

    const incorrect = answered - correct;
    const avgSeconds = answered > 0
      ? Math.round(totalTimeSpentAnswered > 0 ? totalTimeSpentAnswered / answered : sessionTimer / answered)
      : 0;

    const avgTimeFormatted = avgSeconds >= 60
      ? `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`
      : `${avgSeconds}s`;

    return {
      total,
      answered,
      correct,
      incorrect,
      flagged,
      avgSeconds,
      avgTimeFormatted,
      accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      domains: Array.from(byDomain.entries()).map(([domain, s]) => ({ domain, ...s })),
    };
  }, [sessionQuestionIds, sessionInteractions, questions, sessionTimer]);

  const finishSession = () => {
    setShowResults(true);
  };

  const handleEndPractice = () => {
    if (sessionStats.answered > 0) {
      setShowResults(true);
    } else {
      setIsSessionActive(false);
    }
  };

  const exitToBank = () => {
    setShowResults(false);
    setIsSessionActive(false);
  };

  // --- SESSION RESULT SCREEN ---
  if (isSessionActive && showResults) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-(--brand-soft) text-(--brand-text) flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-(--foreground)">Practice Session Report</h1>
          <p className="text-[13.5px] text-(--foreground-secondary)">
            Great job! Review your performance metrics and question breakdown below.
          </p>
        </div>

        {/* 6 Key Performance Indicators (Solved, Avg Time, Accuracy, Correct, Wrong, Flagged) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Questions Solved */}
          <div className="p-3.5 rounded-xl bg-(--surface) border border-(--border) flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-(--foreground-secondary) mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Solved</span>
              <CheckCircle2 className="w-4 h-4 text-(--brand-cta)" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-(--foreground)">
                {sessionStats.answered} <span className="text-xs font-normal text-(--foreground-secondary)">/ {sessionStats.total}</span>
              </div>
              <div className="text-[10.5px] text-(--foreground-muted) mt-0.5">
                {sessionStats.total - sessionStats.answered} skipped
              </div>
            </div>
          </div>

          {/* 2. Avg Time / Question */}
          <div className="p-3.5 rounded-xl bg-(--surface) border border-(--border) flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-(--foreground-secondary) mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Time</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-(--foreground)">
                {sessionStats.avgTimeFormatted}
              </div>
              <div className="text-[10.5px] text-(--foreground-muted) mt-0.5">
                {Math.floor(sessionTimer / 60)}m {(sessionTimer % 60).toString().padStart(2, '0')}s total
              </div>
            </div>
          </div>

          {/* 3. Accuracy */}
          <div className="p-3.5 rounded-xl bg-(--surface) border border-(--border) flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-(--foreground-secondary) mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Accuracy</span>
              <Target className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-(--foreground)">
                {sessionStats.accuracy}%
              </div>
              <div className="text-[10.5px] text-(--foreground-muted) mt-0.5">
                overall score
              </div>
            </div>
          </div>

          {/* 4. Correct Count */}
          <div className="p-3.5 rounded-xl bg-(--surface) border border-(--border) flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-(--foreground-secondary) mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Correct</span>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {sessionStats.correct}
              </div>
              <div className="text-[10.5px] text-emerald-600/80 mt-0.5">
                accurate answers
              </div>
            </div>
          </div>

          {/* 5. Incorrect Count */}
          <div className="p-3.5 rounded-xl bg-(--surface) border border-(--border) flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-(--foreground-secondary) mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Wrong</span>
              <X className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                {sessionStats.incorrect}
              </div>
              <div className="text-[10.5px] text-rose-600/80 mt-0.5">
                needs review
              </div>
            </div>
          </div>

          {/* 6. Flagged Count */}
          <div className="p-3.5 rounded-xl bg-(--surface) border border-(--border) flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between text-(--foreground-secondary) mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Flagged</span>
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            </div>
            <div>
              <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
                {sessionStats.flagged}
              </div>
              <div className="text-[10.5px] text-amber-600/80 mt-0.5">
                marked for review
              </div>
            </div>
          </div>
        </div>

        {/* Domain Breakdown */}
        {sessionStats.domains.length > 0 && (
          <div className="rounded-xl bg-(--surface) border border-(--border) p-4 space-y-3 shadow-2xs">
            <h2 className="text-[13px] font-bold text-(--foreground) uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-(--brand-cta)" />
              <span>Domain Performance</span>
            </h2>
            <div className="space-y-2.5">
              {sessionStats.domains.map(({ domain, total, correct }) => {
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <div key={domain} className="space-y-1">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="text-(--foreground) font-medium">{formatDomainName(domain)}</span>
                      <span className="font-mono text-(--foreground-secondary)">{correct} / {total} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)/50">
                      <div
                        className="h-full bg-(--brand-cta) transition-all rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question-by-Question Review Matrix */}
        <div className="rounded-xl bg-(--surface) border border-(--border) p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-(--foreground) uppercase tracking-wider">
              Question Breakdown
            </h2>
            <span className="text-[11.5px] text-(--foreground-secondary)">Click question to inspect & review</span>
          </div>
          <div className="divide-y divide-(--border) border border-(--border) rounded-lg overflow-hidden">
            {sessionQuestionIds.map((id, index) => {
              const q = questions.find((item) => item.id === id);
              const inter = sessionInteractions[id];
              const isSubmitted = inter?.isSubmitted;
              if (!isSubmitted) return null;
              const isCorrect = isSubmitted && q
                ? (isSprQuestion(q) ? isSprAnswerCorrect(q, inter.enteredAnswer) : inter.selectedAnswer === q.correct_answer)
                : false;
              const isFlagged = inter?.isMarkedForReview;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setShowResults(false);
                    setCurrentIndex(index);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-(--surface-soft) transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px] font-bold text-(--foreground-secondary) w-6">
                      #{index + 1}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      !isSubmitted
                        ? 'bg-neutral-300 dark:bg-neutral-600'
                        : isCorrect
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`} />
                    <span className="text-[12.5px] font-medium text-(--foreground) truncate max-w-50 sm:max-w-xs">
                      {q?.topic || (q ? formatDomainName(q.domain) : `Question ${index + 1}`)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isFlagged && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        <Bookmark className="w-3 h-3 fill-amber-500" />
                        <span>Flagged</span>
                      </span>
                    )}
                    <span className={`text-[12px] font-semibold px-2 py-0.5 rounded ${
                      !isSubmitted
                        ? 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                        : isCorrect
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50'
                    }`}>
                      {!isSubmitted ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {sessionStats.total > sessionStats.answered && (
            <p className="text-[11.5px] text-(--foreground-secondary)">
              {sessionStats.total - sessionStats.answered} of {sessionStats.total} questions in this set were not attempted.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentIndex(0);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-(--surface) hover:bg-(--brand-soft) text-(--foreground) font-semibold text-[13px] rounded-xl border border-(--border) transition-colors cursor-pointer active:scale-98"
          >
            <Eye className="w-4 h-4" />
            <span>Review Questions</span>
          </button>
          <button
            onClick={exitToBank}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-xl transition-colors cursor-pointer active:scale-98 shadow-xs"
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
            <button
              onClick={() => setIsMobileMatrixOpen(true)}
              className="lg:hidden px-2.5 sm:px-3 py-1 bg-(--brand-cta) text-white text-[11.5px] sm:text-[12px] font-medium rounded-lg shadow-xs cursor-pointer active:scale-95"
            >
              <span className="hidden sm:inline">Matrix </span>({currentIndex + 1}/{sessionQuestionIds.length})
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

              {currentIndex < sessionQuestionIds.length - 1 ? (
                <button
                  onClick={() => {
                    questionStartMsRef.current = getNow();
                    setCurrentIndex((idx) => Math.min(sessionQuestionIds.length - 1, idx + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[12px] font-semibold transition-colors bg-(--brand-cta) hover:bg-(--brand-hover) text-white shadow-xs cursor-pointer active:scale-95"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={finishSession}
                  className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[12px] font-semibold transition-colors bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer active:scale-95"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Finish Practice</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleEndPractice}
                className="flex items-center gap-1 text-[12px] font-medium text-(--foreground-secondary) hover:text-(--foreground) px-2.5 sm:px-3 py-1.5 rounded-lg border border-(--border) hover:bg-(--brand-soft) transition-colors cursor-pointer active:scale-95"
                title="End practice session and view report"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>End Practice</span>
              </button>

              <button
                onClick={finishSession}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer active:scale-95"
                title="Finish practice session and see report"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Finish Practice</span>
              </button>
            </div>
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
                history={history}
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

        {/* Mobile / Tablet Matrix Drawer Dialog */}
        {isMobileMatrixOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end md:items-center md:justify-center p-0 md:p-4 animate-in fade-in duration-150">
            <div className="w-full md:max-w-md bg-(--surface) rounded-t-2xl md:rounded-2xl max-h-[85vh] md:max-h-[85dvh] flex flex-col p-5 space-y-4 border-t md:border border-(--border) shadow-2xl overflow-y-auto animate-in slide-in-from-bottom md:zoom-in-95 duration-200 pb-safe md:pb-5">
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
                history={history}
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
      {/* ============================================================ */}
      {/* 3. SET BUILDER — domain → topic → source & difficulty (sketch)  */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-(--surface) border border-(--border) p-4 sm:p-5 space-y-5">
        <div className="relative">
          <Search className="w-4 h-4 text-(--foreground-secondary) absolute left-3 top-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, topics or ID..."
            className="w-full h-10 pl-9 pr-10 border border-(--border) rounded-[10px] text-[12px] focus:outline-none focus:border-(--brand) bg-(--surface) text-(--foreground)"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-2.5 text-(--foreground-muted) hover:text-(--foreground) p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <FilterStep n={1} title="Domain" hint="Pick one or more — leave empty for all">
          {(selectedSubject === 'all' ? [...mathDomains, ...rwDomains] : selectedSubject === 'math' ? mathDomains : rwDomains).map((d) => (
            <Chip key={d} on={selectedDomains.includes(d)} onClick={() => toggleDomain(d)} count={domainCounts.get(d) ?? 0}>
              {formatDomainName(d)}
            </Chip>
          ))}
        </FilterStep>

        <FilterStep n={2} title="Topic" hint={selectedDomains.length ? 'Narrow within your domains' : 'Choose a domain first'}>
          {selectedDomains.flatMap((d) => Array.from(topicsByDomain.get(d) ?? [])).map((t) => (
            <Chip key={t} on={selectedTopics.includes(t)} onClick={() => toggleIn(selectedTopics, t, setSelectedTopics)}>
              {t}
            </Chip>
          ))}
        </FilterStep>

        <div className="grid sm:grid-cols-2 gap-5">
          <FilterStep n={3} title="Source" hint="Where the questions come from">
            {availableSources.map((s) => (
              <Chip key={s} on={selectedSources.includes(s)} onClick={() => toggleIn(selectedSources, s, setSelectedSources)}>
                {s}
              </Chip>
            ))}
          </FilterStep>
          <FilterStep n={4} title="Difficulty">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Chip key={d} on={selectedDifficulties.includes(d)} onClick={() => toggleIn(selectedDifficulties, d, setSelectedDifficulties)}>
                <span className="capitalize">{d}</span>
              </Chip>
            ))}
          </FilterStep>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-(--border)">
          <div className="text-[13px] text-(--foreground)">
            <span className="font-bold font-mono tabular-nums">{filteredQuestions.length}</span> question{filteredQuestions.length === 1 ? '' : 's'} in this set
            {activeFiltersCount > 0 && (
              <button onClick={resetAllFilters} className="ml-3 text-[12px] font-medium text-(--brand-text) hover:underline cursor-pointer">
                Reset
              </button>
            )}
          </div>
          <button
            onClick={() => handleStartSession()}
            disabled={filteredQuestions.length === 0}
            className="px-6 py-2.5 bg-(--brand-cta) hover:bg-(--brand-hover) disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[13px] rounded-xl flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Start practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
    </div>
  );
};
