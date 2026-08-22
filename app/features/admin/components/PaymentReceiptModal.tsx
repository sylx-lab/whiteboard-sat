import React from 'react';
import { PaymentSubmission } from '../../../types';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface PaymentReceiptModalProps {
  payment: PaymentSubmission | null;
  onClose: () => void;
  onVerify: (paymentId: string) => void;
  onReject: (paymentId: string) => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  onClose,
  onVerify,
  onReject,
}) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D918A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Payment Receipt Inspection</h3>
              <p className="text-[11px] font-mono text-teal-100">{payment.id}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-teal-100 hover:text-white cursor-pointer font-bold">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Candidate Name:</span>
              <span className="font-bold text-slate-900 text-sm">{payment.userName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Sender Phone:</span>
              <span className="font-mono font-bold text-slate-800">{payment.senderPhoneNumber}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Product Title:</span>
              <span className="font-bold text-[#0D918A]">{payment.productTitle}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-semibold">Amount Received:</span>
              <span className="font-mono text-lg font-black text-emerald-600">
                ৳{payment.amount.toLocaleString()} BDT
              </span>
            </div>
          </div>

          {/* Reference & Channel Card */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-teal-900 font-bold uppercase text-[11px]">
                Payment Channel: {payment.paymentMethod}
              </span>
            </div>
            <div className="font-mono font-black text-[#0D918A] text-base">
              Ref TRX ID: {payment.referenceNumber}
            </div>
            {payment.notes && (
              <div className="text-[11px] text-teal-800 italic">
                "{payment.notes}"
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono">
            <span>Submitted: {new Date(payment.submittedAt || payment.createdAt || '').toLocaleString()}</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
              payment.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {payment.status}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          {payment.status === 'pending' ? (
            <>
              <button
                onClick={() => {
                  onReject(payment.id);
                  onClose();
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => {
                  onVerify(payment.id);
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Activate Pass</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 text-xs cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
