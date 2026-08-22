import React, { useState } from 'react';
import {
  Target,
  Award,
  CheckCircle2,
  XCircle,
  Download,
  BarChart2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  Check
} from 'lucide-react';
import { PracticeAttempt, MockTestAttempt, Domain, UserProfile } from '../../types';
import { formatDomainName } from '../../lib/utils';
import { NavView } from '../../components/Navbar';

interface ProgressAnalyticsProps {
  currentUser: UserProfile | null;
  practiceAttempts: PracticeAttempt[];
  mockAttempts: MockTestAttempt[];
  domainStats: { domain: Domain; correct: number; total: number; accuracy: number }[];
  overallAccuracy: number;
  totalTimeSpentMinutes: number;
  onNavigate?: (view: NavView) => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  currentUser,
  practiceAttempts,
  mockAttempts,
  domainStats,
  overallAccuracy,
  onNavigate,
}) => {
  const [historyFilter, setHistoryFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const filteredHistory = practiceAttempts.filter((att) => {
    if (historyFilter === 'correct') return att.isCorrect;
    if (historyFilter === 'incorrect') return !att.isCorrect;
    return true;
  });

  // Calculate estimated SAT score from practice accuracy
  const mathStats = domainStats.filter((d) =>
    ['algebra', 'advanced_math', 'problem_solving_data_analysis', 'geometry_trigonometry'].includes(d.domain)
  );
  const mathTotal = mathStats.reduce((acc, d) => acc + d.total, 0);
  const mathCorrect = mathStats.reduce((acc, d) => acc + d.correct, 0);
  const mathAcc = mathTotal > 0 ? mathCorrect / mathTotal : 0.8;
  const estimatedMath = Math.round(200 + mathAcc * 600);

  const rwStats = domainStats.filter((d) =>
    ['information_ideas', 'craft_structure', 'expression_ideas', 'standard_english_conventions'].includes(d.domain)
  );
  const rwTotal = rwStats.reduce((acc, d) => acc + d.total, 0);
  const rwCorrect = rwStats.reduce((acc, d) => acc + d.correct, 0);
  const rwAcc = rwTotal > 0 ? rwCorrect / rwTotal : 0.75;
  const estimatedRW = Math.round(200 + rwAcc * 600);

  const estimatedTotal = Math.min(1600, Math.max(400, Math.round((estimatedMath + estimatedRW) / 10) * 10));
  const targetScore = currentUser?.targetScore || 1550;
  const pointsToTarget = Math.max(0, targetScore - estimatedTotal);

  // Sorted domain stats for Mastery & Insights
  const sortedDomains = [...domainStats].sort((a, b) => b.accuracy - a.accuracy);
  const strongestDomains = sortedDomains.filter((d) => d.accuracy >= 70 && d.total > 0).slice(0, 2);
  const weakestDomains = [...domainStats].sort((a, b) => a.accuracy - b.accuracy).filter((d) => d.total > 0).slice(0, 2);
  const weakestDomain = [...domainStats].sort((a, b) => a.accuracy - b.accuracy)[0];

  const getStatusInfo = (accuracy: number, total: number) => {
    if (total === 0) return { label: 'Not Started', color: 'text-slate-500 bg-slate-100 border-slate-200', bar: 'bg-slate-300' };
    if (accuracy >= 90) return { label: 'Mastered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-[#08A86A]' };
    if (accuracy >= 70) return { label: 'Strong', color: 'text-[#087C76] bg-[#F1F8F7] border-teal-200', bar: 'bg-[#087C76]' };
    if (accuracy >= 50) return { label: 'Proficient', color: 'text-[#0D918A] bg-[#F1F8F7]/70 border-teal-100', bar: 'bg-[#0D918A]' };
    return { label: 'Needs Practice', color: 'text-amber-700 bg-amber-50 border-amber-200', bar: 'bg-amber-500' };
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E3E8F0]">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0D918A] font-mono">
            Analytics & Intelligence
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#071126]">
            Progress & Mastery
          </h1>
          <p className="text-[14px] text-[#58708A] max-w-2xl leading-[1.6]">
            Domain accuracy breakdown, drill timings, and projected Digital SAT score calibration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-[#E3E8F0] text-[#071126] font-semibold text-[13px] rounded-[10px] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-[#58708A]" />
            <span>Export Score Report</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Performance Area (Dominant Score Panel + 3 Metrics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dominant Score Panel */}
        <div className="lg:col-span-5 p-7 sm:p-8 rounded-[16px] bg-[#080D21] text-white flex flex-col justify-between space-y-6 shadow-[0_10px_30px_rgba(8,13,33,0.18)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0A8F88] uppercase tracking-widest font-mono">
              Projected SAT Score
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-white/10 text-white text-[11px] font-mono font-semibold border border-white/20">
              <Sparkles className="w-3 h-3 text-[#0A8F88]" />
              <span>SAT Scale</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-extrabold font-mono tracking-tight text-white">
                {estimatedTotal}
              </span>
              <span className="text-lg font-mono text-slate-400">/ 1600</span>
            </div>
            <div className="text-[12px] text-slate-300 flex items-center gap-2 pt-1">
              <span>Target Score:</span>
              <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded-[4px]">{targetScore}</strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-[12px]">
            <div className="bg-slate-900/60 p-3 rounded-[10px] border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Mathematics</span>
              <div className="text-[16px] font-bold text-white font-mono mt-0.5">{estimatedMath} <span className="text-xs text-slate-500 font-normal">/800</span></div>
            </div>
            <div className="bg-slate-900/60 p-3 rounded-[10px] border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Reading & Writing</span>
              <div className="text-[16px] font-bold text-white font-mono mt-0.5">{estimatedRW} <span className="text-xs text-slate-500 font-normal">/800</span></div>
            </div>
          </div>
        </div>

        {/* 3 Compact Metrics */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
          <div className="p-6 rounded-[16px] bg-white border border-[#E3E8F0] shadow-[0_4px_18px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#58708A]">Overall Accuracy</span>
              <div className="w-9 h-9 rounded-[10px] bg-[#F1F8F7] text-[#087C76] flex items-center justify-center border border-teal-100">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#071126] font-mono">{overallAccuracy}%</div>
              <div className="text-[12px] text-[#58708A] mt-1">Across all practice questions</div>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Calibrated from active logs</span>
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-white border border-[#E3E8F0] shadow-[0_4px_18px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#58708A]">Drills Completed</span>
              <div className="w-9 h-9 rounded-[10px] bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#071126] font-mono">{practiceAttempts.length}</div>
              <div className="text-[12px] text-[#58708A] mt-1">Recorded responses</div>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] text-[#087C76] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Active problem solving</span>
            </div>
          </div>

          <div className="p-6 rounded-[16px] bg-white border border-[#E3E8F0] shadow-[0_4px_18px_rgba(15,23,42,0.03)] flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-wider text-[#58708A]">Mock Tests</span>
              <div className="w-9 h-9 rounded-[10px] bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-[#071126] font-mono">{mockAttempts.length}</div>
              <div className="text-[12px] text-[#58708A] mt-1">Full test sessions</div>
            </div>
            <div className="pt-2 border-t border-[#F1F5F9] text-[11px] text-[#58708A] font-semibold flex items-center gap-1">
              <span>Simulated exam environment</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Score Progress Visual */}
      <div className="p-7 sm:p-8 rounded-[16px] bg-white border border-[#E3E8F0] shadow-[0_4px_18px_rgba(15,23,42,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold text-[#071126] uppercase tracking-wider">Score Progression to Target</h3>
            <p className="text-[13px] text-[#58708A] mt-0.5">Tracking your pathway from current calibration to target benchmark.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-[10px] bg-[#F1F8F7] text-[#087C76] font-mono text-[13px] font-bold border border-teal-100">
              +{pointsToTarget} points to target
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-[13px] font-semibold text-[#071126] font-mono">
            <span>Current: {estimatedTotal}</span>
            <span>Target: {targetScore}</span>
          </div>

          <div className="relative w-full h-3 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-[#087C76] transition-all duration-600"
              style={{ width: `${Math.min(100, Math.max(5, ((estimatedTotal - 400) / (targetScore - 400)) * 100))}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-[#58708A] font-mono">
            <span>400 (Baseline)</span>
            <span>1600 (Max)</span>
          </div>
        </div>
      </div>

      {/* 4. Domain Mastery & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Domain Mastery Matrix (8 domains) */}
        <div className="lg:col-span-8 bg-white rounded-[16px] border border-[#E3E8F0] p-7 sm:p-8 space-y-6 shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
          <div>
            <h3 className="text-[17px] font-bold text-[#071126]">Domain Mastery</h3>
            <p className="text-[13px] text-[#58708A] mt-0.5">
              Your strongest and weakest areas across all 8 Digital SAT domains based on practice performance.
            </p>
          </div>

          <div className="space-y-4">
            {sortedDomains.map((dom, index) => {
              const status = getStatusInfo(dom.accuracy, dom.total);
              return (
                <div
                  key={dom.domain}
                  className="p-4 rounded-[12px] bg-[#F8FAFC] border border-[#E3E8F0] hover:border-teal-200 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-bold text-[#58708A] w-6">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-[#071126] text-[14px]">
                        {formatDomainName(dom.domain)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-bold border ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="font-mono font-bold text-[#071126] text-[13px] w-12 text-right">
                        {dom.total > 0 ? `${dom.accuracy}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${status.bar}`}
                        style={{ width: `${Math.max(4, dom.accuracy)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[#58708A] font-mono shrink-0">
                      {dom.correct} / {dom.total} correct
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strongest & Weakest Insights Side Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[16px] border border-[#E3E8F0] p-6 space-y-5 shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#071126]">Strongest Areas</h4>
            {strongestDomains.length === 0 ? (
              <p className="text-[12px] text-[#58708A]">Complete more practice drills to identify strong domains.</p>
            ) : (
              <div className="space-y-3">
                {strongestDomains.map((dom) => (
                  <div key={dom.domain} className="flex items-center justify-between p-3 rounded-[10px] bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-semibold text-emerald-950">{formatDomainName(dom.domain)}</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold text-[12px]">{dom.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[16px] border border-[#E3E8F0] p-6 space-y-5 shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#071126]">Needs Attention</h4>
            {weakestDomains.length === 0 ? (
              <p className="text-[12px] text-[#58708A]">No critical weaknesses detected yet.</p>
            ) : (
              <div className="space-y-3">
                {weakestDomains.map((dom) => (
                  <div key={dom.domain} className="flex items-center justify-between p-3 rounded-[10px] bg-amber-50/60 border border-amber-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[13px] font-semibold text-amber-950">{formatDomainName(dom.domain)}</span>
                    </div>
                    <span className="font-mono text-amber-700 font-bold text-[12px]">{dom.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Actionable Recommendation (Next Best Action) */}
      <div className="p-7 sm:p-8 rounded-[16px] bg-[#F1F8F7] border border-teal-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#087C76] text-white text-[11px] font-bold uppercase tracking-wider font-mono">
            Next Best Action
          </div>
          <h3 className="text-xl font-bold text-[#071126]">
            Focus on {weakestDomain ? formatDomainName(weakestDomain.domain) : 'Core SAT Domains'}
          </h3>
          <p className="text-[14px] text-[#58708A] leading-[1.6]">
            Your current performance indicates this domain needs more targeted practice before your next full digital mock simulation.
          </p>
        </div>

        <button
          onClick={() => onNavigate && onNavigate('practice')}
          className="px-6 py-3 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[13.5px] rounded-[10px] transition-colors shadow-xs cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span>Practice This Domain</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6. Recent Practice History */}
      <div className="bg-white rounded-[16px] border border-[#E3E8F0] p-7 sm:p-8 space-y-6 shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[17px] font-bold text-[#071126]">Recent Practice History</h3>
            <p className="text-[13px] text-[#58708A] mt-0.5">Detailed drill logs and response timings.</p>
          </div>

          <div className="flex rounded-[10px] bg-[#F8FAFC] p-1 text-[12px] font-medium border border-[#E3E8F0]">
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-3.5 py-1.5 rounded-[8px] transition-all cursor-pointer ${historyFilter === 'all' ? 'bg-white text-[#071126] font-semibold shadow-2xs' : 'text-[#58708A]'
                }`}
            >
              All ({practiceAttempts.length})
            </button>
            <button
              onClick={() => setHistoryFilter('correct')}
              className={`px-3.5 py-1.5 rounded-[8px] transition-all cursor-pointer ${historyFilter === 'correct' ? 'bg-white text-emerald-700 font-semibold shadow-2xs' : 'text-[#58708A]'
                }`}
            >
              Correct
            </button>
            <button
              onClick={() => setHistoryFilter('incorrect')}
              className={`px-3.5 py-1.5 rounded-[8px] transition-all cursor-pointer ${historyFilter === 'incorrect' ? 'bg-white text-rose-700 font-semibold shadow-2xs' : 'text-[#58708A]'
                }`}
            >
              Incorrect
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-[#58708A] bg-[#F8FAFC] rounded-[12px] border border-dashed border-[#E3E8F0]">
            No practice logs recorded for this filter. Start solving practice questions to build your analytics profile.
          </div>
        ) : (
          <div className="divide-y divide-[#E3E8F0] overflow-x-auto">
            <div className="py-2.5 grid grid-cols-6 text-[11px] font-bold uppercase tracking-wider text-[#58708A] px-3 font-mono">
              <span className="col-span-2">Activity / Question</span>
              <span>Result</span>
              <span>Selected Option</span>
              <span>Time Spent</span>
              <span className="text-right">Date</span>
            </div>
            {filteredHistory.slice(0, 15).map((att) => (
              <div key={att.id} className="py-3.5 grid grid-cols-6 items-center px-3 text-[13px] hover:bg-[#F8FAFC] transition-colors rounded-[8px]">
                <div className="col-span-2 flex items-center gap-3">
                  {att.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span className="font-semibold text-[#071126] font-mono">Question #{att.questionId}</span>
                </div>
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded-[6px] text-[11px] font-semibold ${att.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {att.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="font-mono text-[#071126] font-medium">Option {att.selectedAnswer}</div>
                <div className="font-mono text-[#58708A]">{att.timeSpentSeconds}s</div>
                <div className="font-mono text-[#58708A] text-right">{new Date(att.timestamp).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Mock Test Performance */}
      <div className="bg-white rounded-[16px] border border-[#E3E8F0] p-7 sm:p-8 space-y-6 shadow-[0_4px_18px_rgba(15,23,42,0.03)]">
        <div>
          <h3 className="text-[17px] font-bold text-[#071126]">Mock Test Performance History</h3>
          <p className="text-[13px] text-[#58708A] mt-0.5">Full-length Digital SAT simulated exam results.</p>
        </div>

        {mockAttempts.length === 0 ? (
          <div className="p-12 text-center text-[13px] text-[#58708A] bg-[#F8FAFC] rounded-[12px] border border-dashed border-[#E3E8F0]">
            No mock test attempts recorded yet. Take a full-length mock simulation to see your progress graph.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {mockAttempts.map((mock, idx) => (
              <div key={mock.id} className="p-5 rounded-[12px] bg-[#F8FAFC] border border-[#E3E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#087C76]">
                    Test #{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-[#58708A]">
                    {new Date(mock.startedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-[#071126] font-mono">
                    {mock.scoreSummary?.totalScoreEstimated || 1150}
                  </div>
                  <div className="text-[12px] text-[#58708A] mt-1">Status: <strong className="text-[#071126] uppercase">{mock.status}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
