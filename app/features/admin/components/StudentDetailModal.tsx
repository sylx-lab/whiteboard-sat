'use client';

import React from 'react';
import { UserProfile } from '../../../types';
import { User } from 'lucide-react';
import { Modal, Button, Pill } from './ui';

interface StudentDetailModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
}

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3 text-[13px]">
    <span className="text-[#58708A]">{label}</span>
    <span className="text-[#071126] font-medium text-right">{children}</span>
  </div>
);

/** One grantable pass. Revoking asks for confirmation; granting does not. */
const AccessToggle: React.FC<{
  title: string;
  description: string;
  granted: boolean;
  onToggle: () => void;
  userName: string;
}> = ({ title, description, granted, onToggle, userName }) => (
  <div className="p-3.5 rounded-xl bg-[#F8FBFB] border border-[#E2E8F0] flex items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="text-[13px] font-semibold text-[#071126]">{title}</div>
      <div className="text-[12px] text-[#58708A] leading-relaxed">{description}</div>
    </div>
    <Button
      variant={granted ? 'danger' : 'primary'}
      onClick={() => {
        if (!granted || confirm(`Revoke ${userName}'s ${title.toLowerCase()}?`)) onToggle();
      }}
      className="shrink-0"
    >
      {granted ? 'Revoke' : 'Grant'}
    </Button>
  </div>
);

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  user,
  onClose,
  onUpdateUserAccess,
  onToggleUserStatus,
}) => {
  if (!user) return null;

  const isActive = user.status !== 'suspended' && !user.isSuspended;

  return (
    <Modal
      title={user.name}
      subtitle={user.email || user.phone}
      icon={User}
      onClose={onClose}
      footer={
        <>
          <Button
            variant={isActive ? 'danger' : 'primary'}
            onClick={() => {
              if (
                !isActive ||
                confirm(`Suspend ${user.name}? They will not be able to sign in until reactivated.`)
              ) {
                onToggleUserStatus(user.id);
              }
            }}
            className="mr-auto"
          >
            {isActive ? 'Suspend account' : 'Reactivate account'}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-[#F8FBFB] border border-[#E2E8F0] space-y-2.5">
          <DetailRow label="Phone">
            <span className="font-mono">{user.phone}</span>
          </DetailRow>
          <DetailRow label="Email">{user.email || 'None on file'}</DetailRow>
          <DetailRow label="Target score">
            <span className="font-mono text-[#087C76] font-semibold tabular-nums">
              {user.targetScore} / 1600
            </span>
          </DetailRow>
          {user.examDate && <DetailRow label="Exam date">{user.examDate}</DetailRow>}
          <DetailRow label="Registered">{user.createdAt}</DetailRow>
          <DetailRow label="Role">
            <span className="capitalize">{user.role}</span>
          </DetailRow>
          <DetailRow label="Status">
            <Pill tone={isActive ? 'success' : 'danger'}>{isActive ? 'active' : 'suspended'}</Pill>
          </DetailRow>
        </div>

        <section className="space-y-2">
          <h3 className="text-[13px] font-bold text-[#071126]">Access passes</h3>

          <AccessToggle
            title="Full master pass"
            description="All courses, mock tests, and questions."
            granted={user.access.fullPremium}
            userName={user.name}
            onToggle={() => onUpdateUserAccess(user.id, { fullPremium: !user.access.fullPremium })}
          />
          <AccessToggle
            title="Math pass"
            description="Every Math question and the Math courses."
            granted={user.access.premiumMath}
            userName={user.name}
            onToggle={() => onUpdateUserAccess(user.id, { premiumMath: !user.access.premiumMath })}
          />
          <AccessToggle
            title="Reading & Writing pass"
            description="Every verbal question and the verbal courses."
            granted={user.access.premiumReadingWriting}
            userName={user.name}
            onToggle={() =>
              onUpdateUserAccess(user.id, {
                premiumReadingWriting: !user.access.premiumReadingWriting,
              })
            }
          />
        </section>
      </div>
    </Modal>
  );
};
