import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Video,
  ExternalLink,
} from 'lucide-react';
import { NavView } from '../../components/Navbar';
import { MathRenderer } from '../../components/MathRenderer';

interface LandingPageProps {
  onNavigate: (view: NavView) => void;
  onOpenPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenPricing }) => {
  // Interactive Question State for the Practice Section
  const [selectedPracticeChoice, setSelectedPracticeChoice] = useState<'A' | 'B' | 'C' | 'D' | null>('B');
  const [showPracticeExplanation, setShowPracticeExplanation] = useState(true);

  return (
    <div className="bg-[#FFFFFF] text-[#071126] animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 01 HERO SECTION: Very Light Mint Background (#F1F8F7) */}
      {/* ============================================================ */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 bg-[#F1F8F7] border-b border-[#E2E8F0] overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* LEFT: Editorial Headline & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-[#087C76] font-bold text-[11px] tracking-[0.1em] uppercase bg-white px-3.5 py-1.5 rounded-full border border-[#E2E8F0] shadow-xs">
                <span>DIGITAL SAT PREPARATION PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-[-0.035em] text-[#071126] leading-[1.08]">
                Prepare Smarter. <br />
                Score Higher.
              </h1>

              <p className="text-[#58708A] text-base sm:text-lg leading-[1.6] max-w-xl font-normal">
                Structured practice, full-length mock tests, and performance analytics built around the digital SAT.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => onNavigate('practice')}
                  className="bg-[#087C76] text-white hover:bg-[#066F6A] px-7 py-4 rounded-xl font-semibold text-[15px] transition-colors flex items-center gap-2.5 cursor-pointer group shadow-xs"
                >
                  <span>Start Practicing Free</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 text-white" />
                </button>

                <button
                  onClick={() => onNavigate('courses')}
                  className="bg-white border border-[#E2E8F0] text-[#071126] hover:bg-[#F1F8F7] px-7 py-4 rounded-xl font-semibold text-[15px] transition-colors cursor-pointer shadow-xs"
                >
                  Explore Courses
                </button>
              </div>

              {/* Restrained Trust Line */}
              <div className="pt-6 flex flex-wrap items-center gap-x-3 text-[11px] font-mono uppercase tracking-wider text-[#58708A]">
                <span>DIGITAL SAT FORMAT</span>
                <span className="text-[#0D918A]">•</span>
                <span>MATH + READING & WRITING</span>
                <span className="text-[#0D918A]">•</span>
                <span>PERFORMANCE ANALYTICS</span>
              </div>
            </div>

            {/* RIGHT: Embedded YouTube Video Player */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white text-[#071126] rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-[0_12px_32px_rgba(8,13,33,0.04)] space-y-4">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#080D21] text-white font-bold text-[11px] flex items-center justify-center">
                      WB
                    </div>
                    <div>
                      <div className="font-bold text-[13.5px] text-[#071126] tracking-tight leading-none">
                        WHITE BOARD SAT
                      </div>
                      <div className="text-[11px] text-[#58708A] font-medium mt-1">
                        Platform Walkthrough & 1550+ Strategy
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#087C76] bg-[#F1F8F7] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      HD 1080p
                    </span>
                  </div>
                </div>

                {/* 16:9 Embedded YouTube Video Frame */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-[#E2E8F0] shadow-inner group">
                  <iframe
                    className="w-full h-full object-cover"
                    src="https://www.youtube-nocookie.com/embed/eBSeCp__NP8?rel=0&modestbranding=1"
                    title="White Board SAT - Digital SAT Preparation Walkthrough"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>

                {/* Video Info & Chapters */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-bold text-[#071126] flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#0D918A]" />
                      Digital SAT Masterclass & Demo
                    </span>
                    <span className="text-[#58708A] font-mono text-[11px]">12:45 mins</span>
                  </div>

                  {/* Core Takeaways Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
                    <div className="bg-[#F1F8F7] border border-[#E2E8F0] rounded-lg py-1.5 px-2 text-[#087C76]">
                      Desmos Tricks
                    </div>
                    <div className="bg-[#F1F8F7] border border-[#E2E8F0] rounded-lg py-1.5 px-2 text-[#087C76]">
                      Module Traps
                    </div>
                    <div className="bg-[#F1F8F7] border border-[#E2E8F0] rounded-lg py-1.5 px-2 text-[#087C76]">
                      800 Math Drills
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[12px] text-[#58708A]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    <span className="font-medium">Official Prep Overview</span>
                  </div>
                  <a
                    href="https://www.youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#087C76] hover:underline font-semibold flex items-center gap-1 text-[11.5px]"
                  >
                    <span>Watch Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 02 TRUST / VALUE STRIP */}
      {/* ============================================================ */}
      <section className="py-16 bg-[#F1F8F7] border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
            <div className="space-y-3 pt-4 md:pt-0 md:px-6 first:pl-0">
              <div className="font-mono text-xs font-bold text-[#0D918A]">01</div>
              <h3 className="text-[17px] font-bold text-[#071126]">Targeted Practice</h3>
              <p className="text-[14px] text-[#58708A] leading-relaxed">
                Filter questions by domain, subtopic, difficulty, and source to isolate specific skill gaps.
              </p>
            </div>

            <div className="space-y-3 pt-6 md:pt-0 md:px-6">
              <div className="font-mono text-xs font-bold text-[#0D918A]">02</div>
              <h3 className="text-[17px] font-bold text-[#071126]">Measured Progress</h3>
              <p className="text-[14px] text-[#58708A] leading-relaxed">
                Track accuracy across all 8 domains with real-time analytics and projected score bands.
              </p>
            </div>

            <div className="space-y-3 pt-6 md:pt-0 md:px-6 last:pr-0">
              <div className="font-mono text-xs font-bold text-[#0D918A]">03</div>
              <h3 className="text-[17px] font-bold text-[#071126]">Timed Performance</h3>
              <p className="text-[14px] text-[#58708A] leading-relaxed">
                Full-length mock tests that replicate the actual digital SAT format, interface, and pacing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 03 PRACTICE SECTION: Practice with purpose */}
      {/* ============================================================ */}
      <section className="py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & Information */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <div className="text-[11px] font-bold tracking-[0.1em] text-[#0D918A] uppercase font-mono">
                  QUESTION BANK
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126] leading-tight">
                  Practice with purpose.
                </h2>
                <p className="text-[15px] text-[#58708A] leading-relaxed">
                  Precision questions with step-by-step solutions designed for the digital SAT interface.
                </p>
              </div>

              <div className="space-y-3 pt-2 text-[13.5px] text-[#58708A]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[#071126] font-medium">8 Core Domains (Math & Verbal)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[#071126] font-medium">Instant Step-by-Step Mathematical Solutions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[#071126] font-medium">Free Diagnostic Drills + Full Premium Passes</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('practice')}
                  className="px-6 py-3.5 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[14px] rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs group"
                >
                  <span>Explore Question Bank</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Column: Real Question Bank Interface Preview */}
            <div className="lg:col-span-7">
              <div className="bg-[#F1F8F7] rounded-2xl border border-[#E2E8F0] p-7 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] text-[12px]">
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="font-bold text-[#071126]">M-ALG-101</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-[#071126]">Algebra</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#58708A]">Linear Equations</span>
                  </div>
                  <span className="text-[#087C76] font-semibold bg-white px-2.5 py-1 rounded-md text-[11px] border border-[#E2E8F0]">
                    Medium Difficulty
                  </span>
                </div>

                <div className="text-[16px] text-[#071126] leading-relaxed font-normal">
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
                            ? 'bg-teal-50/70 border-[#0D918A] text-[#071126] font-semibold shadow-xs'
                            : 'bg-rose-50 border-rose-500 text-rose-950 font-semibold'
                          : 'bg-white border-[#E2E8F0] hover:bg-slate-50 text-[#071126]'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          selectedPracticeChoice === choice.id
                            ? choice.id === 'B'
                              ? 'bg-[#087C76] text-white'
                              : 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-[#58708A]'
                        }`}
                      >
                        {choice.id}
                      </span>
                      <span>{choice.text}</span>
                    </div>
                  ))}
                </div>

                {/* Explanation Box */}
                {showPracticeExplanation && (
                  <div className="p-4.5 bg-white rounded-xl border border-teal-200 space-y-2 text-[13px] animate-in fade-in duration-150 shadow-xs">
                    <div className="font-bold text-[#087C76] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct Answer: B (47)</span>
                    </div>
                    <p className="text-[#58708A] leading-relaxed">
                      First solve for $x$: $3x = 21 \implies x = 7$. Then substitute into $6x + 5 = 6(7) + 5 = 42 + 5 = 47$.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 04 PERFORMANCE ENGINE: Premium Light Analytics Section (#F4F9F7) */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#F4F9F7] text-[#071126] border-b border-[#E2E8F0] relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-[#0D918A] uppercase">
              PERFORMANCE ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126] leading-tight">
              Know exactly where you stand.
            </h2>
            <p className="text-[15px] text-[#58708A] leading-relaxed">
              Precision accuracy curves and domain breakdown reveal the fastest path to your target score.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Focus: Large Accuracy Curve Chart */}
            <div className="lg:col-span-7 p-7 sm:p-8 bg-white rounded-2xl border border-[#E2E8F0] space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                    Current Accuracy
                  </span>
                  <div className="text-4xl font-extrabold font-mono text-[#071126] mt-1">67%</div>
                </div>

                <div className="text-[11px] text-[#087C76] font-mono font-bold bg-[#E6F4F2] px-3.5 py-1.5 rounded-full border border-[#087C76]/20">
                  +8% ROLLING INCREASE
                </div>
              </div>

              {/* Light Theme SVG Line Chart with Gradient Area Fill */}
              <div className="h-48 w-full pt-3">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 130" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="accuracyAreaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#087C76" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#087C76" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {/* Subtle Grid Guidelines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />

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
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  <circle cx="0" cy="110" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="150" cy="80" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="270" cy="65" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="390" cy="45" r="4.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2" />
                  <circle cx="500" cy="30" r="5.5" fill="#087C76" stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-[#58708A] font-mono border-t border-[#E2E8F0] pt-4">
                <span>Day 1 (55%)</span>
                <span>Day 7 (62%)</span>
                <span>Day 14 (65%)</span>
                <span>Today (67%)</span>
              </div>
            </div>

            {/* Right 3 Supporting Light Metrics */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] space-y-1.5 shadow-sm">
                <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                  Target Score
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#087C76]">1550</div>
                <div className="text-[12px] text-[#58708A]">Projected Range: 1510–1560</div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] space-y-1.5 shadow-sm">
                <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                  Questions Attempted
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#071126]">1,480</div>
                <div className="text-[12px] text-[#58708A]">Across Math & Verbal Banks</div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-[#E2E8F0] space-y-1.5 shadow-sm">
                <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                  Avg. Response Time
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#087C76]">54s</div>
                <div className="text-[12px] text-[#58708A]">Pacing within target window</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 05 MASTERCLASS CURRICULUM SECTION: White Background */}
      {/* ============================================================ */}
      <section className="py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-3">
              <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-[#0D918A] uppercase">
                MASTERCLASS CURRICULUM
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126]">
                Mastery Systems.
              </h2>
              <p className="text-[15px] text-[#58708A]">
                Deep video lectures, Desmos speed techniques, and grammar rules.
              </p>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="text-[13.5px] font-semibold text-[#087C76] hover:text-[#066F6A] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View all courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#F1F8F7] rounded-2xl border border-[#E2E8F0] p-7 flex flex-col justify-between space-y-6 hover:border-[#0D918A] transition-colors shadow-xs">
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-[#0D918A]">01</div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#071126]">SAT Math 800 Mastery</h3>
                  <p className="text-[13.5px] text-[#58708A]">The complete algebra to advanced math system</p>
                </div>
                <div className="text-[11.5px] text-[#58708A] font-mono">38 Modules • 72% Complete</div>

                {/* Progress */}
                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#087C76] rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-3 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#F1F8F7] rounded-2xl border border-[#E2E8F0] p-7 flex flex-col justify-between space-y-6 hover:border-[#0D918A] transition-colors shadow-xs">
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-[#0D918A]">02</div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#071126]">Verbal 750+ Strategy</h3>
                  <p className="text-[13.5px] text-[#58708A]">Reading & Writing operating rules and boundaries</p>
                </div>
                <div className="text-[11.5px] text-[#58708A] font-mono">32 Modules • 45% Complete</div>

                <div className="space-y-1 pt-1">
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#087C76] rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-3 bg-white hover:bg-slate-50 text-[#071126] font-semibold text-[13px] rounded-xl border border-[#E2E8F0] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-[#F1F8F7] rounded-2xl border border-[#E2E8F0] p-7 flex flex-col justify-between space-y-6 hover:border-[#0D918A] transition-colors shadow-xs">
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-[#0D918A]">03</div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-[#071126]">Desmos Graphing Speed</h3>
                  <p className="text-[13.5px] text-[#58708A]">Shortcuts, regression tables, and visual answers</p>
                </div>
                <div className="text-[11.5px] text-[#58708A] font-mono">14 Modules • Free Diagnostic</div>

                <div className="pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                    FREE ACCESS
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-3 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[13px] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Start Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 06 MOCK TEST SIMULATOR SECTION: Soft Background (#F1F8F7) */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#F1F8F7] border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-[#0D918A] uppercase">
              EXAM SIMULATOR
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126]">
              Practice under pressure.
            </h2>
            <p className="text-[15px] text-[#58708A] leading-relaxed">
              Full-length timed exams replicating the official digital SAT timing, module transitions, and pacing.
            </p>
          </div>

          {/* Authentic Mock Test Simulator Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-[0_10px_30px_rgba(8,13,33,0.04)]">
            {/* Top Exam Header */}
            <div className="bg-[#080D21] text-white px-7 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="font-bold text-[13px] tracking-tight">MOCK TEST 01</div>
                <span className="text-slate-700">|</span>
                <div className="text-[11.5px] text-[#0D918A] font-mono">Reading & Writing • Module 1</div>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0E152D] rounded-lg font-mono text-[12.5px] border border-[#1C284D]">
                <Clock className="w-4 h-4 text-[#0D918A]" />
                <span>31:45</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[11.5px] text-[#58708A] hidden sm:inline">Directions</span>
                <button className="px-3 py-1 bg-[#0E152D] text-slate-300 text-[11.5px] rounded-lg border border-[#1C284D]">
                  Formulas
                </button>
              </div>
            </div>

            {/* Exam Content */}
            <div className="p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-5">
                <div className="text-[12px] font-mono text-[#58708A] font-medium">Question 14 of 27</div>
                <div className="text-[15.5px] text-[#071126] leading-relaxed">
                  In a study on cognitive linguistics, researchers observed that participants exposed to structured conceptual metaphors showed higher recall accuracy. The findings suggest that linguistic framing ______ memory retention during analytical tasks.
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="p-3.5 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] text-[14px] flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-[#58708A]">A</span>
                    <span>precludes</span>
                  </div>
                  <div className="p-3.5 bg-teal-50/70 rounded-xl border border-[#0D918A] text-[14px] flex items-center gap-3.5 font-semibold text-[#071126] shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-[#087C76] text-white flex items-center justify-center font-mono font-bold text-xs">B</span>
                    <span>enhances</span>
                  </div>
                  <div className="p-3.5 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] text-[14px] flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-[#58708A]">C</span>
                    <span>diminishes</span>
                  </div>
                  <div className="p-3.5 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] text-[14px] flex items-center gap-3.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-[#58708A]">D</span>
                    <span>neutralizes</span>
                  </div>
                </div>
              </div>

              {/* Question Navigator Strip */}
              <div className="lg:col-span-4 bg-[#F1F8F7] p-6 rounded-2xl border border-[#E2E8F0] space-y-5">
                <div className="text-[12px] font-bold uppercase tracking-wider text-[#071126]">
                  Module 1 Palette
                </div>
                <div className="grid grid-cols-5 gap-2 text-center font-mono text-[12px]">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-lg border ${
                        i === 13
                          ? 'bg-[#080D21] text-white border-[#080D21] font-bold shadow-xs'
                          : i < 13
                          ? 'bg-white text-slate-700 border-slate-300'
                          : 'bg-slate-100 text-slate-400 border-transparent'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="w-full py-3 bg-[#087C76] hover:bg-[#066F6A] text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Start Full Mock Test</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 07 STATS / SKILL MASTERY MATRIX: White Background */}
      {/* ============================================================ */}
      <section className="py-24 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold tracking-[0.1em] text-[#0D918A] uppercase">
              SKILL MASTERY MATRIX
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126]">
              Turn practice into progress.
            </h2>
            <p className="text-[15px] text-[#58708A] leading-relaxed">
              Every completed question updates your domain calibration in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-7 rounded-2xl bg-[#F1F8F7] border border-[#E2E8F0] space-y-2 shadow-xs">
              <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                Questions Attempted
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#071126]">1,480</div>
              <div className="text-[12px] text-[#58708A]">Across all domains</div>
            </div>

            <div className="p-7 rounded-2xl bg-[#F1F8F7] border border-[#E2E8F0] space-y-2 shadow-xs">
              <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                Study Time Logged
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#071126]">24h 15m</div>
              <div className="text-[12px] text-[#58708A]">Active test time</div>
            </div>

            <div className="p-7 rounded-2xl bg-[#F1F8F7] border border-[#E2E8F0] space-y-2 shadow-xs">
              <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                Avg. Response Time
              </span>
              <div className="text-3xl font-extrabold font-mono text-[#087C76]">54s</div>
              <div className="text-[12px] text-emerald-600 font-semibold">Optimal SAT pacing</div>
            </div>

            <div className="p-7 rounded-2xl bg-[#F1F8F7] border border-[#E2E8F0] space-y-2 shadow-xs">
              <span className="text-[11px] font-mono font-semibold text-[#58708A] uppercase tracking-wider block">
                Average Improvement
              </span>
              <div className="text-3xl font-extrabold font-mono text-emerald-600">+160 pts</div>
              <div className="text-[12px] text-[#58708A]">Score delta verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 08 FINAL CTA SECTION: Light Mint (#F4FAF8) with Light Study System Visuals */}
      {/* ============================================================ */}
      <section className="py-28 bg-[#F4FAF8] text-[#071126] relative overflow-hidden border-t border-[#E2E8F0]">
        {/* Floating Academic Study System Objects (Decorative & Secondary) */}
        <div className="absolute inset-0 pointer-events-none max-w-[1400px] mx-auto px-6 hidden xl:block">
          {/* Top Left: Target Score Card */}
          <div className="absolute top-12 left-12 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm animate-float-1 -rotate-2 w-44">
            <div className="text-[10px] font-mono text-[#58708A] uppercase tracking-wider">Target Objective</div>
            <div className="text-2xl font-extrabold font-mono text-[#087C76] mt-0.5">1550+</div>
            <div className="text-[10px] text-[#58708A] font-medium mt-1 flex items-center gap-1">
              <span className="text-[#0D918A] font-bold">✓</span> Verified Pathway
            </div>
          </div>

          {/* Bottom Left: Math 800 Book Object */}
          <div className="absolute bottom-12 left-16 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm animate-float-2 -rotate-3 w-52 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0D918A]" />
              <span className="text-[11px] font-mono font-bold text-[#58708A]">DIGITAL SAT</span>
            </div>
            <div className="text-sm font-bold text-[#071126]">Math 800 Mastery</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#087C76] w-3/4 rounded-full" />
            </div>
          </div>

          {/* Top Right: Improvement Metric Card */}
          <div className="absolute top-10 right-14 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm animate-float-3 rotate-2 w-48 space-y-1">
            <div className="text-[10px] font-mono text-[#58708A] uppercase tracking-wider">Average Delta</div>
            <div className="text-2xl font-extrabold font-mono text-[#087C76]">+160 pts</div>
            <div className="text-[10px] text-[#58708A]">Student Score Increase</div>
          </div>

          {/* Bottom Right: Reading & Writing Book Object */}
          <div className="absolute bottom-10 right-16 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-sm animate-float-1 rotate-3 w-52 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0D918A]" />
              <span className="text-[11px] font-mono font-bold text-[#58708A]">VERBAL SYSTEM</span>
            </div>
            <div className="text-sm font-bold text-[#071126]">Reading & Writing 750+</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#087C76] w-full rounded-full" />
            </div>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6 max-w-3xl">
          <div className="text-[11px] font-mono font-bold tracking-[0.1em] text-[#0D918A] uppercase">
            GET STARTED TODAY
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#071126] leading-tight">
            Your target score <br />
            starts with better practice.
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#58708A] max-w-xl mx-auto leading-relaxed font-normal">
            Join candidates preparing for the 1500+ Digital SAT with precision drills, video masterclasses, and timed mock tests.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavigate('practice');
              }}
              className="px-7 py-4 bg-[#087C76] hover:bg-[#066F6A] text-white font-bold text-[14px] rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2.5 cursor-pointer"
            >
              <span>Start Practicing</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavigate('courses');
              }}
              className="px-7 py-4 bg-white hover:bg-slate-50 text-[#071126] font-semibold text-[14px] rounded-xl border border-[#CBD5E1] hover:border-[#94A3B8] transition-colors cursor-pointer shadow-xs"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

