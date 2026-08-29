import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Clock, ArrowRight, AlertCircle, PhoneCall } from 'lucide-react';
import { ProductPlan, UserProfile, PaymentSubmission, PaymentSettings } from '../types';
import { DEFAULT_PAYMENT_SETTINGS } from '../data/seedData';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: ProductPlan | null;
  currentUser: UserProfile | null;
  paymentSettings?: PaymentSettings;
  onSubmitPayment: (
    productId: string,
    amount: number,
    paymentMethod: PaymentSubmission['paymentMethod'],
    referenceNumber: string,
    senderPhoneNumber: string,
    notes?: string
  ) => Promise<PaymentSubmission>;
  onOpenAuth: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  currentUser,
  paymentSettings = DEFAULT_PAYMENT_SETTINGS,
  onSubmitPayment,
  onOpenAuth,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentSubmission['paymentMethod']>('bKash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [notes, setNotes] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  React.useEffect(() => {
    if (currentUser?.phone) setSenderPhone(currentUser.phone);
  }, [currentUser?.phone]);

  React.useEffect(() => {
    if (!isOpen) {
      setReferenceNumber('');
      setNotes('');
      setIsSubmittedSuccess(false);
      setCopiedAccount(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !plan) return null;

  const sets = paymentSettings || DEFAULT_PAYMENT_SETTINGS;

  const paymentAccounts: Record<string, string> = {
    bKash: `${sets.bkash?.accountNumber || '01712-345678'} (${sets.bkash?.accountType || 'Merchant'})`,
    Nagad: `${sets.nagad?.accountNumber || '01800-999999'} (${sets.nagad?.accountType || 'Personal'})`,
    'Bank Transfer': `${sets.bankTransfer?.bankName || 'City Bank PLC'} | Acc: ${sets.bankTransfer?.accountNumber || '12093847561'} | ${sets.bankTransfer?.accountName || 'White Board EdTech'}`,
    'Credit Card': 'Direct Gateway Portal',
    'Direct Gateway': 'Direct Digital Channel',
  };

  const paymentInstructions: Record<string, string> = {
    bKash: sets.bkash?.instructions || 'Use bKash app -> Payment/Send Money -> Use reference as your phone number',
    Nagad: sets.nagad?.instructions || 'Use Nagad app -> Send Money -> Use reference as your phone number',
    'Bank Transfer': sets.bankTransfer?.instructions || 'Transfer via online banking / BEFTN / NPSB and submit the transaction reference code.',
    'Credit Card': 'Follow the instructions on the gateway page.',
    'Direct Gateway': 'Direct digital payment channel.',
  };

  const handleCopyAccount = async () => {
    const text = paymentAccounts[paymentMethod] || '';
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      }
    } catch {}
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim() || !senderPhone.trim()) return;

    // Awaited so "submitted" is only shown once the server has the reference —
    // telling someone their payment is in when it never arrived is the one
    // failure this screen must not have.
    await onSubmitPayment(
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} role="dialog" aria-modal="true" aria-label="Payment verification">
      <div className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-[var(--brand-text)] uppercase tracking-wider">
              Manual Verification
            </div>
            <h3 className="text-base font-bold text-[var(--foreground)]">{plan.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-lg transition-colors cursor-pointer"
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
              <h4 className="text-lg font-bold text-[var(--foreground)]">Payment Verification Pending</h4>
              <p className="text-[12px] text-[var(--foreground-secondary)] max-w-sm mx-auto leading-relaxed">
                Your reference code <strong className="font-mono text-[var(--foreground)]">{referenceNumber}</strong> has been submitted to the White Board SAT admin supervisor.
              </p>
              <div className="p-4 bg-[var(--brand-soft)] rounded-xl border border-[var(--border)] text-[12px] text-[var(--foreground-secondary)] text-left space-y-1.5 mt-4">
                <div className="font-semibold text-[var(--foreground)]">Next Steps:</div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Admin verifies transaction in billing queue.</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Access is activated on your phone: <strong className="text-[var(--foreground)]">{senderPhone}</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSubmittedSuccess(false);
                onClose();
              }}
              className="w-full py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[12px] rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
            {/* Price & Summary */}
            <div className="p-4 bg-[var(--brand-soft)] rounded-xl border border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[var(--foreground-secondary)] block">Total Payable</span>
                <span className="text-xl font-bold font-mono text-[var(--foreground)]">
                  {plan.price === 0 ? 'Free' : `৳${plan.price.toLocaleString()}`}
                </span>
                <span className="text-[11px] text-[var(--foreground-secondary)] ml-1.5 font-normal">({plan.period})</span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-teal-50 text-[var(--brand-text)] font-semibold text-[10px] border border-teal-200">
                  Instant Verification
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['bKash', 'Nagad', 'Bank Transfer'] as PaymentSubmission['paymentMethod'][]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-3 rounded-lg border text-[12px] font-medium transition-all text-center cursor-pointer ${paymentMethod === method
                        ? 'border-[var(--brand-cta)] bg-[var(--brand-soft)] text-[var(--brand-text)] font-semibold ring-1 ring-[var(--brand-cta)]/30'
                        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-secondary)] hover:bg-[var(--surface-soft)]'
                      }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Instructions Box */}
            <div className="p-3.5 bg-[var(--brand-soft)] rounded-xl border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold text-[var(--foreground)]">Send Payment Instructions:</div>
                {sets.supportPhone && (
                  <span className="text-[10px] text-[var(--foreground-secondary)] font-medium">
                    Help: {sets.supportPhone}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-[var(--foreground-secondary)] leading-relaxed">
                Please transfer exactly <strong className="text-[var(--foreground)]">৳{plan.price.toLocaleString()}</strong> to the official account:
              </p>
              <div className="flex items-center justify-between p-2.5 bg-[var(--surface)] rounded-lg border border-[var(--border)] font-mono text-[12px]">
                <span className="text-[var(--foreground)] font-semibold truncate max-w-[280px]">
                  {paymentAccounts[paymentMethod]}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1.5 text-[var(--foreground-secondary)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-soft)] rounded cursor-pointer transition-colors"
                  title="Copy account number"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {paymentInstructions[paymentMethod] && (
                <div className="text-[11px] text-[var(--foreground-secondary)] italic bg-[var(--surface)]/60 p-2 rounded border border-[var(--border)]/50">
                  📌 {paymentInstructions[paymentMethod]}
                </div>
              )}
              {copiedAccount && (
                <div className="text-[10px] text-emerald-600 font-medium">Copied to clipboard!</div>
              )}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Transaction / Reference ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. BK9X872631 or TrxID"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[12px] font-mono focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Sender Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+880 1712 345678"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Optional Remarks / Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Paid via bKash personal account"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
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
                className="w-full py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] text-white font-semibold text-[12px] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
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
