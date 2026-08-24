'use client';

import React from 'react';
import { PaymentSubmission } from '../../../types';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { Modal, Button, Pill } from './ui';

interface PaymentReceiptModalProps {
  payment: PaymentSubmission | null;
  onClose: () => void;
  onVerify: (paymentId: string) => void;
  onReject: (paymentId: string) => void;
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 text-[13px]">
    <span className="text-[#58708A]">{label}</span>
    <span className="text-[#071126] font-medium text-right">{children}</span>
  </div>
);

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  payment,
  onClose,
  onVerify,
  onReject,
}) => {
  if (!payment) return null;

  const submittedAt = payment.submittedAt || payment.createdAt;

  return (
    <Modal
      title="Payment receipt"
      subtitle={payment.id}
      icon={CreditCard}
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        payment.status === 'pending' ? (
          <>
            <Button
              variant="danger"
              icon={XCircle}
              onClick={() => {
                if (confirm(`Reject ${payment.userName}'s payment of ৳${payment.amount.toLocaleString()}?`)) {
                  onReject(payment.id);
                  onClose();
                }
              }}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={() => {
                onVerify(payment.id);
                onClose();
              }}
            >
              Verify &amp; grant access
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[#F8FBFB] border border-[#E2E8F0] space-y-2.5">
          <DetailRow label="Student">{payment.userName}</DetailRow>
          <DetailRow label="Sender phone">
            <span className="font-mono">{payment.senderPhoneNumber}</span>
          </DetailRow>
          <DetailRow label="Plan">{payment.productTitle}</DetailRow>
          <div className="pt-2.5 border-t border-[#E2E8F0]">
            <DetailRow label="Amount">
              <span className="font-mono text-base font-bold text-[#071126] tabular-nums">
                ৳{payment.amount.toLocaleString()}
              </span>
            </DetailRow>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F1F8F7] border border-[#E2E8F0] space-y-2">
          <div className="text-[12px] font-semibold text-[#58708A]">
            {payment.paymentMethod} reference
          </div>
          <div className="font-mono text-[15px] font-bold text-[#087C76] break-all">
            {payment.referenceNumber}
          </div>
          {payment.notes && (
            <p className="text-[12px] text-[#58708A] leading-relaxed pt-1">“{payment.notes}”</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-[12px] text-[#58708A]">
          <span>{submittedAt ? new Date(submittedAt).toLocaleString() : 'No timestamp'}</span>
          <Pill
            tone={
              payment.status === 'verified' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'
            }
          >
            {payment.status || 'pending'}
          </Pill>
        </div>

        {payment.reviewedBy && (
          <p className="text-[12px] text-[#58708A]">
            Reviewed by {payment.reviewedBy}
            {payment.reviewedAt ? ` on ${new Date(payment.reviewedAt).toLocaleDateString()}` : ''}.
          </p>
        )}
      </div>
    </Modal>
  );
};
