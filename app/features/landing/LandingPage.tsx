import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Video,
  ExternalLink,
  Calculator,
  BookOpen,
  Sparkles,
  Star,
  TrendingUp,
  BarChart3,
  Award,
  GraduationCap,
  Check,
  Zap,
  Layers,
  Compass,
  FileText,
  ChevronRight,
  Play,
  Target,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { NavView } from '../../components/Navbar';
import { MathRenderer } from '../../components/MathRenderer';

interface LandingPageProps {
  onNavigate: (view: NavView) => void;
  onOpenPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenPricing }) => {
  // Hero Interactive Terminal Tabs
  const [heroTab, setHeroTab] = useState<'runner' | 'video' | 'analytics'>('runner');
  const [heroChoice, setHeroChoice] = useState<'A' | 'B' | 'C' | 'D' | null>('B');
  const [heroCrossOutActive, setHeroCrossOutActive] = useState<boolean>(false);
  const [heroCrossedChoices, setHeroCrossedChoices] = useState<Set<string>>(new Set());
  const [heroShowDesmosPreview, setHeroShowDesmosPreview] = useState<boolean>(false);

  // Practice Section Question State
  const [selectedPracticeChoice, setSelectedPracticeChoice] = useState<'A' | 'B' | 'C' | 'D' | null>('B');
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(true);

  // Toggle cross-out in hero
  const toggleHeroCrossOut = (choiceId: string) => {
    setHeroCrossedChoices((prev) => {
      const next = new Set(prev);
      if (next.has(choiceId)) {
        next.delete(choiceId);
      } else {
        next.add(choiceId);
      }
      return next;
    });
  };

  return (
    <div className="bg-(--surface) text-(--foreground) animate-in fade-in duration-200 selection:bg-(--brand-soft) selection:text-(--brand-text)">
      {/* ============================================================ */}
      {/* 01 HERO SECTION: High-Impact Digital SAT Command Center */}
      {/* ============================================================ */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 pb-20 sm:pb-32 bg-gradient-to-b from-(--brand-soft) via-(--brand-soft)/70 to-(--surface) border-b border-(--border) overflow-hidden">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-indigo-500/10 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* LEFT COLUMN: Editorial Value Proposition & Actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Badge: Live Digital SAT Suite Indicator */}
              <div className="inline-flex items-center gap-2.5 bg-(--surface) px-3.5 py-1.5 rounded-full border border-(--border) shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span className="text-[11px] font-mono font-bold tracking-wider text-(--brand-text) uppercase">
                  2026 DIGITAL SAT READY • OFFICIAL BLUEBOOK ENGINE
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.035em] text-(--foreground) leading-[1.08]">
                Master the Digital SAT. <br />
                <span className="bg-gradient-to-r from-(--brand-text) via-(--brand-cta) to-teal-600 bg-clip-text text-transparent">
                  Engineer Your 1550+.
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-(--foreground-secondary) text-base sm:text-lg leading-[1.65] max-w-xl font-normal">
                Authentic adaptive module simulations, integrated Desmos graphing shortcuts, and step-by-step mathematical reasoning engineered to unlock 99th-percentile scores.
              </p>

              {/* Multi-tier CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('practice')}
                  className="bg-(--brand-cta) text-white hover:bg-(--brand-hover) px-7 py-4 rounded-xl font-bold text-[15px] transition-all duration-150 flex items-center gap-2.5 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] group"
                >
                  <span>Start Practicing Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-white" />
                </button>

                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="bg-(--surface) border border-(--border-strong) text-(--foreground) hover:bg-(--surface-soft) hover:border-(--brand) px-6 py-4 rounded-xl font-semibold text-[15px] transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Clock className="w-4 h-4 text-(--brand-text)" />
                  <span>Take Timed Mock Test</span>
                </button>
              </div>

              {/* Social Proof Metric Strip */}
              <div className="pt-6 border-t border-(--border)/80 grid grid-cols-3 gap-4 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-(--foreground) tracking-tight">1,480+</div>
                  <div className="text-[11.5px] text-(--foreground-secondary) font-medium mt-0.5">Hand-Crafted Questions</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-(--brand-text) tracking-tight">+160 pts</div>
                  <div className="text-[11.5px] text-(--foreground-secondary) font-medium mt-0.5">Avg. Score Improvement</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 tracking-tight">99.4%</div>
                  <div className="text-[11.5px] text-(--foreground-secondary) font-medium mt-0.5">College Board Alignment</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Digital SAT Command Center Terminal */}
            <div className="lg:col-span-6 relative">
              {/* Outer Decorative Glow Container */}
              <div className="relative rounded-2xl bg-(--surface) border border-(--border-strong) shadow-2xl overflow-hidden transition-all">
                
                {/* Terminal Control Bar */}
                <div className="px-4 sm:px-5 py-3 bg-(--navy-section) text-white flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11.5px] font-mono font-semibold tracking-wider text-white/80 ml-1">
                      WHITE BOARD SAT TERMINAL
                    </span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/10 text-[11px] font-medium">
                    <button
                      onClick={() => setHeroTab('runner')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                        heroTab === 'runner'
                          ? 'bg-(--brand-cta) text-white font-bold shadow-xs'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      Exam Runner
                    </button>
                    <button
                      onClick={() => setHeroTab('video')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        heroTab === 'video'
                          ? 'bg-(--brand-cta) text-white font-bold shadow-xs'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Video</span>
                    </button>
                    <button
                      onClick={() => setHeroTab('analytics')}
                      className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        heroTab === 'analytics'
                          ? 'bg-(--brand-cta) text-white font-bold shadow-xs'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Activity className="w-3 h-3" />
                      <span>Analytics</span>
                    </button>
                  </div>
                </div>

                {/* TAB 1: Live Exam Runner Simulation */}
                {heroTab === 'runner' && (
                  <div className="p-5 sm:p-6 space-y-5 bg-(--surface) animate-in fade-in duration-200">
                    {/* Simulator Header Strip */}
                    <div className="flex items-center justify-between pb-3 border-b border-(--border) text-[12px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono font-bold text-(--foreground) bg-(--surface-soft) px-2 py-0.5 rounded border border-(--border) text-[11px]">
                          M-ADV-204
                        </span>
                        <span className="font-bold text-(--foreground) truncate text-[11.5px] sm:text-xs">
                          Math • Module 2 (Hard)
                        </span>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          HARD
                        </span>
                      </div>

                      {/* Header Tools */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setHeroShowDesmosPreview(!heroShowDesmosPreview)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            heroShowDesmosPreview
                              ? 'bg-(--brand-cta) text-white border-(--brand-cta)'
                              : 'bg-(--surface-soft) hover:bg-(--brand-soft) text-(--foreground) border-(--border)'
                          }`}
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Desmos</span>
                        </button>

                        <button
                          onClick={() => setHeroCrossOutActive(!heroCrossOutActive)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-bold font-mono transition-colors cursor-pointer ${
                            heroCrossOutActive
                              ? 'bg-(--brand-cta) text-white border-(--brand-cta)'
                              : 'bg-(--surface-soft) text-(--foreground-secondary) border-(--border)'
                          }`}
                          title="Toggle ABC answer elimination"
                        >
                          <span className="relative inline-block">
                            ABC
                            <span className="absolute -inset-x-0.5 top-1/2 h-[1.5px] bg-current -translate-y-1/2 pointer-events-none" />
                          </span>
                        </button>

                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-(--navy-section) text-white font-mono text-[11.5px] font-semibold">
                          <Clock className="w-3 h-3 text-(--brand-text)" />
                          <span>31:45</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Desmos Drawer Overlay if Active */}
                    {heroShowDesmosPreview && (
                      <div className="p-3 bg-(--navy-section) text-white rounded-xl border border-white/15 space-y-2 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex items-center justify-between text-[11px] text-white/70 font-mono">
                          <span className="flex items-center gap-1 text-teal-400 font-bold">
                            <Calculator className="w-3.5 h-3.5" /> Desmos Graphing Engine
                          </span>
                          <span>y = 2x² - 5x + 3</span>
                        </div>
                        <div className="text-[11.5px] font-mono bg-black/40 p-2.5 rounded-lg border border-white/10 text-teal-300">
                          1: y = 2x² - 5x + 3 <br />
                          2: y = 3x - 5 (Tangent intersection at x = 2, y = 1)
                        </div>
                      </div>
                    )}

                    {/* Question Stem with KaTeX */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono text-(--foreground-muted) font-semibold uppercase tracking-wider">
                        Question 14 of 22
                      </div>
                      <div className="text-[14.5px] sm:text-[15px] text-(--foreground) font-medium leading-relaxed">
                        If the system of equations below has exactly one real solution, what is the value of <MathRenderer content="$k$" />?
                      </div>
                      <div className="p-3 bg-(--brand-soft) rounded-xl border border-(--border) text-center text-sm font-semibold">
                        <MathRenderer content="$\begin{cases} y = 2x^2 - 5x + 3 \\ y = 3x - k \end{cases}$" />
                      </div>
                    </div>

                    {/* Choices Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: 'A', text: '3' },
                        { id: 'B', text: '5' },
                        { id: 'C', text: '-5' },
                        { id: 'D', text: '-3' },
                      ].map((choice) => {
                        const isSelected = heroChoice === choice.id;
                        const isCrossed = heroCrossedChoices.has(choice.id);
                        return (
                          <div
                            key={choice.id}
                            onClick={() => {
                              if (!heroCrossOutActive) {
                                setHeroChoice(choice.id as 'A' | 'B' | 'C' | 'D');
                              }
                            }}
                            className={`p-3 rounded-xl border text-[13.5px] flex items-center justify-between cursor-pointer transition-all ${
                              isCrossed
                                ? 'opacity-40 line-through bg-(--surface-soft) border-(--border)'
                                : isSelected
                                ? choice.id === 'B'
                                  ? 'bg-teal-50/80 border-(--brand) text-(--foreground) font-semibold shadow-xs'
                                  : 'bg-rose-50 border-rose-400 text-rose-950 font-semibold'
                                : 'bg-(--surface) border-(--border) hover:bg-(--surface-soft) text-(--foreground)'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                                  isSelected
                                    ? choice.id === 'B'
                                      ? 'bg-(--brand-cta) text-white'
                                      : 'bg-rose-600 text-white'
                                    : 'bg-(--surface-soft) text-(--foreground-secondary)'
                                }`}
                              >
                                {choice.id}
                              </span>
                              <span className="font-mono text-sm">{choice.text}</span>
                            </div>

                            {/* Elimination action icon */}
                            {heroCrossOutActive && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleHeroCrossOut(choice.id);
                                }}
                                className="w-6 h-6 rounded-full border border-(--border-strong) flex items-center justify-center font-mono text-[10px] text-(--foreground-muted) hover:text-(--foreground)"
                              >
                                ✕
                              </button>
                            )}

                            {!heroCrossOutActive && isSelected && choice.id === 'B' && (
                              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Instant Walkthrough Solution Box */}
                    {heroChoice && (
                      <div className="p-3.5 bg-(--brand-soft) rounded-xl border border-teal-200/80 text-[12.5px] space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-bold text-(--brand-text) flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Step-by-Step Discriminant Derivation</span>
                          </span>
                          <span className="font-mono text-[10.5px] text-(--foreground-secondary)">
                            Solved in 38s
                          </span>
                        </div>
                        <div className="text-(--foreground-secondary) leading-relaxed">
                          <MathRenderer content="Equate equations: $2x^2 - 5x + 3 = 3x - k \implies 2x^2 - 8x + (3 + k) = 0$. For exactly one real solution, set discriminant $\Delta = b^2 - 4ac = 0$: $(-8)^2 - 4(2)(3 + k) = 64 - 24 - 8k = 0 \implies 8k = 40 \implies k = 5$." />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Video Masterclass Mode */}
                {heroTab === 'video' && (
                  <div className="p-5 sm:p-6 space-y-4 bg-(--surface) animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-(--border)">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-(--brand-cta) text-white flex items-center justify-center text-xs font-bold">
                          WB
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-(--foreground)">1550+ Strategy & Desmos Masterclass</div>
                          <div className="text-[11px] text-(--foreground-secondary)">Official White Board SAT Lecture Demo</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        FREE LESSON
                      </span>
                    </div>

                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-(--border) shadow-inner">
                      <iframe
                        className="w-full h-full object-cover"
                        src="https://www.youtube-nocookie.com/embed/eBSeCp__NP8?rel=0&modestbranding=1"
                        title="White Board SAT - Digital SAT Walkthrough"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
                      <div className="bg-(--brand-soft) border border-(--border) rounded-lg py-2 px-2 text-(--brand-text) font-semibold">
                        ⚡ Desmos Speed
                      </div>
                      <div className="bg-(--brand-soft) border border-(--border) rounded-lg py-2 px-2 text-(--brand-text) font-semibold">
                        🎯 Module 2 Traps
                      </div>
                      <div className="bg-(--brand-soft) border border-(--border) rounded-lg py-2 px-2 text-(--brand-text) font-semibold">
                        📐 Math 800 Hacks
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: Real-Time Score Calibration Analytics Mode */}
                {heroTab === 'analytics' && (
                  <div className="p-5 sm:p-6 space-y-5 bg-(--surface) animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-(--border)">
                      <div>
                        <div className="text-[11px] font-mono text-(--foreground-secondary) uppercase tracking-wider font-semibold">
                          Predictive Calibration
                        </div>
                        <div className="text-3xl font-extrabold font-mono text-(--brand-text) mt-0.5">
                          1550 <span className="text-sm font-sans font-normal text-(--foreground-secondary)">/ 1600</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 font-mono">
                          99th PERCENTILE
                        </span>
                        <div className="text-[11px] text-(--foreground-secondary) mt-1">Band: 1520–1570</div>
                      </div>
                    </div>

                    {/* Domain Breakdown Bars */}
                    <div className="space-y-3">
                      <div className="text-[12px] font-bold text-(--foreground) uppercase tracking-wider text-xs">
                        Domain Calibration Index
                      </div>

                      <div className="space-y-2 text-[12px]">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-(--foreground)">Advanced Math (Quadratics & Functions)</span>
                            <span className="font-mono font-bold text-(--brand-text)">94%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)">
                            <div className="h-full bg-(--brand-cta) rounded-full" style={{ width: '94%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-(--foreground)">Algebra & Linear Systems</span>
                            <span className="font-mono font-bold text-(--brand-text)">96%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)">
                            <div className="h-full bg-(--brand-cta) rounded-full" style={{ width: '96%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-(--foreground)">Craft & Structure (Verbal)</span>
                            <span className="font-mono font-bold text-teal-600">91%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: '91%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-(--foreground)">Information & Ideas (Data & Passages)</span>
                            <span className="font-mono font-bold text-teal-600">89%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)">
                            <div className="h-full bg-teal-500 rounded-full" style={{ width: '89%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="w-full py-2.5 bg-(--brand-cta) hover:bg-(--brand-hover) text-white text-[12.5px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Open Full Candidate Analytics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Ambient Badge 1: Top Right */}
              <div className="hidden sm:flex absolute -top-5 -right-5 bg-(--surface) rounded-xl border border-(--border-strong) p-3 shadow-lg items-center gap-2.5 animate-bounce duration-1000 z-20">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-(--foreground-secondary) uppercase tracking-wider">Score Delta</div>
                  <div className="text-sm font-extrabold font-mono text-emerald-600">+160 pts Avg.</div>
                </div>
              </div>

              {/* Floating Ambient Badge 2: Bottom Left */}
              <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-(--surface) rounded-xl border border-(--border-strong) p-3 shadow-lg items-center gap-2.5 z-20">
                <div className="w-8 h-8 rounded-lg bg-(--brand-soft) text-(--brand-text) flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-(--brand-text)" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-(--foreground-secondary) uppercase tracking-wider">Interface Match</div>
                  <div className="text-xs font-bold text-(--foreground)">100% Bluebook Standard</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 TRUST & VALUE STRIP: Sleek Glassmorphic Tiles */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-16 bg-(--surface) border-b border-(--border)">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-(--brand-soft) border border-(--border) hover:border-(--brand) transition-all space-y-3 group shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-(--surface) text-(--brand-text) flex items-center justify-center border border-(--border) shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-(--brand-text)" />
              </div>
              <h3 className="text-base font-bold text-(--foreground)">Adaptive Testing Engine</h3>
              <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                Replicates the College Board multi-stage adaptive logic with Module 1 calibration and routing to Hard Module 2.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-(--brand-soft) border border-(--border) hover:border-(--brand) transition-all space-y-3 group shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-(--surface) text-(--brand-text) flex items-center justify-center border border-(--border) shadow-xs group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5 text-(--brand-text)" />
              </div>
              <h3 className="text-base font-bold text-(--foreground)">Integrated Desmos Suite</h3>
              <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                Full-featured graphing calculator with speed shortcuts, regression tables, and regression solver guides.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-(--brand-soft) border border-(--border) hover:border-(--brand) transition-all space-y-3 group shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-(--surface) text-(--brand-text) flex items-center justify-center border border-(--border) shadow-xs group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-(--brand-text)" />
              </div>
              <h3 className="text-base font-bold text-(--foreground)">Step-by-Step KaTeX Proofs</h3>
              <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                Instant detailed derivations, alternative elimination strategies, and common trap explanations for every question.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-(--brand-soft) border border-(--border) hover:border-(--brand) transition-all space-y-3 group shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-(--surface) text-(--brand-text) flex items-center justify-center border border-(--border) shadow-xs group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5 text-(--brand-text)" />
              </div>
              <h3 className="text-base font-bold text-(--foreground)">Skill Calibration Matrix</h3>
              <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                Domain-by-domain diagnostic curves pinpoint exact weaknesses across all 8 College Board sub-disciplines.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 03 PRACTICE SECTION: Practice with purpose */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 bg-(--brand-soft)/40 border-b border-(--border)">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="text-[11px] font-bold tracking-widest text-(--brand-text) uppercase font-mono">
                  QUESTION BANK ARCHITECTURE
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--foreground) leading-tight">
                  Targeted drills. <br />
                  Zero wasted effort.
                </h2>
                <p className="text-[15px] text-(--foreground-secondary) leading-relaxed">
                  Every problem in our question bank is categorized across official domains, subtopics, and difficulty bands to train your test-day instincts.
                </p>
              </div>

              <div className="space-y-3 text-[13.5px] text-(--foreground-secondary)">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-(--foreground) font-medium">8 Core Digital SAT Domains (Math + Reading & Writing)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-(--foreground) font-medium">Mathematical KaTeX Proofs & Desmos Solver Videos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-(--foreground) font-medium">Bluebook Strikethrough & Elimination Shortcuts</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('practice')}
                  className="px-6 py-3.5 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-bold text-[14px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Explore Question Bank</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-white" />
                </button>
              </div>
            </div>

            {/* Right Column: Real Question Bank Interface Preview */}
            <div className="lg:col-span-7">
              <div className="bg-(--surface) rounded-2xl border border-(--border-strong) p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-(--border) text-[12px]">
                  <div className="flex items-center gap-2.5 font-mono flex-wrap">
                    <span className="font-bold text-(--foreground) bg-(--brand-soft) px-2 py-0.5 rounded border border-(--border)">M-ALG-101</span>
                    <span className="text-(--foreground-muted)">•</span>
                    <span className="font-semibold text-(--foreground)">Algebra</span>
                    <span className="text-(--foreground-muted)">•</span>
                    <span className="text-(--foreground-secondary)">Linear Equations</span>
                  </div>
                  <span className="text-(--brand-text) font-semibold bg-(--brand-soft) px-2.5 py-1 rounded-md text-[11px] border border-(--border)">
                    Medium Difficulty
                  </span>
                </div>

                <div className="text-[16px] text-(--foreground) leading-relaxed font-medium">
                  <MathRenderer content="If $3x - 7 = 14$, what is the value of $6x + 5$?" />
                </div>

                {/* Answer Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'A', text: '37' },
                    { id: 'B', text: '47' },
                    { id: 'C', text: '42' },
                    { id: 'D', text: '51' },
                  ].map((choice) => (
                    <div
                      key={choice.id}
                      onClick={() => {
                        setSelectedPracticeChoice(choice.id as 'A' | 'B' | 'C' | 'D');
                        setShowPracticeExplanation(true);
                      }}
                      className={`p-3.5 rounded-xl border text-[14px] flex items-center gap-3.5 cursor-pointer transition-colors ${
                        selectedPracticeChoice === choice.id
                          ? choice.id === 'B'
                            ? 'bg-teal-50/70 border-(--brand) text-(--foreground) font-semibold shadow-xs'
                            : 'bg-rose-50 border-rose-500 text-rose-950 font-semibold'
                          : 'bg-(--surface-soft) border-(--border) hover:bg-(--brand-soft) text-(--foreground)'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          selectedPracticeChoice === choice.id
                            ? choice.id === 'B'
                              ? 'bg-(--brand-cta) text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-(--surface) text-(--foreground-secondary) border border-(--border)'
                        }`}
                      >
                        {choice.id}
                      </span>
                      <span className="font-mono">{choice.text}</span>
                    </div>
                  ))}
                </div>

                {/* Explanation Box */}
                {showPracticeExplanation && (
                  <div className="p-4 bg-(--brand-soft) rounded-xl border border-teal-200/80 space-y-2 text-[13px] animate-in fade-in duration-150 shadow-xs">
                    <div className="font-bold text-(--brand-text) flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer: B (47)</span>
                    </div>
                    <div className="text-(--foreground-secondary) leading-relaxed">
                      <MathRenderer content="First solve for $x$: $3x = 21 \implies x = 7$. Then substitute into $6x + 5 = 6(7) + 5 = 42 + 5 = 47$." />
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 PERFORMANCE ENGINE: Precision Light Analytics Section */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 bg-(--surface) text-(--foreground) border-b border-(--border) relative overflow-hidden">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-widest text-(--brand-text) uppercase">
              DIAGNOSTIC CALIBRATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--foreground) leading-tight">
              Know exactly where you stand.
            </h2>
            <p className="text-[15px] text-(--foreground-secondary) leading-relaxed">
              Precision accuracy curves and domain breakdown reveal the shortest, most efficient route to your score goal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Focus: Large Accuracy Curve Chart */}
            <div className="lg:col-span-7 p-7 sm:p-8 bg-(--brand-soft)/50 rounded-2xl border border-(--border) space-y-6 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-(--foreground-secondary) uppercase tracking-wider block">
                    Historical Accuracy
                  </span>
                  <div className="text-4xl font-extrabold font-mono text-(--foreground) mt-1">67%</div>
                </div>

                <div className="text-[11px] text-(--brand-text) font-mono font-bold bg-(--surface) px-3.5 py-1.5 rounded-full border border-(--border)">
                  +8% ROLLING INCREASE
                </div>
              </div>

              {/* Light Theme SVG Line Chart with Gradient Area Fill */}
              <div className="h-48 w-full pt-3">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="accuracyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#087C76" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#087C76" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Subtle Grid Guidelines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#CBD5E1" strokeWidth="1" opacity="0.6" />

                  {/* Shaded Area Fill Under Curve */}
                  <path
                    d="M 0 110 Q 90 95, 150 80 T 270 65 T 390 45 T 500 30 L 500 120 L 0 120 Z"
                    fill="url(#accuracyAreaGradient)"
                  />

                  {/* Main Line */}
                  <path
                    d="M 0 110 Q 90 95, 150 80 T 270 65 T 390 45 T 500 30"
                    fill="none"
                    stroke="#087C76"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  <circle cx="0" cy="110" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="150" cy="80" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="270" cy="65" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="390" cy="45" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="500" cy="30" r="6" fill="#087C76" stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-(--foreground-secondary) font-mono border-t border-(--border) pt-4">
                <span>Day 1 (55%)</span>
                <span>Day 7 (62%)</span>
                <span>Day 14 (65%)</span>
                <span>Today (67%)</span>
              </div>
            </div>

            {/* Right Supporting Light Metrics */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 bg-(--surface) rounded-2xl border border-(--border) space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-mono font-semibold text-(--foreground-secondary) uppercase tracking-wider block">
                  Target Score Projection
                </span>
                <div className="text-3xl font-extrabold font-mono text-(--brand-text)">1550</div>
                <div className="text-[12px] text-(--foreground-secondary)">Projected Score Range: 1520–1570</div>
              </div>

              <div className="p-6 bg-(--surface) rounded-2xl border border-(--border) space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-mono font-semibold text-(--foreground-secondary) uppercase tracking-wider block">
                  Questions Attempted
                </span>
                <div className="text-3xl font-extrabold font-mono text-(--foreground)">1,480</div>
                <div className="text-[12px] text-(--foreground-secondary)">Across Math & Verbal Banks</div>
              </div>

              <div className="p-6 bg-(--surface) rounded-2xl border border-(--border) space-y-1.5 shadow-2xs">
                <span className="text-[11px] font-mono font-semibold text-(--foreground-secondary) uppercase tracking-wider block">
                  Avg. Response Time
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-600">54s</div>
                <div className="text-[12px] text-(--foreground-secondary)">Pacing safely within College Board standard</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 05 MASTERCLASS CURRICULUM SECTION */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 bg-(--brand-soft)/30 border-b border-(--border)">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <span className="text-[11px] font-mono font-bold tracking-widest text-(--brand-text) uppercase">
                SYSTEMATIC CURRICULUM
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--foreground)">
                Mastery Systems.
              </h2>
              <p className="text-[15px] text-(--foreground-secondary)">
                Structured video masterclasses, Desmos speed techniques, and grammar boundary rules.
              </p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-[13.5px] font-semibold text-(--brand-text) hover:text-(--brand-text) flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View all courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-(--surface) rounded-2xl border border-(--border) p-7 flex flex-col justify-between space-y-6 hover:border-(--brand) transition-all shadow-xs group">
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-(--brand-text)">01</div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-(--foreground) group-hover:text-(--brand-text) transition-colors">SAT Math 800 Mastery</h3>
                  <p className="text-[13.5px] text-(--foreground-secondary)">The complete algebra to advanced math system</p>
                </div>
                <div className="text-[11.5px] text-(--foreground-secondary) font-mono">38 Modules • 72% Complete</div>

                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)">
                    <div className="h-full bg-(--brand-cta) rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="bg-(--surface) rounded-2xl border border-(--border) p-7 flex flex-col justify-between space-y-6 hover:border-(--brand) transition-all shadow-xs group">
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-(--brand-text)">02</div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-(--foreground) group-hover:text-(--brand-text) transition-colors">Verbal 750+ Strategy</h3>
                  <p className="text-[13.5px] text-(--foreground-secondary)">Reading & Writing operating rules and boundaries</p>
                </div>
                <div className="text-[11.5px] text-(--foreground-secondary) font-mono">32 Modules • 45% Complete</div>

                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 rounded-full bg-(--surface-soft) overflow-hidden border border-(--border)">
                    <div className="h-full bg-(--brand-cta) rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-3 bg-(--surface) hover:bg-(--surface-soft) text-(--foreground) font-semibold text-[13px] rounded-xl border border-(--border-strong) transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-(--surface) rounded-2xl border border-(--border) p-7 flex flex-col justify-between space-y-6 hover:border-(--brand) transition-all shadow-xs group">
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-(--brand-text)">03</div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-(--foreground) group-hover:text-(--brand-text) transition-colors">Desmos Graphing Speed</h3>
                  <p className="text-[13.5px] text-(--foreground-secondary)">Shortcuts, regression tables, and visual answers</p>
                </div>
                <div className="text-[11.5px] text-(--foreground-secondary) font-mono">14 Modules • Free Diagnostic</div>

                <div className="pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    FREE ACCESS
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Start Free Course</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 06 MOCK TEST SIMULATOR SECTION */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 bg-(--surface) border-b border-(--border)">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-widest text-(--brand-text) uppercase">
              EXAM SIMULATOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--foreground)">
              Practice under pressure.
            </h2>
            <p className="text-[15px] text-(--foreground-secondary) leading-relaxed">
              Full-length timed exams replicating the official digital SAT timing, module transitions, and pacing.
            </p>
          </div>

          {/* Authentic Mock Test Simulator Card */}
          <div className="bg-(--surface) rounded-2xl border border-(--border-strong) overflow-hidden shadow-xl">
            {/* Top Exam Header */}
            <div className="bg-(--navy-section) text-white px-5 sm:px-7 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="font-bold text-[13px] tracking-tight">MOCK TEST 01</div>
                <span className="text-white/40">|</span>
                <div className="text-[11.5px] text-(--brand-text) font-mono">Reading & Writing • Module 1</div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg font-mono text-[12.5px] border border-white/15">
                <Clock className="w-3.5 h-3.5 text-(--brand-text)" />
                <span>31:45</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="px-3 py-1 bg-(--brand-cta) text-white text-[11.5px] font-semibold rounded-lg shadow-xs hover:bg-(--brand-hover) transition-colors cursor-pointer"
                >
                  Launch Full Exam
                </button>
              </div>
            </div>

            {/* Exam Content */}
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-(--surface)">
              <div className="lg:col-span-8 space-y-5">
                <div className="text-[12px] font-mono text-(--foreground-secondary) font-medium">Question 14 of 27</div>
                <div className="text-[15px] text-(--foreground) leading-relaxed font-normal">
                  In a study on cognitive linguistics, researchers observed that participants exposed to structured conceptual metaphors showed higher recall accuracy. The findings suggest that linguistic framing ______ memory retention during analytical tasks.
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3.5 bg-(--brand-soft) rounded-xl border border-(--border) text-[14px] flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-(--surface) flex items-center justify-center font-mono font-bold text-xs text-(--foreground-secondary) border border-(--border)">A</span>
                    <span>precludes</span>
                  </div>
                  <div className="p-3.5 bg-teal-50/80 rounded-xl border border-(--brand) text-[14px] flex items-center gap-3.5 font-semibold text-(--foreground) shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-(--brand-cta) text-white flex items-center justify-center font-mono font-bold text-xs">B</span>
                    <span>enhances</span>
                  </div>
                  <div className="p-3.5 bg-(--brand-soft) rounded-xl border border-(--border) text-[14px] flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-(--surface) flex items-center justify-center font-mono font-bold text-xs text-(--foreground-secondary) border border-(--border)">C</span>
                    <span>diminishes</span>
                  </div>
                  <div className="p-3.5 bg-(--brand-soft) rounded-xl border border-(--border) text-[14px] flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-(--surface) flex items-center justify-center font-mono font-bold text-xs text-(--foreground-secondary) border border-(--border)">D</span>
                    <span>neutralizes</span>
                  </div>
                </div>
              </div>

              {/* Question Navigator Strip */}
              <div className="lg:col-span-4 bg-(--brand-soft) p-6 rounded-2xl border border-(--border) space-y-5">
                <div className="text-[12px] font-bold uppercase tracking-wider text-(--foreground)">
                  Module 1 Question Matrix
                </div>
                <div className="grid grid-cols-5 gap-2 text-center font-mono text-[12px]">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border ${
                        i === 13
                          ? 'bg-(--navy-section) text-white border-(--navy-section) font-bold shadow-xs'
                          : i < 13
                          ? 'bg-(--surface) text-(--foreground) border-(--border)'
                          : 'bg-(--surface-soft) text-(--foreground-muted) border-transparent'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="w-full py-3 bg-(--brand-cta) hover:bg-(--brand-hover) text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Start Full Mock Test</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 07 VERIFIED STUDENT SCORE TRANSFORMATIONS SECTION */}
      {/* ============================================================ */}
      <section className="py-20 sm:py-24 bg-(--brand-soft)/40 border-b border-(--border)">
        <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-widest text-(--brand-text) uppercase">
              STUDENT OUTCOMES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-(--foreground)">
              Proven 1500+ Results.
            </h2>
            <p className="text-[15px] text-(--foreground-secondary)">
              Real candidates who engineered their target SAT scores with White Board SAT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-(--surface) border border-(--border) space-y-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +210 PTS
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-(--foreground)">
                  1340 <span className="text-(--foreground-muted) font-normal text-lg">→</span> <span className="text-(--brand-text)">1550</span>
                </div>
                <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                  &ldquo;The Desmos graphing shortcuts alone saved me 10 minutes in Math Module 2. I got an 800 on Math thanks to the quadratic and circle drill sets.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-(--border) flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-(--foreground)">Aayan R.</div>
                  <div className="text-(--foreground-secondary)">Math 800 • Class of 2025</div>
                </div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-(--surface) border border-(--border) space-y-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +120 PTS
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-(--foreground)">
                  1420 <span className="text-(--foreground-muted) font-normal text-lg">→</span> <span className="text-(--brand-text)">1540</span>
                </div>
                <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                  &ldquo;Reading & Writing transitions and punctuation questions always tripped me up. The boundary rules curriculum made every question clear and predictable.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-(--border) flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-(--foreground)">Sarah K.</div>
                  <div className="text-(--foreground-secondary)">Verbal 760 • Class of 2025</div>
                </div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            <div className="p-7 rounded-2xl bg-(--surface) border border-(--border) space-y-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +220 PTS
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono text-(--foreground)">
                  1290 <span className="text-(--foreground-muted) font-normal text-lg">→</span> <span className="text-(--brand-text)">1510</span>
                </div>
                <p className="text-[13.5px] text-(--foreground-secondary) leading-relaxed">
                  &ldquo;White Board SAT is identical to the real Bluebook app. Taking full timed mock tests every Saturday gave me complete pacing confidence.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-(--border) flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-(--foreground)">Tanvir H.</div>
                  <div className="text-(--foreground-secondary)">Math 790 • Class of 2025</div>
                </div>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 08 FINAL CONVERSION CTA: High-Impact Glassmorphic Dark Card */}
      {/* ============================================================ */}
      <section className="py-24 sm:py-28 bg-(--brand-soft) relative overflow-hidden border-t border-(--border)">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-(--navy-section) text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl border border-white/10 relative overflow-hidden">
            {/* Ambient inner gradient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-(--brand-cta)/20 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 text-(--brand-text) font-mono font-bold text-[11px] tracking-widest uppercase bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 shadow-xs">
              <span>JOIN 1,200+ DIGITAL SAT CANDIDATES</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Stop guessing. <br />
              <span className="text-(--brand-text)">Start scoring 1500+.</span>
            </h2>

            <p className="text-white/85 text-[15px] sm:text-[16px] max-w-xl mx-auto leading-relaxed font-normal">
              Get immediate access to hand-crafted questions, authentic timed mock tests, and systematic masterclass video courses.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onNavigate('practice');
                }}
                className="px-8 py-4 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-bold text-[15px] rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2.5 cursor-pointer active:scale-95"
              >
                <span>Start Practicing Now</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  onNavigate('courses');
                }}
                className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-[15px] rounded-xl border border-white/20 transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                Explore Courses
              </button>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/70 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-400" /> Free Diagnostics
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-400" /> No Credit Card Required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-400" /> Instant Access
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
