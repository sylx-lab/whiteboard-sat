import React, { useState } from 'react';
import {
  Shield,
  CreditCard,
  Users,
  Database,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  PaymentSubmission,
  UserProfile,
  Question,
  Subject,
  Domain,
  Difficulty,
  ProductPlan,
} from '../../types';
import { formatDomainName } from '../../lib/utils';
import { MathRenderer } from '../../components/MathRenderer';

interface AdminPanelProps {
  currentUser: UserProfile | null;
  payments: PaymentSubmission[];
  users: UserProfile[];
  questions: Question[];
  plans: ProductPlan[];
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
  onAddQuestion: (question: Question) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  payments,
  users,
  questions,
  plans: _plans,
  onVerifyPayment,
  onRejectPayment,
  onUpdateUserAccess,
  onToggleUserStatus,
  onAddQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'questions'>('payments');

  // Search & Filters
  const [paymentSearch, setPaymentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');

  // Add Question Form State
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [newCode, setNewCode] = useState('M-ALG-999');
  const [newSubject, setNewSubject] = useState<Subject>('math');
  const [newDomain, setNewDomain] = useState<Domain>('algebra');
  const [newTopic, setNewTopic] = useState('Linear Equations');
  const [newSubtopic, setNewSubtopic] = useState('Solving Systems');
  const [newDifficulty, setNewDifficulty] = useState<Difficulty>('medium');
  const [newIsFree, setNewIsFree] = useState(true);
  const [newQuestionText, setNewQuestionText] = useState('If $$3x - 7 = 14$$, what is the value of $$x$$?');
  const [choiceA, setChoiceA] = useState('$$x = 5$$');
  const [choiceB, setChoiceB] = useState('$$x = 7$$');
  const [choiceC, setChoiceC] = useState('$$x = 8$$');
  const [choiceD, setChoiceD] = useState('$$x = 10$$');
  const [correctChoice, setCorrectChoice] = useState<'A' | 'B' | 'C' | 'D'>('B');
  const [explanation, setExplanation] = useState(
    'Add 7 to both sides: $$3x = 21$$. Divide by 3: $$x = 7$$. Thus Choice B is correct.'
  );

  // Security Check: If not admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Supervisor Access Only</h2>
        <p className="text-xs text-slate-500">
          You are currently signed in as a student profile. Switch to the Demo Admin account in the top-right menu to manage payments, users, and questions.
        </p>
      </div>
    );
  }

  // Summary Metrics
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalVerifiedRevenue = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleCreateQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Question = {
      id: `q-${Date.now()}`,
      code: newCode.trim(),
      subject: newSubject,
      section: newSubject === 'math' ? 'Math' : 'Reading & Writing',
      domain: newDomain,
      topic: newTopic.trim(),
      subtopic: newSubtopic.trim(),
      source: 'White Board Official Bank 2026',
      difficulty: newDifficulty,
      is_free: newIsFree,
      question_text: newQuestionText.trim(),
      choices: [
        { id: 'A', text: choiceA.trim() },
        { id: 'B', text: choiceB.trim() },
        { id: 'C', text: choiceC.trim() },
        { id: 'D', text: choiceD.trim() },
      ],
      answer_choices: [
        { id: 'A', text: choiceA.trim() },
        { id: 'B', text: choiceB.trim() },
        { id: 'C', text: choiceC.trim() },
        { id: 'D', text: choiceD.trim() },
      ],
      correct_answer: correctChoice,
      explanation: explanation.trim(),
      status: 'published',
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    };

    onAddQuestion(created);
    setIsAddQuestionOpen(false);
    // Reset defaults
    setNewCode(`M-ALG-${Date.now().toString().slice(-3)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-700">Platform Control Hub</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Admin Supervisor Console
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'payments' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            <span>Manual Payments ({pendingPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Users className="w-4 h-4 text-purple-600" />
            <span>Candidate Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'questions' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Database className="w-4 h-4 text-purple-600" />
            <span>Question Bank ({questions.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Pending Verifications</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{pendingPayments.length}</div>
            <div className="text-[11px] text-slate-400">bKash / Nagad queue</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Total Verified Revenue</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">৳{totalVerifiedRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-400">Manual transfers</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Registered Students</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{users.length}</div>
            <div className="text-[11px] text-slate-400">Active accounts</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">Active Questions</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">{questions.length}</div>
            <div className="text-[11px] text-slate-400">KaTeX formatted</div>
          </div>
        </div>
      </div>

      {/* --- TAB 1: MANUAL PAYMENT VERIFICATION QUEUE --- */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Manual Payment Verification Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted bKash, Nagad, and Bank Transfer transaction IDs to activate student passes.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search reference or phone..."
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Candidate / Phone</th>
                  <th className="py-3 px-4">Plan / Product</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Channel & Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments
                  .filter((p) => {
                    if (!paymentSearch.trim()) return true;
                    const q = paymentSearch.toLowerCase();
                    return (
                      p.referenceNumber.toLowerCase().includes(q) ||
                      p.senderPhoneNumber.toLowerCase().includes(q) ||
                      p.userName.toLowerCase().includes(q)
                    );
                  })
                  .map((payment, index) => (
                    <tr key={payment.id} className={index % 2 === 1 ? 'bg-slate-50/50 hover:bg-slate-100/50' : 'hover:bg-slate-50/50'}>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{payment.userName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{payment.senderPhoneNumber}</div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {payment.productTitle}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900">
                        ৳{payment.amount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700">{payment.paymentMethod}</div>
                        <div className="font-mono text-teal-600 font-bold text-[11px]">
                          Ref: {payment.referenceNumber}
                        </div>
                        {payment.notes && (
                          <div className="text-[10px] text-slate-400 italic">{payment.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${payment.status === 'verified'
                              ? 'bg-[#D1FAE5] text-[#065F46]'
                              : payment.status === 'pending'
                                ? 'bg-[#FEF3C7] text-[#92400E] animate-pulse'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {(payment.status || 'pending').toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {payment.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onVerifyPayment(payment.id)}
                              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 text-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => onRejectPayment(payment.id)}
                              className="h-8 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold rounded-lg border border-slate-200 transition-colors text-xs cursor-pointer"
                              title="Reject payment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Processed ({new Date(payment.createdAt || payment.submittedAt).toLocaleDateString()})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: CANDIDATE ACCOUNTS & PERMISSION GRANTS --- */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Registered Candidates & Grant Controls
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Grant or revoke full master passes, math passes, or specific course access manually.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search candidate name or phone..."
                className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-3 px-4">Student Profile</th>
                  <th className="py-3 px-4">Phone / Account</th>
                  <th className="py-3 px-4">Target Score</th>
                  <th className="py-3 px-4">Access Privileges</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Manual Grant / Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter((u) => {
                    if (!userSearch.trim()) return true;
                    const q = userSearch.toLowerCase();
                    return u.name.toLowerCase().includes(q) || u.phone.toLowerCase().includes(q);
                  })
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.role === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-extrabold rounded">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email || 'No email specified'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">{u.phone}</td>

                      <td className="py-3.5 px-4 font-mono font-bold text-teal-600">{u.targetScore}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {u.access.fullPremium && (
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-bold text-[10px] rounded">
                              Full Pass
                            </span>
                          )}
                          {u.access.premiumMath && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                              Math Pass
                            </span>
                          )}
                          {u.access.premiumReadingWriting && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded">
                              Verbal Pass
                            </span>
                          )}
                          {!u.access.fullPremium &&
                            !u.access.premiumMath &&
                            !u.access.premiumReadingWriting && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                                Free Starter
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onToggleUserStatus(u.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                            }`}
                        >
                          {(u.status || 'active').toUpperCase()}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              onUpdateUserAccess(u.id, { fullPremium: !u.access.fullPremium })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${u.access.fullPremium
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                : 'bg-teal-600 text-white hover:bg-teal-700'
                              }`}
                          >
                            {u.access.fullPremium ? 'Revoke Pass' : 'Grant Full Pass'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: QUESTION BANK MANAGEMENT --- */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                Question Bank Management
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, inspect, and organize 10,000+ domain questions with LaTeX KaTeX support.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  placeholder="Search code or text..."
                  className="pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setIsAddQuestionOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {questions
              .filter((q) => {
                if (!questionSearch.trim()) return true;
                const match = questionSearch.toLowerCase();
                return (
                  q.code.toLowerCase().includes(match) ||
                  q.topic.toLowerCase().includes(match) ||
                  q.question_text.toLowerCase().includes(match)
                );
              })
              .map((q) => (
                <div key={q.id} className="py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {q.code}
                      </span>
                      <span className="font-semibold text-purple-700">{formatDomainName(q.domain)}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">{q.topic}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded uppercase">
                        {q.difficulty}
                      </span>
                      {q.is_free ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded">
                          Free
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-800">
                    <MathRenderer content={q.question_text} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                    {(q.choices || q.answer_choices || []).map((c) => (
                      <div
                        key={c.id}
                        className={`p-2 rounded-lg border ${c.id === q.correct_answer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                      >
                        <span className="font-bold mr-1">{c.id}.</span>
                        <MathRenderer content={c.text} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- ADD NEW QUESTION MODAL --- */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New SAT Question</h3>
              <button
                onClick={() => setIsAddQuestionOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestionSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Question Code</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => {
                      const subj = e.target.value as Subject;
                      setNewSubject(subj);
                      setNewDomain(subj === 'math' ? 'algebra' : 'information_ideas');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="math">Math</option>
                    <option value="reading_writing">Reading & Writing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtopic</label>
                  <input
                    type="text"
                    required
                    value={newSubtopic}
                    onChange={(e) => setNewSubtopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Domain</label>
                  <select
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value as Domain)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {newSubject === 'math' ? (
                      <>
                        <option value="algebra">Algebra</option>
                        <option value="advanced_math">Advanced Math</option>
                        <option value="problem_solving_data_analysis">Problem-Solving</option>
                        <option value="geometry_trigonometry">Geometry & Trig</option>
                      </>
                    ) : (
                      <>
                        <option value="information_ideas">Information & Ideas</option>
                        <option value="craft_structure">Craft & Structure</option>
                        <option value="expression_ideas">Expression of Ideas</option>
                        <option value="standard_english_conventions">English Conventions</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Access Tier</label>
                  <select
                    value={newIsFree ? 'free' : 'premium'}
                    onChange={(e) => setNewIsFree(e.target.value === 'free')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="free">Free Question</option>
                    <option value="premium">Premium Pass Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Question Text (LaTeX $$ supported)
                </label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choice A</label>
                  <input
                    type="text"
                    required
                    value={choiceA}
                    onChange={(e) => setChoiceA(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choice B</label>
                  <input
                    type="text"
                    required
                    value={choiceB}
                    onChange={(e) => setChoiceB(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choice C</label>
                  <input
                    type="text"
                    required
                    value={choiceC}
                    onChange={(e) => setChoiceC(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Choice D</label>
                  <input
                    type="text"
                    required
                    value={choiceD}
                    onChange={(e) => setChoiceD(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={correctChoice}
                    onChange={(e) => setCorrectChoice(e.target.value as 'A' | 'B' | 'C' | 'D')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold"
                  >
                    <option value="A">Choice A</option>
                    <option value="B">Choice B</option>
                    <option value="C">Choice C</option>
                    <option value="D">Choice D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Step-by-Step KaTeX Explanation</label>
                <textarea
                  rows={3}
                  required
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddQuestionOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Question to Bank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
