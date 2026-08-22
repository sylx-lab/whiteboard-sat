import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { ProductPlan, UserProfile, PaymentSubmission } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ProductPlan | null;
  currentUser: UserProfile | null;
  onSubmitPayment: (
    productId: string,
    amount: number,
    paymentMethod: PaymentSubmission['paymentMethod'],
    referenceNumber: string,
    senderPhoneNumber: string,
    notes?: string
  ) => PaymentSubmission;
  onOpenAuth: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  currentUser,
  onSubmitPayment,
  onOpenAuth,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentSubmission['paymentMethod']>('bKash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const paymentAccounts = {
    bKash: '01712-345678 (Merchant / Send Money)',
    Nagad: '01800-999999 (Personal / Send Money)',
    'Bank Transfer': 'City Bank PLC | Acc: 12093847561 | White Board EdTech',
    'Credit Card': 'Manual Gateway Portal Reference',
    'Direct Gateway': 'Direct Digital Channel',
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(paymentAccounts[paymentMethod] || '');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim() || !senderPhone.trim()) return;

    onSubmitPayment(
      plan.id,
      plan.price,
      paymentMethod,
      referenceNumber.trim(),
      senderPhone.trim(),
      notes.trim() || undefined
    );
    setIsSubmittedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#0D918A] uppercase tracking-wider">
              Manual Verification
            </div>
            <h3 className="text-base font-bold text-[#071126]">{plan.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmittedSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-[#071126]">Payment Verification Pending</h4>
              <p className="text-[12px] text-[#58708A] max-w-sm mx-auto leading-relaxed">
                Your reference code <strong className="font-mono text-[#071126]">{referenceNumber}</strong> has been submitted to the White Board SAT admin supervisor.
              </p>
              <div className="p-4 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] text-[12px] text-[#58708A] text-left space-y-1.5 mt-4">
                <div className="font-semibold text-[#071126]">Next Steps:</div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Admin verifies transaction in billing queue.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Access is activated on your phone: <strong className="text-[#071126]">{senderPhone}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSubmittedSuccess(false);
                onClose();
              }}
              className="w-full py-2.5 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[12px] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
            {/* Price & Summary */}
            <div className="p-4 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#58708A] block">Total Payable</span>
                <span className="text-xl font-bold font-mono text-[#071126]">
                  {plan.price === 0 ? 'Free' : `৳${plan.price.toLocaleString()}`}
                </span>
                <span className="text-[11px] text-[#58708A] ml-1.5 font-normal">({plan.period})</span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-teal-50 text-[#087C76] font-semibold text-[10px] border border-teal-200">
                  Instant Verification
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Bank Transfer'] as PaymentSubmission['paymentMethod'][]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-lg border text-[12px] font-medium transition-all text-center cursor-pointer ${paymentMethod === method
                        ? 'border-[#087C76] bg-[#F1F8F7] text-[#087C76] font-semibold ring-1 ring-[#087C76]/30'
                        : 'border-[#E2E8F0] bg-white text-[#58708A] hover:bg-slate-50'
                      }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Instructions Box */}
            <div className="p-3.5 bg-[#F1F8F7] rounded-xl border border-[#E2E8F0] space-y-1.5">
              <div className="text-[11px] font-bold text-[#071126]">Send Payment Instructions:</div>
              <p className="text-[11px] text-[#58708A] leading-relaxed">
                Please transfer exactly <strong className="text-[#071126]">৳{plan.price.toLocaleString()}</strong> to the official account:
              </p>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-[#E2E8F0] font-mono text-[11px]">
                <span className="text-[#071126] font-medium truncate max-w-[240px]">
                  {paymentAccounts[paymentMethod]}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1 text-[#58708A] hover:text-[#0D918A] hover:bg-[#F1F8F7] rounded cursor-pointer transition-colors"
                  title="Copy number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              {copiedAccount && (
                <div className="text-[10px] text-emerald-600 font-medium">Copied to clipboard!</div>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Transaction / Reference ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. BK9X872631 or TrxID"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] font-mono focus:outline-none focus:border-[#0D918A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Sender Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+880 1712 345678"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#0D918A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Optional Remarks / Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via bKash personal account"
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#0D918A]"
                />
              </div>

              {!currentUser && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Checking out as guest.{' '}
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="underline font-bold text-amber-900 cursor-pointer"
                    >
                      Sign in
                    </button>{' '}
                    first to automatically link this pass to your profile.
                  </span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#087C76] hover:bg-[#066F6A] text-white font-semibold text-[12px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Submit Reference for Manual Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
