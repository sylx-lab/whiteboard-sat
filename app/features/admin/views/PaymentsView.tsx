'use client';

import React, { useState } from 'react';
import { PaymentSubmission } from '../../../types';
import { CheckCircle2, XCircle, Eye, Inbox, SearchX } from 'lucide-react';
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
  onVerifyPayment: (paymentId: string) => void;
  onRejectPayment: (paymentId: string) => void;
  onInspectPayment: (payment: PaymentSubmission) => void;
}

type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected';

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  onVerifyPayment,
  onRejectPayment,
  onInspectPayment,
}) => {
  const [search, setSearch] = useState('');
  // Land on the queue that actually needs work rather than the full history.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

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

  return (
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
  );
};
