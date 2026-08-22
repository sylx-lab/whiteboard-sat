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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Pending Verification</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{pendingPayments.length}</div>
            <div className="text-[11px] text-slate-400">bKash / Nagad queue</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Verified Revenue</div>
            <div className="text-2xl font-black text-slate-900 font-mono">৳{totalVerifiedRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Approved transfers</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#0D918A] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Active Candidates</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{users.length}</div>
            <div className="text-[11px] text-slate-400">Registered accounts</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Question Bank Size</div>
            <div className="text-2xl font-black text-slate-900 font-mono">{questions.length}</div>
            <div className="text-[11px] text-slate-400">KaTeX formatted</div>
          </div>
        </div>
      </div>

      {/* Distribution Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Courses Overview Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0D918A] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Course Catalog</h3>
                <p className="text-[11px] text-slate-500">{courses.length} Active Courses</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateSubPage('courses')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {courses.map((c) => (
              <div key={c.id} className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <div className="text-[11px] text-slate-500">{c.lessonsCount} lessons • {c.totalHours} hrs</div>
                </div>
                <span className="font-mono font-extrabold text-[#0D918A]">৳{c.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resources Overview Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Study Resources</h3>
                <p className="text-[11px] text-slate-500">{resources.length} Materials</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateSubPage('resources')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {resources.map((r) => (
              <div key={r.id} className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{r.title}</div>
                  <div className="text-[11px] text-slate-500">{r.readTime} • {r.category}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.is_free ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                  {r.is_free ? 'Free' : 'Premium'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mock Tests Overview Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Digital SAT Mocks</h3>
                <p className="text-[11px] text-slate-500">{mockTests.length} Official Mocks</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateSubPage('mock-tests')}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {mockTests.map((m) => (
              <div key={m.id} className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{m.title}</div>
                  <div className="text-[11px] text-slate-500">{m.totalQuestions} Questions • {m.totalTimeMinutes} mins</div>
                </div>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[10px] font-bold uppercase">
                  {m.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
