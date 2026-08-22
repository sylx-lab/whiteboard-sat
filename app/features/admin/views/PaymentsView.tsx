import React, { useState } from 'react';
import { PaymentSubmission } from '../../../types';
import { Search, CheckCircle2, XCircle, Eye } from 'lucide-react';

interface PaymentsViewProps {
  payments: PaymentSubmission[];
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onInspectPayment: (payment: PaymentSubmission) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  onVerifyPayment,
  onRejectPayment,
  onInspectPayment,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            Manual Payment Verification Queue
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted bKash, Nagad, and Bank Transfer transaction IDs to activate student passes instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 bg-white text-xs rounded-xl text-slate-900 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Queue</option>
            <option value="verified">Verified Transfers</option>
            <option value="rejected">Rejected Entries</option>
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or phone..."
              className="pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
            />
          </div>
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
            {filtered.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50/50">
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
                  <div className="font-mono text-[#0D918A] font-bold text-[11px]">
                    Ref: {payment.referenceNumber}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      payment.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : payment.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(payment.status || 'pending').toUpperCase()}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onInspectPayment(payment)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                      title="Inspect full receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onVerifyPayment(payment.id)}
                          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 text-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => onRejectPayment(payment.id)}
                          className="h-8 px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold rounded-lg border border-slate-200 transition-colors text-xs cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
