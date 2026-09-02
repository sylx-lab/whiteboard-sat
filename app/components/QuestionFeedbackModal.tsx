import React, { useState } from 'react';
import { X, MessageSquareWarning } from 'lucide-react';
import { Question } from '../types';

interface QuestionFeedbackModalProps {
  question: Question | null;
  onClose: () => void;
  onSubmit: (message: string) => Promise<unknown>;
}

export const QuestionFeedbackModal: React.FC<QuestionFeedbackModalProps> = ({ question, onClose, onSubmit }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!question) return null;

  const close = () => {
    onClose();
    setMessage('');
    setIsSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(message.trim());
      setIsSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--surface) rounded-2xl shadow-2xl border border-(--border) w-full max-w-md overflow-hidden">
        <div className="px-5 py-4 border-b border-(--border) flex items-center justify-between bg-(--brand-soft)">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-(--brand-cta) flex items-center justify-center text-white shrink-0">
              <MessageSquareWarning className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-(--foreground) text-[14px] truncate">Report an issue</h3>
              <p className="text-[11px] text-(--foreground-secondary) truncate font-mono">{question.code}</p>
            </div>
          </div>
          <button onClick={close} className="p-1.5 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) rounded-lg transition-colors cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSent ? (
          <div className="p-5 space-y-4">
            <p className="text-[13px] text-(--foreground) leading-relaxed">
              Thanks — sent to the team. They&apos;ll review this question and fix it if needed.
            </p>
            <button
              onClick={close}
              className="w-full h-10 bg-(--brand-cta) hover:bg-(--brand-hover) text-white font-semibold text-[13px] rounded-[10px] transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            <label className="block text-[12px] font-medium text-(--foreground-secondary)">
              What&apos;s wrong with this question?
            </label>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. the marked correct answer looks wrong, a choice is missing, the explanation doesn't match…"
              rows={4}
              className="w-full p-3 border border-(--border) rounded-[10px] text-[13px] focus:outline-none focus:border-(--brand) bg-(--surface) text-(--foreground) resize-none"
            />
            <button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="w-full h-10 bg-(--brand-cta) hover:bg-(--brand-hover) disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[13px] rounded-[10px] transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Sending…' : 'Send report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
