import React from 'react';
import {
  CreditCard,
  Sparkles,
  Users,
  Database,
  BookOpen,
  FileText,
  Award,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { PaymentSubmission, UserProfile, Course, ResourceItem, MockTest, Question } from '../../../types';
import { AdminSubPage } from '../components/AdminSidebar';

interface OverviewViewProps {
  payments: PaymentSubmission[];
  users: UserProfile[];
  courses: Course[];
  resources: ResourceItem[];
  mockTests: MockTest[];
  questions: Question[];
  onNavigateSubPage: (page: AdminSubPage) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  payments,
  users,
  courses,
  resources,
  mockTests,
  questions,
  onNavigateSubPage,
}) => {
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const totalVerifiedRevenue = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-10">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0D918A] to-[#087C76] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-teal-100 font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>SAT Supervisor Console</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Platform Performance & CMS Overview</h2>
          <p className="text-xs text-teal-100/90 max-w-xl leading-relaxed">
            Monitor real-time candidate registrations, manual bKash/Nagad payment verification queues, course curriculum modules, and question bank assets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateSubPage('payments')}
            className="px-4 py-2.5 bg-white text-[#0D918A] hover:bg-teal-50 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Verification Queue ({pendingPayments.length})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateSubPage('payments')}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Pending Verification</div>
            <div className="text-3xl font-black text-slate-900 font-mono">{pendingPayments.length}</div>
            <div className="text-[11px] text-amber-600 font-medium">bKash / Nagad queue</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-between group">
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Verified Revenue</div>
            <div className="text-3xl font-black text-slate-900 font-mono">৳{totalVerifiedRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Approved transfers</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateSubPage('candidates')}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Active Candidates</div>
            <div className="text-3xl font-black text-slate-900 font-mono">{users.length}</div>
            <div className="text-[11px] text-[#0D918A] font-medium">Registered accounts</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#0D918A]/10 text-[#0D918A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateSubPage('questions')}
          className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="text-xs text-slate-500 font-semibold">Question Bank Size</div>
            <div className="text-3xl font-black text-slate-900 font-mono">{questions.length}</div>
            <div className="text-[11px] text-indigo-600 font-medium">KaTeX formatted</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Database className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main CMS Content Grid - Spacious Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Courses Card */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0D918A]/10 text-[#0D918A] flex items-center justify-center font-bold">
                  <BookOpen className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Course Catalog</h3>
                  <p className="text-xs text-slate-500">{courses.length} Active Courses</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateSubPage('courses')}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Manage Courses"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {courses.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onNavigateSubPage('courses')}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-teal-50/40 border border-slate-100 hover:border-teal-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate group-hover:text-[#0D918A] transition-colors">
                      {c.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {c.lessonsCount} lessons • {c.totalHours} hrs
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-[#0D918A] shrink-0">
                    ৳{c.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateSubPage('courses')}
            className="w-full py-2.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-[#0D918A] font-bold text-xs rounded-xl border border-slate-200/80 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Manage All Courses</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Resources Card */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Study Resources</h3>
                  <p className="text-xs text-slate-500">{resources.length} Guides & Sheets</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateSubPage('resources')}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Manage Resources"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {resources.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onNavigateSubPage('resources')}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {r.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {r.readTime} • {r.category.replace('_', ' ')}
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                      r.is_free ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    {r.is_free ? 'Free' : 'Premium'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateSubPage('resources')}
            className="w-full py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Manage All Resources</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Digital SAT Mocks Card */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  <Award className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Digital SAT Mocks</h3>
                  <p className="text-xs text-slate-500">{mockTests.length} Official Mocks</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateSubPage('mock-tests')}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-xl transition-colors cursor-pointer"
                title="Manage Mock Tests"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {mockTests.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onNavigateSubPage('mock-tests')}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-rose-50/40 border border-slate-100 hover:border-rose-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate group-hover:text-rose-700 transition-colors">
                      {m.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {m.totalQuestions} Questions • {m.totalTimeMinutes} mins
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold uppercase shrink-0">
                    {m.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateSubPage('mock-tests')}
            className="w-full py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl border border-slate-200/80 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Manage Mock Tests</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
