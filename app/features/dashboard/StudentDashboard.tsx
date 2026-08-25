import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, Course, PracticeAttempt, Domain } from '../../types';
import { formatDomainName } from '../../lib/utils';
import { NavView } from '../../components/Navbar';

interface StudentDashboardProps {
  currentUser: UserProfile;
  courses: Course[];
  practiceAttempts: PracticeAttempt[];
  totalQuestionsAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTimeSpentMinutes: number;
  domainStats: { domain: Domain; correct: number; total: number; accuracy: number }[];
  onNavigate: (view: NavView) => void;
  onOpenPricing: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  courses,
  practiceAttempts,
  totalQuestionsAttempted,
  totalCorrect,
  overallAccuracy,
  totalTimeSpentMinutes,
  domainStats,
  onNavigate,
  onOpenPricing,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: string;
    score: string;
    ref: string;
    cx: number;
    cy: number;
  } | null>(null);

  // Enrolled Courses
  const enrolledCourses = courses.filter(
    (c) => currentUser.access.enrolledCourseIds.includes(c.id) || currentUser.access.fullPremium
  );

  // Time format
  const hours = Math.floor(totalTimeSpentMinutes / 60);
  const mins = totalTimeSpentMinutes % 60;
  const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Weakest domain for focus recommendation
  const sortedDomains = [...domainStats].sort((a, b) => b.accuracy - a.accuracy);
  const attemptedDomains = sortedDomains.filter((d) => d.total > 0);
  const focusDomain = attemptedDomains.length > 0 ? attemptedDomains[attemptedDomains.length - 1] : domainStats[0];

  const trendPoints = [
    { day: 'Day 1', score: '55%', ref: 'Diagnostic Test #1', cx: 0, cy: 100 },
    { day: 'Day 7', score: '62%', ref: 'Practice Drill Set A', cx: 140, cy: 70 },
    { day: 'Day 14', score: '65%', ref: 'High-Yield Mock #2', cx: 260, cy: 55 },
    { day: 'Day 21', score: '66%', ref: 'Targeted Algebra Drill', cx: 380, cy: 40 },
    { day: 'Today', score: '67%', ref: 'Official Diagnostic #1', cx: 500, cy: 25 },
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. TOP EDITORIAL GREETING & PRIMARY PERFORMANCE STATS */}
      {/* ============================================================ */}
      <div className="pb-8 border-b border-[var(--border)] space-y-6">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-text)] font-mono">
            GOOD MORNING, {currentUser?.name?.toUpperCase() || 'STUDENT'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
            Your preparation is moving forward.
          </h1>
        </div>

        {/* 1 Dominant Metric + 2 Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          {/* Dominant Primary Metric */}
          <div className="p-5 bg-[var(--brand-soft)] rounded-xl border border-[var(--border)] space-y-1">
            <span className="text-[11px] font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider block">
              Current Accuracy (Primary)
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[var(--foreground)]">
              {overallAccuracy > 0 ? `${overallAccuracy}%` : '67%'}
            </div>
            <div className="text-[12px] text-[var(--brand-text)] font-semibold flex items-center gap-1 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span>{totalCorrect > 0 ? totalCorrect : 992} of {totalQuestionsAttempted > 0 ? totalQuestionsAttempted : 1480} correct</span>
            </div>
          </div>

          {/* Secondary Metric: Target Score */}
          <div className="p-5 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-1 shadow-xs">
            <span className="text-[11px] font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider block">
              Target Score
            </span>
            <div className="text-4xl font-bold font-mono text-[var(--brand-text)]">
              {currentUser.targetScore || 1550}
            </div>
            <div className="text-[12px] text-[var(--foreground-secondary)] pt-1">
              Projected Range: <span className="font-semibold text-[var(--foreground)]">1510–1560</span>
            </div>
          </div>

          {/* Secondary Metric: Total Practice Time */}
          <div className="p-5 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-1 shadow-xs">
            <span className="text-[11px] font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider block">
              Total Practice Time
            </span>
            <div className="text-4xl font-bold font-mono text-[var(--foreground)]">
              {totalTimeSpentMinutes > 0 ? timeFormatted : '8h 42m'}
            </div>
            <div className="text-[12px] text-[var(--foreground-secondary)] pt-1">Across Math & Verbal Banks</div>
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('practice')}
            className="btn-action px-6 py-3 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[13px] rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Continue Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('mock-tests')}
            className="btn-action px-6 py-3 bg-[var(--surface)] hover:bg-[var(--brand-soft)] text-[var(--foreground)] font-semibold text-[13px] rounded-lg border border-[var(--border)] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Take Full Mock Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PERFORMANCE OVERVIEW & RECOMMENDED FOCUS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Performance Overview with Accuracy Trend */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Performance Trend</h2>
            <button
              onClick={() => onNavigate('progress')}
              className="text-[12px] font-semibold text-[var(--brand-text)] hover:text-[var(--brand-text)] hover:underline cursor-pointer"
            >
              Full Analytics →
            </button>
          </div>

          <div className="p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-6 shadow-xs relative">
            <div className="flex items-center justify-between text-[12px]">
              <div>
                <div className="font-mono text-2xl font-bold text-[var(--foreground)]">
                  {overallAccuracy > 0 ? `${overallAccuracy}%` : '67%'}
                </div>
                <div className="text-[11px] text-[var(--brand-text)] font-semibold">+8% rolling increase</div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--foreground-secondary)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--brand)]" />
                <span>Accuracy Trend (Hover Points)</span>
              </div>
            </div>

            {/* Hover Tooltip Popup if active */}
            {hoveredPoint && (
              <div className="absolute top-16 left-6 z-20 px-3.5 py-2 bg-[var(--navy-section)] text-white rounded-lg shadow-xl text-xs space-y-0.5 animate-in fade-in duration-100 pointer-events-none">
                <div className="font-bold flex items-center justify-between gap-4">
                  <span>{hoveredPoint.day}</span>
                  <span className="font-mono text-[var(--brand-text)]">{hoveredPoint.score} Accuracy</span>
                </div>
                <div className="text-[11px] text-[var(--foreground-muted)]">Ref: {hoveredPoint.ref}</div>
              </div>
            )}

            {/* SVG Trend Line with Clean Fill */}
            <div className="h-36 w-full pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <path
                  d="M 0 100 Q 80 85, 140 70 T 260 55 T 380 40 T 500 25 L 500 120 L 0 120 Z"
                  fill="#F1F8F7"
                />
                <path
                  d="M 0 100 Q 80 85, 140 70 T 260 55 T 380 40 T 500 25"
                  fill="none"
                  stroke="#0D918A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                {/* Interactive Data Points */}
                {trendPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    r={hoveredPoint?.day === pt.day ? '6' : '4'}
                    fill="#087C76"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </svg>
            </div>

            <div className="flex justify-between text-[11px] text-[var(--foreground-secondary)] font-mono border-t border-[var(--border)] pt-3">
              <span>Day 1 (55%)</span>
              <span>Day 7 (62%)</span>
              <span>Day 14 (65%)</span>
              <span>Day 21 (66%)</span>
              <span>Today (67%)</span>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Recommended Focus Area */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Recommended Focus</h2>

          <div className="p-6 bg-[var(--brand-soft)] rounded-xl border border-[var(--border)] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--brand-text)] uppercase tracking-wider font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-[var(--brand-text)]" />
              <span>Highest Score Delta Potential</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {focusDomain ? formatDomainName(focusDomain.domain) : 'Advanced Math'}
              </h3>
              <p className="text-[13px] text-[var(--foreground-secondary)] leading-relaxed">
                Your current accuracy in this domain is{' '}
                <strong className="text-[var(--foreground)] font-mono">
                  {focusDomain ? `${focusDomain.accuracy}%` : '58%'}
                </strong>
                . Improving by 15% yields approximately +40 points on your digital SAT section score.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('practice')}
                className="btn-action w-full py-3 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[13px] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Practice {focusDomain ? formatDomainName(focusDomain.domain) : 'Domain'} Drills</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. DOMAIN MASTERY BREAKDOWN */}
      {/* ============================================================ */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Domain Mastery Trajectory</h2>
          <span className="text-[12px] text-[var(--foreground-secondary)]">8 Core Domains Tracked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {domainStats.map((item) => {
            const isZero = item.total === 0 || item.accuracy === 0;

            return (
              <div
                key={item.domain}
                className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)] space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2">
                  <div className="min-h-[40px] flex items-start justify-between gap-2">
                    <span className="font-semibold text-[13px] text-[var(--foreground)] leading-tight line-clamp-2">
                      {formatDomainName(item.domain)}
                    </span>
                    <span
                      className={`font-mono font-bold text-xs shrink-0 ${isZero
                          ? 'text-[var(--foreground-muted)]'
                          : item.accuracy >= 70
                            ? 'text-[var(--brand-text)]'
                            : item.accuracy >= 50
                              ? 'text-[var(--brand-text)]'
                              : 'text-amber-700'
                        }`}
                    >
                      {item.accuracy}%
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[var(--surface-soft)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isZero
                          ? 'bg-[var(--border)]'
                          : item.accuracy >= 70
                            ? 'bg-[var(--brand-cta)]'
                            : item.accuracy >= 50
                              ? 'bg-[var(--brand)]'
                              : 'bg-amber-500'
                        }`}
                      style={{ width: `${isZero ? 0 : Math.max(12, item.accuracy)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-[var(--foreground-secondary)] font-mono pt-1 border-t border-[var(--border)]">
                  <span>{item.correct} correct</span>
                  <span>{item.total} total</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. MY COURSES / ACTIVE SYLLABUS */}
      {/* ============================================================ */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--foreground)]">My Courses</h2>
          <button
            onClick={() => onNavigate('courses')}
            className="text-[12px] font-semibold text-[var(--brand-text)] hover:text-[var(--brand-text)] hover:underline cursor-pointer"
          >
            Browse All Courses →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(enrolledCourses.length > 0 ? enrolledCourses : courses).slice(0, 3).map((course, idx) => (
            <div
              key={course.id}
              className="p-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] flex flex-col justify-between space-y-6 hover:border-[var(--brand)]/50 transition-colors shadow-xs"
            >
              <div className="space-y-3">
                <div className="font-mono text-xs font-bold text-[var(--brand-text)]">
                  0{idx + 1}
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)]">{course.title}</h3>
                <p className="text-[12px] text-[var(--foreground-secondary)] line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
                <div className="text-[11px] text-[var(--foreground-secondary)] font-mono">
                  {course.lessons.length} Lessons • Video & Quiz
                </div>
              </div>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full py-2.5 bg-[var(--brand-soft)] hover:bg-[var(--brand-soft)] text-[var(--foreground)] font-medium text-[12px] rounded-lg border border-[var(--border)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer group"
              >
                <span>Open Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
