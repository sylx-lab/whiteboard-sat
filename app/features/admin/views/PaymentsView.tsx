'use client';

import React, { useState } from 'react';
import {
  PaymentSubmission,
  PaymentSettings,
  ProductPlan,
} from '../../../types';
import { DEFAULT_PAYMENT_SETTINGS, INITIAL_PLANS } from '../../../data/seedData';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Inbox,
  SearchX,
  CreditCard,
  Settings2,
  Tag,
  Save,
  Building2,
  Smartphone,
  Check,
} from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  FilterSelect,
  ResultCount,
  EmptyState,
  Pill,
  Button,
  IconAction,
  TableShell,
  Row,
} from '../components/ui';

interface PaymentsViewProps {
  payments: PaymentSubmission[];
  paymentSettings?: PaymentSettings;
  plans?: ProductPlan[];
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onInspectPayment: (payment: PaymentSubmission) => void;
  onUpdatePaymentSettings?: (settings: PaymentSettings) => Promise<PaymentSettings>;
  onUpdatePlan?: (plan: ProductPlan) => Promise<ProductPlan[]>;
}

type TabMode = 'queue' | 'channels' | 'plans';
type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected';

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  paymentSettings = DEFAULT_PAYMENT_SETTINGS,
  plans = INITIAL_PLANS,
  onVerifyPayment,
  onRejectPayment,
  onInspectPayment,
  onUpdatePaymentSettings,
  onUpdatePlan,
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('queue');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  // Channel settings state
  const [channels, setChannels] = useState<PaymentSettings>(paymentSettings);
  const [isSavingChannels, setIsSavingChannels] = useState(false);
  const [savedChannelsSuccess, setSavedChannelsSuccess] = useState(false);

  // Plans state
  const [editablePlans, setEditablePlans] = useState<ProductPlan[]>(plans);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [savedPlanIdSuccess, setSavedPlanIdSuccess] = useState<string | null>(null);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  const filtered = payments.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.referenceNumber.toLowerCase().includes(q) ||
      p.senderPhoneNumber.toLowerCase().includes(q) ||
      p.userName.toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
  };

  const handleSaveChannels = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePaymentSettings) return;
    setIsSavingChannels(true);
    try {
      await onUpdatePaymentSettings(channels);
      setSavedChannelsSuccess(true);
      setTimeout(() => setSavedChannelsSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving channels:', err);
    } finally {
      setIsSavingChannels(false);
    }
  };

  const handleSavePlan = async (plan: ProductPlan) => {
    if (!onUpdatePlan) return;
    setSavingPlanId(plan.id);
    try {
      await onUpdatePlan(plan);
      setSavedPlanIdSuccess(plan.id);
      setTimeout(() => setSavedPlanIdSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving plan:', err);
    } finally {
      setSavingPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subnavigation Bar */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div className="inline-flex p-1 bg-[#F8FBFB] border border-[#E2E8F0] rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-[#087C76] text-white shadow-xs'
                : 'text-[#58708A] hover:text-[#071126]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Verification Queue</span>
            {pendingCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                  activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'channels'
                ? 'bg-[#087C76] text-white shadow-xs'
                : 'text-[#58708A] hover:text-[#071126]'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Payment Channels & Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-[#087C76] text-white shadow-xs'
                : 'text-[#58708A] hover:text-[#071126]'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Pricing Plans</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'queue' && (
        <AdminCard>
          <Toolbar>
            <SearchInput
              label="Search payments"
              value={search}
              onChange={setSearch}
              placeholder="Reference, phone, or name…"
            />
            <FilterSelect<StatusFilter>
              label="Payment status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'verified', label: 'Verified' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'all', label: 'All statuses' },
              ]}
            />
            <div className="lg:ml-auto">
              <ResultCount shown={filtered.length} total={payments.length} noun="payments" />
            </div>
          </Toolbar>

          {payments.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No payments submitted yet"
              description="Manual bKash, Nagad, and bank transfer submissions from students will appear here for review."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching payments"
              description="Nothing matches the current search and status filter."
              action={{ label: 'Clear filters', onClick: clearFilters }}
            />
          ) : (
            <TableShell
              head={
                <>
                  <th>Student</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Channel &amp; reference</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </>
              }
            >
              {filtered.map((payment) => (
                <Row key={payment.id}>
                  <td>
                    <div className="font-semibold text-[#071126]">{payment.userName}</div>
                    <div className="font-mono text-[11px] text-[#58708A]">{payment.senderPhoneNumber}</div>
                  </td>

                  <td className="text-[#071126]">{payment.productTitle}</td>

                  <td className="font-mono font-semibold text-[#071126] tabular-nums">
                    ৳{payment.amount.toLocaleString()}
                  </td>

                  <td>
                    <div className="text-[#071126]">{payment.paymentMethod}</div>
                    <div className="font-mono text-[11px] text-[#087C76]">{payment.referenceNumber}</div>
                  </td>

                  <td>
                    <Pill
                      tone={
                        payment.status === 'verified'
                          ? 'success'
                          : payment.status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {payment.status || 'pending'}
                    </Pill>
                  </td>

                  <td>
                    <div className="flex items-center justify-end gap-1.5">
                      <IconAction
                        icon={Eye}
                        label={`View receipt for ${payment.userName}`}
                        onClick={() => onInspectPayment(payment)}
                      />

                      {payment.status === 'pending' && (
                        <>
                          <Button
                            variant="primary"
                            icon={CheckCircle2}
                            onClick={() => onVerifyPayment(payment.id)}
                            className="h-9 px-3"
                          >
                            Verify
                          </Button>
                          <Button
                            variant="danger"
                            icon={XCircle}
                            onClick={() => {
                              if (
                                confirm(
                                  `Reject ${payment.userName}'s ${payment.paymentMethod} payment of ৳${payment.amount.toLocaleString()}?`
                                )
                              ) {
                                onRejectPayment(payment.id);
                              }
                            }}
                            className="h-9 px-3"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </Row>
              ))}
            </TableShell>
          )}
        </AdminCard>
      )}

      {/* TAB 2: Payment Channels & Accounts Editor */}
      {activeTab === 'channels' && (
        <form onSubmit={handleSaveChannels} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* bKash Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 font-bold flex items-center justify-center text-sm border border-pink-200">
                    ৳
                  </div>
                  <div>
                    <h3 className="font-bold text-[#071126] text-[15px]">bKash Configuration</h3>
                    <p className="text-[12px] text-[#58708A]">Mobile financial service</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.bkash?.enabled ?? true}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bkash: { ...channels.bkash, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#087C76]"
                  />
                  <span className="text-[12px] font-semibold text-[#071126]">Enabled</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    bKash Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={channels.bkash?.accountNumber || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bkash: { ...channels.bkash, accountNumber: e.target.value },
                      })
                    }
                    placeholder="01712-345678"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#087C76]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Account Type
                  </label>
                  <select
                    value={channels.bkash?.accountType || 'Merchant'}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bkash: {
                          ...channels.bkash,
                          accountType: e.target.value as 'Merchant' | 'Personal' | 'Agent',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#087C76]"
                  >
                    <option value="Merchant">Merchant (Payment)</option>
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Agent">Agent (Cash Out)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Payment Instructions for Students
                  </label>
                  <textarea
                    rows={2}
                    value={channels.bkash?.instructions || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bkash: { ...channels.bkash, instructions: e.target.value },
                      })
                    }
                    placeholder="Go to bKash App -> Make Payment..."
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#087C76]"
                  />
                </div>
              </div>
            </div>

            {/* Nagad Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-sm border border-orange-200">
                    ৳
                  </div>
                  <div>
                    <h3 className="font-bold text-[#071126] text-[15px]">Nagad Configuration</h3>
                    <p className="text-[12px] text-[#58708A]">Mobile postal service</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.nagad?.enabled ?? true}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        nagad: { ...channels.nagad, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-[#087C76]"
                  />
                  <span className="text-[12px] font-semibold text-[#071126]">Enabled</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Nagad Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={channels.nagad?.accountNumber || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        nagad: { ...channels.nagad, accountNumber: e.target.value },
                      })
                    }
                    placeholder="01800-999999"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#087C76]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Account Type
                  </label>
                  <select
                    value={channels.nagad?.accountType || 'Personal'}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        nagad: {
                          ...channels.nagad,
                          accountType: e.target.value as 'Merchant' | 'Personal' | 'Agent',
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#087C76]"
                  >
                    <option value="Personal">Personal (Send Money)</option>
                    <option value="Merchant">Merchant (Payment)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Payment Instructions for Students
                  </label>
                  <textarea
                    rows={2}
                    value={channels.nagad?.instructions || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        nagad: { ...channels.nagad, instructions: e.target.value },
                      })
                    }
                    placeholder="Use Nagad app -> Send Money..."
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#087C76]"
                  />
                </div>
              </div>
            </div>

            {/* Rocket Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-sm border border-purple-200">
                    🚀
                  </div>
                  <div>
                    <h3 className="font-bold text-[#071126] text-[15px]">Rocket Configuration</h3>
                    <p className="text-[12px] text-[#58708A]">DBBL mobile banking</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.rocket?.enabled ?? true}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        rocket: {
                          enabled: e.target.checked,
                          accountNumber: channels.rocket?.accountNumber || '01911-223344-5',
                          accountType: channels.rocket?.accountType || 'Personal',
                          instructions: channels.rocket?.instructions,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#087C76]"
                  />
                  <span className="text-[12px] font-semibold text-[#071126]">Enabled</span>
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Rocket Account (12 digits)
                  </label>
                  <input
                    type="text"
                    value={channels.rocket?.accountNumber || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        rocket: {
                          enabled: channels.rocket?.enabled ?? true,
                          accountNumber: e.target.value,
                          accountType: channels.rocket?.accountType || 'Personal',
                          instructions: channels.rocket?.instructions,
                        },
                      })
                    }
                    placeholder="01911-223344-5"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#087C76]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Payment Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={channels.rocket?.instructions || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        rocket: {
                          enabled: channels.rocket?.enabled ?? true,
                          accountNumber: channels.rocket?.accountNumber || '',
                          accountType: channels.rocket?.accountType || 'Personal',
                          instructions: e.target.value,
                        },
                      })
                    }
                    placeholder="Use Rocket app or *322# -> Send Money"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#087C76]"
                  />
                </div>
              </div>
            </div>

            {/* Bank Transfer Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#087C76] font-bold flex items-center justify-center text-sm border border-teal-200">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#071126] text-[15px]">Bank Account Transfer</h3>
                    <p className="text-[12px] text-[#58708A]">Corporate bank accounts</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.bankTransfer?.enabled ?? true}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bankTransfer: {
                          ...channels.bankTransfer,
                          enabled: e.target.checked,
                          bankName: channels.bankTransfer?.bankName || 'City Bank PLC',
                          accountName: channels.bankTransfer?.accountName || 'White Board EdTech Ltd',
                          accountNumber: channels.bankTransfer?.accountNumber || '',
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#087C76]"
                  />
                  <span className="text-[12px] font-semibold text-[#071126]">Enabled</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={channels.bankTransfer?.bankName || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bankTransfer: {
                          ...channels.bankTransfer!,
                          bankName: e.target.value,
                        },
                      })
                    }
                    placeholder="City Bank PLC / BRAC Bank"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#087C76]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={channels.bankTransfer?.accountName || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bankTransfer: {
                          ...channels.bankTransfer!,
                          accountName: e.target.value,
                        },
                      })
                    }
                    placeholder="White Board EdTech Ltd"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#087C76]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={channels.bankTransfer?.accountNumber || ''}
                    onChange={(e) =>
                      setChannels({
                        ...channels,
                        bankTransfer: {
                          ...channels.bankTransfer!,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="12093847561"
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] font-mono focus:outline-none focus:border-[#087C76]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Support Contacts & Global Settings */}
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                  Support Hotline / Phone
                </label>
                <input
                  type="text"
                  value={channels.supportPhone || ''}
                  onChange={(e) => setChannels({ ...channels, supportPhone: e.target.value })}
                  placeholder="+880 1712-345678"
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#087C76]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={channels.supportEmail || ''}
                  onChange={(e) => setChannels({ ...channels, supportEmail: e.target.value })}
                  placeholder="support@whiteboardsat.com"
                  className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-[13px] focus:outline-none focus:border-[#087C76]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {savedChannelsSuccess && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-[13px] font-semibold animate-in fade-in">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Channels Updated!</span>
                </div>
              )}
              <button
                type="submit"
                disabled={isSavingChannels}
                className="px-6 py-2.5 bg-[#087C76] hover:bg-[#0D918A] text-white font-semibold text-[13.5px] rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingChannels ? 'Saving...' : 'Save Payment Channels'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Pricing Plans Editor */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {editablePlans.map((plan, pIdx) => {
            const isSaving = savingPlanId === plan.id;
            const isSuccess = savedPlanIdSuccess === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={(e) => {
                        const next = [...editablePlans];
                        next[pIdx] = { ...next[pIdx], name: e.target.value };
                        setEditablePlans(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-[13.5px] font-bold text-[#071126] focus:outline-none focus:border-[#087C76]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                        Sale Price (৳)
                      </label>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => {
                          const next = [...editablePlans];
                          next[pIdx] = { ...next[pIdx], price: Number(e.target.value) };
                          setEditablePlans(next);
                        }}
                        className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-[14px] font-mono font-bold text-[#071126] focus:outline-none focus:border-[#087C76]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                        Regular Price (৳)
                      </label>
                      <input
                        type="number"
                        value={plan.originalPrice || 0}
                        onChange={(e) => {
                          const next = [...editablePlans];
                          next[pIdx] = { ...next[pIdx], originalPrice: Number(e.target.value) };
                          setEditablePlans(next);
                        }}
                        className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-[14px] font-mono text-[#58708A] focus:outline-none focus:border-[#087C76]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={plan.badge || ''}
                      onChange={(e) => {
                        const next = [...editablePlans];
                        next[pIdx] = { ...next[pIdx], badge: e.target.value };
                        setEditablePlans(next);
                      }}
                      placeholder="e.g. Recommended / Popular"
                      className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-[12px] text-[#071126] focus:outline-none focus:border-[#087C76]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#58708A] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={plan.description}
                      onChange={(e) => {
                        const next = [...editablePlans];
                        next[pIdx] = { ...next[pIdx], description: e.target.value };
                        setEditablePlans(next);
                      }}
                      className="w-full px-2.5 py-1.5 border border-[#E2E8F0] rounded-lg text-[12px] text-[#58708A] focus:outline-none focus:border-[#087C76]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSavePlan(editablePlans[pIdx])}
                    className={`w-full py-2 px-3 rounded-xl font-semibold text-[12.5px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#087C76] hover:bg-[#0D918A] text-white shadow-xs'
                    }`}
                  >
                    {isSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Plan'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
