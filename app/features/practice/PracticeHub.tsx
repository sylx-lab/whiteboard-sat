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
import { MathRenderer } from '../../components/MathRenderer';
import { QuestionCard } from '../../components/QuestionCard';
import { QuestionNavigator } from '../../components/QuestionNavigator';
import { DesmosModal } from '../../components/DesmosModal';
import { FormulaReferenceModal } from '../../components/FormulaReferenceModal';

interface PracticeHubProps {
  questions: Question[];
  currentUser: UserProfile | null;
  hasAccessToQuestion: (q: Question) => boolean;
  onLogAttempt: (question: Question, answer: 'A' | 'B' | 'C' | 'D', timeSpent: number) => void;
  onToggleBookmark?: (questionId: string) => void;
  onOpenPricing: () => void;
}

type SortOption = 'recommended' | 'difficulty' | 'newest';

export const PracticeHub: React.FC<PracticeHubProps> = ({
  questions,
  currentUser,
  hasAccessToQuestion,
  onLogAttempt,
  onToggleBookmark,
  onOpenPricing,
}) => {
  // High-Level Subject Switcher
  const [selectedSubject, setSelectedSubject] = useState<Subject>('math');

  // Compact Toolbar Filters
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedAccess, setSelectedAccess] = useState<'all' | 'free' | 'premium'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Filter Dropdown Open States
  const [domainDropdownOpen, setDomainDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const [accessDropdownOpen, setAccessDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  // Advanced Drawer Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  // Active Practice Session State
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionQuestionIds, setSessionQuestionIds] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionInteractions, setSessionInteractions] = useState<Record<string, QuestionInteractionState>>({});
  const [sessionTimer, setSessionTimer] = useState(0);
  const [questionStartMs, setQuestionStartMs] = useState<number>(Date.now());
  const [isCrossOutMode, setIsCrossOutMode] = useState(false);
  const [isMobileMatrixOpen, setIsMobileMatrixOpen] = useState(false);

  // Reference Modals
  const [isDesmosOpen, setIsDesmosOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeAllDropdowns = () => {
    setDomainDropdownOpen(false);
    setDifficultyDropdownOpen(false);
    setAccessDropdownOpen(false);
    setSortDropdownOpen(false);
  };

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

  // Extract unique topics & sources for advanced drawer
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    questions.filter((q) => q.subject === selectedSubject).forEach((q) => set.add(q.topic));
    return Array.from(set);
  }, [questions, selectedSubject]);

  const availableSources = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => {
      if (q.source) set.add(q.source);
    });
    return Array.from(set);
  }, [questions]);

  // Filtered & Sorted Question List
  const filteredQuestions = useMemo(() => {
    let result = questions.filter((q) => {
      // Subject filter
      if (q.subject !== selectedSubject) return false;

      // Domain filter
      if (selectedDomain !== 'all' && q.domain !== selectedDomain) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;

      // Access filter
      if (selectedAccess === 'free' && !q.is_free) return false;
      if (selectedAccess === 'premium' && q.is_free) return false;

      // Advanced filters
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (selectedSource !== 'all' && q.source !== selectedSource) return false;

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

    // Sorting
    if (sortBy === 'difficulty') {
      const rank: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 };
      result = [...result].sort((a, b) => rank[a.difficulty] - rank[b.difficulty]);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => b.code.localeCompare(a.code));
    }

    return result;
  }, [
    questions,
    selectedSubject,
    selectedDomain,
    selectedDifficulty,
    selectedAccess,
    selectedTopic,
    selectedSource,
    searchQuery,
    sortBy,
  ]);

  // Stats
  const subjectTotal = questions.filter((q) => q.subject === selectedSubject).length;
  const subjectFree = questions.filter((q) => q.subject === selectedSubject && q.is_free).length;
  const subjectDomains = selectedSubject === 'math' ? 4 : 4;

  // Active filter counter
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDomain !== 'all') count++;
    if (selectedDifficulty !== 'all') count++;
    if (selectedAccess !== 'all') count++;
    if (selectedTopic !== 'all') count++;
    if (selectedSource !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedDomain, selectedDifficulty, selectedAccess, selectedTopic, selectedSource, searchQuery]);

  const resetAllFilters = () => {
    setSelectedDomain('all');
    setSelectedDifficulty('all');
    setSelectedAccess('all');
    setSelectedTopic('all');
    setSelectedSource('all');
    setSearchQuery('');
    setSortBy('recommended');
  };

  // Reset pagination when filters change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [selectedDomain, selectedDifficulty, selectedAccess, selectedTopic, selectedSource, searchQuery, sortBy, selectedSubject]);

  // Launch Practice Session
  const handleStartSession = (startQuestions = filteredQuestions, initialIdx = 0) => {
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
        isSubmitted: false,
        isMarkedForReview: false,
        isBookmarked: bookmarked.has(id),
        crossedOutChoices: [],
        timeSpentSeconds: 0,
      };
    });

    setSessionInteractions(initialInteractions);
    setSessionTimer(0);
    setIsSessionActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Timer increment while in active session — per-question start tracking
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!isSessionActive) return;
    setQuestionStartMs(Date.now());
    const interval = setInterval(() => {
      setSessionTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Reset per-question timer when index changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (isSessionActive) setQuestionStartMs(Date.now());
  }, [currentIndex, isSessionActive]);

  const currentSessionQuestion = questions.find((q) => q.id === sessionQuestionIds[currentIndex]);
  const currentInteraction = currentSessionQuestion
    ? sessionInteractions[currentSessionQuestion.id]
    : undefined;

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
    if (!currentSessionQuestion || !currentInteraction?.selectedAnswer) return;
    // eslint-disable-next-line react-hooks/purity
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartMs) / 1000));
    // Persist per-question time
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        isSubmitted: true,
        timeSpentSeconds: (prev[currentSessionQuestion.id]?.timeSpentSeconds || 0) + elapsed,
      },
    }));
    onLogAttempt(currentSessionQuestion, currentInteraction.selectedAnswer, elapsed);
  };

  const handleRetryProblem = () => {
    if (!currentSessionQuestion) return;
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        selectedAnswer: null,
        isSubmitted: false,
        crossedOutChoices: [],
      },
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < sessionQuestionIds.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  };  // --- ACTIVE SESSION RUNNER VIEW ---
  if (isSessionActive && currentSessionQuestion && currentInteraction) {
    const isLocked = !hasAccessToQuestion(currentSessionQuestion);

    return (
      <div className="max-w-[1240px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6 animate-in fade-in duration-200">
        {/* Session Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsSessionActive(false)}
              className="flex items-center gap-1 text-[12px] font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] px-2.5 sm:px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--brand-soft)] transition-colors cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Exit Practice</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="text-[12.5px] sm:text-[13px] font-bold text-[var(--foreground)] truncate max-w-[140px] sm:max-w-none">
                {selectedSubject === 'math' ? 'Mathematics Drill' : 'Reading & Writing Drill'}
              </div>
              <span className="text-[var(--foreground-muted)] hidden sm:inline">•</span>
              <span className="text-[11.5px] sm:text-[12px] text-[var(--foreground-secondary)] font-mono">
                Item {currentIndex + 1} of {sessionQuestionIds.length}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[var(--brand-soft)] border border-[var(--border)] rounded-lg text-[12px] font-mono text-[var(--foreground)]">
              <Clock className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span>
                {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {selectedSubject === 'math' && (
              <button
                onClick={() => setIsDesmosOpen(true)}
                className="px-2.5 sm:px-3 py-1 bg-[var(--surface)] hover:bg-[var(--brand-soft)] text-[11.5px] sm:text-[12px] font-medium text-[var(--foreground)] border border-[var(--border)] rounded-lg transition-colors cursor-pointer active:scale-95"
              >
                Desmos
              </button>
            )}

            <button
              onClick={() => setIsFormulasOpen(true)}
              className="px-2.5 sm:px-3 py-1 bg-[var(--surface)] hover:bg-[var(--brand-soft)] text-[11.5px] sm:text-[12px] font-medium text-[var(--foreground)] border border-[var(--border)] rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              Formulas
            </button>

            {/* Mobile Navigator Matrix Toggle Button */}
            <button
              onClick={() => setIsMobileMatrixOpen(true)}
              className="lg:hidden px-2.5 sm:px-3 py-1 bg-[var(--brand-cta)] text-white text-[11.5px] sm:text-[12px] font-medium rounded-lg shadow-xs cursor-pointer active:scale-95"
            >
              Matrix ({currentIndex + 1}/{sessionQuestionIds.length})
            </button>
          </div>
        </div>

        {/* Runner Question Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            <QuestionCard
              question={currentSessionQuestion}
              interactionState={currentInteraction}
              onSelectAnswer={handleSelectAnswer}
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
              isCrossOutModeActive={isCrossOutMode}
              onToggleCrossOutMode={() => setIsCrossOutMode(!isCrossOutMode)}
              showExplanationImmediately={true}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-3.5 sm:p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  setCurrentIndex((idx) => Math.max(0, idx - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[12px] font-medium transition-colors ${
                  currentIndex === 0
                    ? 'text-[var(--foreground-muted)] cursor-not-allowed'
                    : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--brand-soft)] border border-[var(--border)] cursor-pointer active:scale-95'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-[12px] text-[var(--foreground-secondary)] font-mono">
                {currentIndex + 1} / {sessionQuestionIds.length}
              </span>

              <button
                disabled={currentIndex === sessionQuestionIds.length - 1}
                onClick={() => {
                  setCurrentIndex((idx) => Math.min(sessionQuestionIds.length - 1, idx + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  currentIndex === sessionQuestionIds.length - 1
                    ? 'text-[var(--foreground-muted)] cursor-not-allowed'
                    : 'bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white shadow-xs cursor-pointer active:scale-95'
                }`}
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Right Matrix Navigator */}
          <div className="hidden lg:block lg:col-span-4 space-y-4">
            <QuestionNavigator
              totalQuestions={sessionQuestionIds.length}
              currentIndex={currentIndex}
              interactions={sessionInteractions}
              questionIds={sessionQuestionIds}
              questions={questions}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
              title="Practice Matrix"
            />
          </div>
        </div>

        {/* Mobile Matrix Drawer Bottom Sheet */}
        {isMobileMatrixOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end animate-in fade-in duration-150">
            <div className="w-full bg-[var(--surface)] rounded-t-2xl max-h-[80vh] flex flex-col p-5 space-y-4 border-t border-[var(--border)] shadow-2xl overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-safe">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--brand-cta)]" />
                  <span className="font-bold text-[13px] text-[var(--foreground)] uppercase tracking-wider">Practice Matrix</span>
                </div>
                <button
                  onClick={() => setIsMobileMatrixOpen(false)}
                  className="p-1 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] rounded-lg cursor-pointer"
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
      </div>
    );
  }

  // --- PRACTICE HUB / QUESTION BROWSER VIEW ---
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Backdrop overlay for open dropdowns on touch */}
      {(domainDropdownOpen || difficultyDropdownOpen || accessDropdownOpen || sortDropdownOpen) && (
        <div className="fixed inset-0 z-40 bg-transparent" onClick={closeAllDropdowns} />
      )}

      {/* ============================================================ */}
      {/* 1. PRACTICE HEADER & INTRO */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-5 sm:pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="text-[11px] font-bold tracking-wider text-[var(--brand-text)] uppercase font-mono">
            PRACTICE LIBRARY
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Precision Question Bank
          </h1>
          <p className="text-[13.5px] sm:text-[14px] text-[var(--foreground-secondary)] max-w-xl leading-relaxed">
            Practice the skills that matter most, with calibrated difficulty and step-by-step solutions.
          </p>

          {/* Small subtle statistics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-[11.5px] sm:text-[12px] font-mono">
            <span className="font-bold text-[var(--foreground)]">{subjectTotal} Questions</span>
            <span className="text-[var(--foreground-muted)]">•</span>
            <span className="text-[var(--brand-text)] font-semibold">{subjectFree} Free</span>
            <span className="text-[var(--foreground-muted)]">•</span>
            <span className="text-[var(--foreground-secondary)]">{subjectDomains} Domains</span>
          </div>
        </div>

        <button
          onClick={() => handleStartSession()}
          disabled={filteredQuestions.length === 0}
          className="btn-action w-full sm:w-auto px-6 py-3 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[13px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 group active:scale-[0.98]"
        >
          <span>Start Practice · {filteredQuestions.length} Questions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. HIGH-LEVEL SUBJECT SWITCHER */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="grid grid-cols-2 sm:inline-flex p-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)]/60 shadow-2xs w-full sm:w-auto">
          <button
            onClick={() => {
              setSelectedSubject('math');
              setSelectedDomain('all');
              setSelectedTopic('all');
            }}
            className={`py-2.5 px-4 sm:px-5 rounded-lg text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer text-center ${
              selectedSubject === 'math'
                ? 'bg-[var(--surface)] shadow-xs font-semibold text-[var(--foreground)]'
                : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            MATHEMATICS
          </button>
          <button
            onClick={() => {
              setSelectedSubject('reading_writing');
              setSelectedDomain('all');
              setSelectedTopic('all');
            }}
            className={`py-2.5 px-4 sm:px-5 rounded-lg text-[12.5px] sm:text-[13px] font-bold transition-all cursor-pointer text-center ${
              selectedSubject === 'reading_writing'
                ? 'bg-[var(--surface)] shadow-xs font-semibold text-[var(--foreground)]'
                : 'text-[var(--foreground-secondary)] hover:text-[var(--foreground)]'
            }`}
          >
            READING & WRITING
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--brand-text)] hover:text-[var(--brand-text)] hover:underline cursor-pointer self-start sm:self-auto"
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
        {/* Left Filter Dropdowns */}
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2">
          {/* Domain Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDomainDropdownOpen(!domainDropdownOpen);
                setDifficultyDropdownOpen(false);
                setAccessDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedDomain !== 'all'
                  ? 'bg-teal-50 border-[var(--brand)] text-[var(--brand-text)] font-semibold'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--brand-soft)] text-[var(--foreground)]'
              }`}
            >
              <span className="truncate max-w-[130px]">
                {selectedDomain === 'all' ? 'Domain' : formatDomainName(selectedDomain)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-secondary)] shrink-0" />
            </button>

            {domainDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-72 max-w-[calc(100vw-2rem)] bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-2 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => {
                    setSelectedDomain('all');
                    setDomainDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    selectedDomain === 'all'
                      ? 'bg-teal-50 text-[var(--brand-text)] font-semibold'
                      : 'text-[var(--foreground)] hover:bg-[var(--brand-soft)]'
                  }`}
                >
                  <span>All Domains</span>
                  {selectedDomain === 'all' && <Check className="w-3.5 h-3.5 text-[var(--brand-text)]" />}
                </button>

                <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                  {selectedSubject === 'math' ? 'Mathematics Domains' : 'Reading & Writing Domains'}
                </div>

                {(selectedSubject === 'math' ? mathDomains : rwDomains).map((dom) => (
                  <button
                    key={dom}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setDomainDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      selectedDomain === dom
                        ? 'bg-teal-50 text-[var(--brand-text)] font-semibold'
                        : 'text-[var(--foreground)] hover:bg-[var(--brand-soft)]'
                    }`}
                  >
                    <span className="truncate mr-2">{formatDomainName(dom)}</span>
                    {selectedDomain === dom && <Check className="w-3.5 h-3.5 text-[var(--brand-text)] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDifficultyDropdownOpen(!difficultyDropdownOpen);
                setDomainDropdownOpen(false);
                setAccessDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedDifficulty !== 'all'
                  ? 'bg-teal-50 border-[var(--brand)] text-[var(--brand-text)] font-semibold'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--brand-soft)] text-[var(--foreground)]'
              }`}
            >
              <span className="capitalize">
                {selectedDifficulty === 'all' ? 'Difficulty' : selectedDifficulty}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-secondary)] shrink-0" />
            </button>

            {difficultyDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
              >
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setDifficultyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between capitalize ${
                      selectedDifficulty === diff
                        ? 'bg-teal-50 text-[var(--brand-text)] font-semibold'
                        : 'text-[var(--foreground)] hover:bg-[var(--brand-soft)]'
                    }`}
                  >
                    <span>{diff === 'all' ? 'All Difficulties' : diff}</span>
                    {selectedDifficulty === diff && <Check className="w-3.5 h-3.5 text-[var(--brand-text)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Access Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setAccessDropdownOpen(!accessDropdownOpen);
                setDomainDropdownOpen(false);
                setDifficultyDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer active:scale-95 ${
                selectedAccess !== 'all'
                  ? 'bg-teal-50 border-[var(--brand)] text-[var(--brand-text)] font-semibold'
                  : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--brand-soft)] text-[var(--foreground)]'
              }`}
            >
              <span>
                {selectedAccess === 'all' ? 'Access' : selectedAccess === 'free' ? 'Free Only' : 'Premium Only'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-secondary)] shrink-0" />
            </button>

            {accessDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
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
                        ? 'bg-teal-50 text-[var(--brand-text)] font-semibold'
                        : 'text-[var(--foreground)] hover:bg-[var(--brand-soft)]'
                    }`}
                  >
                    <span>{acc === 'all' ? 'All Access' : acc === 'free' ? 'Free Only' : 'Premium Only'}</span>
                    {selectedAccess === acc && <Check className="w-3.5 h-3.5 text-[var(--brand-text)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Filters Drawer Button */}
          <button
            onClick={() => setMoreFiltersOpen(true)}
            className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
              selectedTopic !== 'all' || selectedSource !== 'all'
                ? 'bg-teal-50 border-[var(--brand)] text-[var(--brand-text)] font-semibold'
                : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--brand-soft)] text-[var(--foreground)]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--foreground-secondary)]" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Right Search Input with ⌘K */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-[var(--foreground-secondary)] absolute left-3 top-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, topics or ID..."
            className="w-full h-10 pl-9 pr-14 border border-[var(--border)] rounded-[10px] text-[12px] focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)] transition-colors shadow-none text-[var(--foreground)]"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="hidden sm:block absolute right-2.5 top-2.5 pointer-events-none px-1.5 py-0.5 rounded bg-[var(--surface-soft)] text-[10px] font-mono text-[var(--foreground-secondary)] border border-[var(--border)]">
              ⌘K
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RESULTS HEADER */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between text-[13px] text-[var(--foreground-secondary)] pt-1 sm:pt-2">
        <div className="font-medium text-[var(--foreground)]">
          {filteredQuestions.length} question{filteredQuestions.length === 1 ? '' : 's'} found
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--foreground)] hover:text-[var(--brand-text)] transition-colors cursor-pointer active:scale-95"
          >
            <span className="text-[var(--foreground-secondary)]">Sort:</span>
            <span className="font-semibold capitalize">{sortBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--foreground-secondary)]" />
          </button>

          {sortDropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-40 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
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
                      ? 'bg-teal-50 text-[var(--brand-text)] font-semibold'
                      : 'text-[var(--foreground)] hover:bg-[var(--brand-soft)]'
                  }`}
                >
                  <span>{opt}</span>
                  {sortBy === opt && <Check className="w-3.5 h-3.5 text-[var(--brand-text)]" />}
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
        <div className="p-10 sm:p-16 bg-[var(--surface)] rounded-2xl border border-[var(--border)] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--brand-soft)] text-[var(--foreground-secondary)] flex items-center justify-center mx-auto border border-[var(--border)]">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[var(--foreground)] text-base">No questions found</h3>
            <p className="text-[13px] text-[var(--foreground-secondary)] max-w-sm mx-auto">
              No items match your active filters. Clear or adjust your parameters to browse available problems.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-[var(--navy-section)] hover:bg-[var(--brand-cta)] text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer active:scale-95"
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
                className="group p-4 sm:p-5 bg-[var(--surface)] rounded-[14px] border border-[var(--border)] hover:border-[var(--brand)]/50 hover:-translate-y-[1px] hover:shadow-xs transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5"
              >
                {/* Left: ID & Metadata */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="font-mono font-bold text-[var(--foreground)] bg-[var(--brand-soft)] px-2 py-0.5 rounded border border-[var(--border)]">
                      {q.code}
                    </span>
                    <span className="font-semibold text-[var(--foreground)]">{formatDomainName(q.domain)}</span>
                    <span className="text-[var(--foreground-muted)]">•</span>
                    <span className="text-[var(--foreground-secondary)]">{q.topic}</span>
                    <span className="text-[var(--foreground-muted)]">•</span>

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
                      <span className="text-[var(--brand-text)] font-semibold text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-100 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[var(--brand-text)]" />
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Question Preview Text */}
                  <div className="text-[13.5px] text-[var(--foreground)] font-normal leading-relaxed line-clamp-2 break-words">
                    <MathRenderer content={q.question_text} />
                  </div>
                </div>

                {/* Right: Action */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full md:w-auto">
                  {hasAccess ? (
                    <button
                      onClick={() => handleStartSession(filteredQuestions, idx)}
                      className="w-full md:w-auto px-5 py-2.5 bg-[var(--navy-section)] hover:bg-[var(--brand-cta)] text-white font-medium text-[12px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group/btn active:scale-95"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      onClick={onOpenPricing}
                      className="w-full md:w-auto px-4 py-2.5 bg-[var(--surface)] hover:bg-[var(--brand-soft)] text-[var(--brand-text)] font-semibold text-[12px] rounded-lg border border-[var(--border)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Lock className="w-3.5 h-3.5 text-[var(--brand-text)]" />
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
                      className="px-5 py-2 bg-[var(--surface)] hover:bg-[var(--brand-soft)] border border-[var(--border)] rounded-xl text-[12px] font-semibold text-[var(--foreground)] transition-colors"
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
          <div className="w-full max-w-md bg-[var(--surface)] h-full p-5 sm:p-6 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 pb-safe">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[var(--brand-text)]" />
                  <h3 className="font-bold text-[var(--foreground)] text-base">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setMoreFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Topic Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Specific Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg text-[12px] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="all">All Topics</option>
                  {availableTopics.map((top) => (
                    <option key={top} value={top}>
                      {top}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Question Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg text-[12px] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="all">All Sources</option>
                  {availableSources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Quick Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() =>
                        setSelectedDifficulty(selectedDifficulty === diff ? 'all' : diff)
                      }
                      className={`py-2 rounded-lg text-[12px] font-medium border capitalize transition-colors cursor-pointer active:scale-95 ${
                        selectedDifficulty === diff
                          ? 'bg-[var(--brand-cta)] text-white border-[var(--brand-cta)] font-bold'
                          : 'bg-[var(--brand-soft)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Quick Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider">
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
                        : 'bg-[var(--brand-soft)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-soft)]'
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
                        ? 'bg-[var(--brand-cta)] text-white border-[var(--brand-cta)] font-bold'
                        : 'bg-[var(--brand-soft)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-soft)]'
                    }`}
                  >
                    Premium Only
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[var(--border)] flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTopic('all');
                  setSelectedSource('all');
                  setSelectedDifficulty('all');
                  setSelectedAccess('all');
                }}
                className="flex-1 py-2.5 bg-[var(--surface-soft)] hover:bg-[var(--border)] text-[var(--foreground)] text-[13px] font-medium rounded-lg transition-colors cursor-pointer active:scale-95"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setMoreFiltersOpen(false)}
                className="flex-1 py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white text-[13px] font-semibold rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
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
