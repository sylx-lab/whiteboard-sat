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
  onOpenPricing: () => void;
}

type SortOption = 'recommended' | 'difficulty' | 'newest';

export const PracticeHub: React.FC<PracticeHubProps> = ({
  questions,
  currentUser,
  hasAccessToQuestion,
  onLogAttempt,
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
  const [isCrossOutMode, setIsCrossOutMode] = useState(false);

  // Reference Modals
  const [isDesmosOpen, setIsDesmosOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = q.code.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchSubtopic = q.subtopic.toLowerCase().includes(query);
        const matchText = q.question_text.toLowerCase().includes(query);
        if (!matchCode && !matchTopic && !matchSubtopic && !matchText) return false;
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

  // Launch Practice Session
  const handleStartSession = (startQuestions = filteredQuestions, initialIdx = 0) => {
    if (startQuestions.length === 0) return;
    const ids = startQuestions.map((q) => q.id);
    setSessionQuestionIds(ids);
    setCurrentIndex(initialIdx);

    const initialInteractions: Record<string, QuestionInteractionState> = {};
    ids.forEach((id) => {
      initialInteractions[id] = {
        questionId: id,
        selectedAnswer: null,
        isSubmitted: false,
        isMarkedForReview: false,
        isBookmarked: false,
        crossedOutChoices: [],
        timeSpentSeconds: 0,
      };
    });

    setSessionInteractions(initialInteractions);
    setSessionTimer(0);
    setIsSessionActive(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Timer increment while in active session
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      setSessionTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

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
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        isBookmarked: !prev[currentSessionQuestion.id]?.isBookmarked,
      },
    }));
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
    setSessionInteractions((prev) => ({
      ...prev,
      [currentSessionQuestion.id]: {
        ...prev[currentSessionQuestion.id],
        isSubmitted: true,
      },
    }));
    onLogAttempt(currentSessionQuestion, currentInteraction.selectedAnswer, sessionTimer);
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
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
        {/* Session Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSessionActive(false)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#58708A] hover:text-[#071126] px-3 py-1.5 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F8F7] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Exit Practice</span>
            </button>

            <div className="text-[13px] font-bold text-[#071126]">
              {selectedSubject === 'math' ? 'Mathematics Drill' : 'Reading & Writing Drill'}
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-[12px] text-[#58708A] font-mono">
              Item {currentIndex + 1} of {sessionQuestionIds.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F1F8F7] border border-[#E2E8F0] rounded-lg text-[12px] font-mono text-[#071126]">
              <Clock className="w-3.5 h-3.5 text-[#0D918A]" />
              <span>
                {Math.floor(sessionTimer / 60)}:{(sessionTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {selectedSubject === 'math' && (
              <button
                onClick={() => setIsDesmosOpen(true)}
                className="px-3 py-1 bg-white hover:bg-[#F1F8F7] text-[12px] font-medium text-[#071126] border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
              >
                Desmos Calculator
              </button>
            )}

            <button
              onClick={() => setIsFormulasOpen(true)}
              className="px-3 py-1 bg-white hover:bg-[#F1F8F7] text-[12px] font-medium text-[#071126] border border-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
            >
              Formulas
            </button>
          </div>
        </div>

        {/* Runner Question Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
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
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E2E8F0]">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors ${currentIndex === 0
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-[#58708A] hover:text-[#071126] hover:bg-[#F1F8F7] border border-[#E2E8F0] cursor-pointer'
                  }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-[12px] text-[#58708A] font-mono">
                {currentIndex + 1} / {sessionQuestionIds.length}
              </span>

              <button
                disabled={currentIndex === sessionQuestionIds.length - 1}
                onClick={() => setCurrentIndex((idx) => Math.min(sessionQuestionIds.length - 1, idx + 1))}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[12px] font-semibold transition-colors ${currentIndex === sessionQuestionIds.length - 1
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'bg-[#087C76] hover:bg-[#066F6A] text-white shadow-xs cursor-pointer'
                  }`}
              >
                <span>Next Question</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Matrix Navigator */}
          <div className="lg:col-span-4 space-y-4">
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

        <DesmosModal isOpen={isDesmosOpen} onClose={() => setIsDesmosOpen(false)} />
        <FormulaReferenceModal isOpen={isFormulasOpen} onClose={() => setIsFormulasOpen(false)} />
      </div>
    );
  }

  // --- PRACTICE HUB / QUESTION BROWSER VIEW ---
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. PRACTICE HEADER & INTRO */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
        <div className="space-y-2">
          <div className="text-[11px] font-bold tracking-wider text-[#0D918A] uppercase font-mono">
            PRACTICE LIBRARY
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126]">
            Precision Question Bank
          </h1>
          <p className="text-[14px] text-[#58708A] max-w-xl leading-relaxed">
            Practice the skills that matter most, with calibrated difficulty and step-by-step solutions.
          </p>

          {/* Small subtle statistics */}
          <div className="flex items-center gap-3 pt-1 text-[12px] font-mono">
            <span className="font-bold text-[#071126]">{subjectTotal} Questions</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#087C76] font-semibold">{subjectFree} Free</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#58708A]">{subjectDomains} Domains</span>
          </div>
        </div>

        <button
          onClick={() => handleStartSession()}
          disabled={filteredQuestions.length === 0}
          className="btn-action px-6 py-3 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[13px] rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer shrink-0 group"
        >
          <span>Start Practice · {filteredQuestions.length} Questions</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* 2. HIGH-LEVEL SUBJECT SWITCHER */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60 shadow-2xs">
          <button
            onClick={() => {
              setSelectedSubject('math');
              setSelectedDomain('all');
              setSelectedTopic('all');
            }}
            className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${selectedSubject === 'math'
                ? 'bg-white shadow-xs font-semibold text-[#071126]'
                : 'text-[#58708A] hover:text-[#071126]'
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
            className={`px-5 py-2 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${selectedSubject === 'reading_writing'
                ? 'bg-white shadow-xs font-semibold text-[#071126]'
                : 'text-[#58708A] hover:text-[#071126]'
              }`}
          >
            READING & WRITING
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#0D918A] hover:text-[#087C76] hover:underline cursor-pointer"
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
        <div className="lg:col-span-8 flex flex-wrap items-center gap-2.5">
          {/* Domain Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDomainDropdownOpen(!domainDropdownOpen);
                setDifficultyDropdownOpen(false);
                setAccessDropdownOpen(false);
              }}
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer ${selectedDomain !== 'all'
                  ? 'bg-teal-50 border-[#0D918A] text-[#087C76] font-semibold'
                  : 'bg-white border-[#E2E8F0] hover:bg-[#F1F8F7] text-[#071126]'
                }`}
            >
              <span>
                {selectedDomain === 'all' ? 'Domain' : formatDomainName(selectedDomain)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#58708A]" />
            </button>

            {domainDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-2 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDomainDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    setSelectedDomain('all');
                    setDomainDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${selectedDomain === 'all' ? 'bg-teal-50 text-[#087C76] font-semibold' : 'text-[#071126] hover:bg-[#F1F8F7]'
                    }`}
                >
                  <span>All Domains</span>
                  {selectedDomain === 'all' && <Check className="w-3.5 h-3.5 text-[#0D918A]" />}
                </button>

                <div className="pt-2 pb-1 px-3 text-[10px] font-bold text-[#58708A] uppercase tracking-wider">
                  {selectedSubject === 'math' ? 'Mathematics Domains' : 'Reading & Writing Domains'}
                </div>

                {(selectedSubject === 'math' ? mathDomains : rwDomains).map((dom) => (
                  <button
                    key={dom}
                    onClick={() => {
                      setSelectedDomain(dom);
                      setDomainDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${selectedDomain === dom ? 'bg-teal-50 text-[#087C76] font-semibold' : 'text-[#071126] hover:bg-[#F1F8F7]'
                      }`}
                  >
                    <span>{formatDomainName(dom)}</span>
                    {selectedDomain === dom && <Check className="w-3.5 h-3.5 text-[#0D918A]" />}
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
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer ${selectedDifficulty !== 'all'
                  ? 'bg-teal-50 border-[#0D918A] text-[#087C76] font-semibold'
                  : 'bg-white border-[#E2E8F0] hover:bg-[#F1F8F7] text-[#071126]'
                }`}
            >
              <span className="capitalize">
                {selectedDifficulty === 'all' ? 'Difficulty' : selectedDifficulty}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#58708A]" />
            </button>

            {difficultyDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setDifficultyDropdownOpen(false)}
              >
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setDifficultyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between capitalize ${selectedDifficulty === diff ? 'bg-teal-50 text-[#087C76] font-semibold' : 'text-[#071126] hover:bg-[#F1F8F7]'
                      }`}
                  >
                    <span>{diff === 'all' ? 'All Difficulties' : diff}</span>
                    {selectedDifficulty === diff && <Check className="w-3.5 h-3.5 text-[#0D918A]" />}
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
              className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer ${selectedAccess !== 'all'
                  ? 'bg-teal-50 border-[#0D918A] text-[#087C76] font-semibold'
                  : 'bg-white border-[#E2E8F0] hover:bg-[#F1F8F7] text-[#071126]'
                }`}
            >
              <span>
                {selectedAccess === 'all' ? 'Access' : selectedAccess === 'free' ? 'Free Only' : 'Premium Only'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#58708A]" />
            </button>

            {accessDropdownOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setAccessDropdownOpen(false)}
              >
                {(['all', 'free', 'premium'] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => {
                      setSelectedAccess(acc);
                      setAccessDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${selectedAccess === acc ? 'bg-teal-50 text-[#087C76] font-semibold' : 'text-[#071126] hover:bg-[#F1F8F7]'
                      }`}
                  >
                    <span>{acc === 'all' ? 'All Access' : acc === 'free' ? 'Free Only' : 'Premium Only'}</span>
                    {selectedAccess === acc && <Check className="w-3.5 h-3.5 text-[#0D918A]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Filters Drawer Button */}
          <button
            onClick={() => setMoreFiltersOpen(true)}
            className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${selectedTopic !== 'all' || selectedSource !== 'all'
                ? 'bg-teal-50 border-[#0D918A] text-[#087C76] font-semibold'
                : 'bg-white border-[#E2E8F0] hover:bg-[#F1F8F7] text-[#071126]'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#58708A]" />
            <span>More Filters</span>
          </button>
        </div>

        {/* Right Search Input with ⌘K */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-[#58708A] absolute left-3 top-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions, topics or question ID..."
            className="w-full h-10 pl-9 pr-14 border border-[#E2E8F0] rounded-[10px] text-[12px] focus:outline-none focus:border-[#0D918A] bg-white transition-colors shadow-none text-[#071126]"
          />
          <div className="absolute right-2.5 top-2.5 pointer-events-none px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-[#58708A] border border-slate-200">
            ⌘K
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RESULTS HEADER */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between text-[13px] text-[#58708A] pt-2">
        <div className="font-medium text-[#071126]">
          {filteredQuestions.length} questions found
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#071126] hover:text-[#0D918A] transition-colors cursor-pointer"
          >
            <span className="text-[#58708A]">Sort:</span>
            <span className="font-semibold capitalize">{sortBy}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#58708A]" />
          </button>

          {sortDropdownOpen && (
            <div
              className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-[#E2E8F0] p-1.5 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setSortDropdownOpen(false)}
            >
              {(['recommended', 'difficulty', 'newest'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setSortBy(opt);
                    setSortDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between capitalize ${sortBy === opt ? 'bg-teal-50 text-[#087C76] font-semibold' : 'text-[#071126] hover:bg-[#F1F8F7]'
                    }`}
                >
                  <span>{opt}</span>
                  {sortBy === opt && <Check className="w-3.5 h-3.5 text-[#0D918A]" />}
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
        <div className="p-16 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#F1F8F7] text-[#58708A] flex items-center justify-center mx-auto border border-[#E2E8F0]">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-[#071126] text-base">No questions found</h3>
            <p className="text-[13px] text-[#58708A] max-w-sm mx-auto">
              No items match your active filters. Clear or adjust your parameters to browse available problems.
            </p>
          </div>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-[#080D21] hover:bg-[#087C76] text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const hasAccess = hasAccessToQuestion(q);

            return (
              <div
                key={q.id}
                className="group p-5 bg-white rounded-[14px] border border-[#E2E8F0] hover:border-[#0D918A]/50 hover:-translate-y-[1px] hover:shadow-xs transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: ID & Metadata */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
                    <span className="font-mono font-bold text-[#071126] bg-[#F1F8F7] px-2 py-0.5 rounded border border-[#E2E8F0]">
                      {q.code}
                    </span>
                    <span className="font-semibold text-[#071126]">{formatDomainName(q.domain)}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#58708A]">{q.topic}</span>
                    <span className="text-slate-300">•</span>

                    {/* Semantic Difficulty */}
                    <span
                      className={`font-semibold capitalize ${q.difficulty === 'easy'
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
                      <span className="text-[#087C76] font-semibold text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-100 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-[#0D918A]" />
                        Premium
                      </span>
                    )}
                  </div>

                  {/* Question Preview Text */}
                  <div className="text-[13.5px] text-[#071126] font-normal leading-relaxed line-clamp-2">
                    <MathRenderer content={q.question_text} />
                  </div>
                </div>

                {/* Right: Action */}
                <div className="flex items-center gap-3 shrink-0">
                  {hasAccess ? (
                    <button
                      onClick={() => handleStartSession(filteredQuestions, idx)}
                      className="px-5 py-2.5 bg-[#080D21] hover:bg-[#087C76] text-white font-medium text-[12px] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer group/btn"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                    </button>
                  ) : (
                    <button
                      onClick={onOpenPricing}
                      className="px-4 py-2.5 bg-white hover:bg-[#F1F8F7] text-[#087C76] font-semibold text-[12px] rounded-lg border border-[#E2E8F0] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#0D918A]" />
                      <span>Unlock Premium</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. ADVANCED FILTER SIDE DRAWER */}
      {/* ============================================================ */}
      {moreFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/25 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#0D918A]" />
                  <h3 className="font-bold text-[#071126] text-base">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setMoreFiltersOpen(false)}
                  className="p-1.5 rounded-lg text-[#58708A] hover:text-[#071126] hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Topic Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#58708A] uppercase tracking-wider">
                  Specific Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-[12px] bg-white text-[#071126] focus:outline-none focus:border-[#0D918A]"
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
                <label className="text-[11px] font-bold text-[#58708A] uppercase tracking-wider">
                  Question Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-lg text-[12px] bg-white text-[#071126] focus:outline-none focus:border-[#0D918A]"
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
                <label className="text-[11px] font-bold text-[#58708A] uppercase tracking-wider">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() =>
                        setSelectedDifficulty(selectedDifficulty === diff ? 'all' : diff)
                      }
                      className={`py-2 rounded-lg text-[12px] font-medium border capitalize transition-colors cursor-pointer ${selectedDifficulty === diff
                          ? 'bg-[#087C76] text-white border-[#087C76] font-bold'
                          : 'bg-[#F1F8F7] text-[#071126] border-[#E2E8F0] hover:bg-slate-100'
                        }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Access Quick Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#58708A] uppercase tracking-wider">
                  Access Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      setSelectedAccess(selectedAccess === 'free' ? 'all' : 'free')
                    }
                    className={`py-2 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer ${selectedAccess === 'free'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-[#F1F8F7] text-[#071126] border-[#E2E8F0] hover:bg-slate-100'
                      }`}
                  >
                    Free Only
                  </button>
                  <button
                    onClick={() =>
                      setSelectedAccess(selectedAccess === 'premium' ? 'all' : 'premium')
                    }
                    className={`py-2 rounded-lg text-[12px] font-medium border transition-colors cursor-pointer ${selectedAccess === 'premium'
                        ? 'bg-[#087C76] text-white border-[#087C76] font-bold'
                        : 'bg-[#F1F8F7] text-[#071126] border-[#E2E8F0] hover:bg-slate-100'
                      }`}
                  >
                    Premium Only
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedTopic('all');
                  setSelectedSource('all');
                  setSelectedDifficulty('all');
                  setSelectedAccess('all');
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#071126] text-[13px] font-medium rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setMoreFiltersOpen(false)}
                className="flex-1 py-2.5 bg-[#087C76] hover:bg-[#066F6A] text-white text-[13px] font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
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
