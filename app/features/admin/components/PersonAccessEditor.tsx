'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  UserProfile,
  Course,
  MockTest,
  PaymentSubmission,
  AdminPermission,
} from '../../../types';
import {
  PERMISSION_KEYS,
  PERMISSION_LABELS,
  permissionsFor,
  grantedCount,
} from '../lib/permissions';
import { Check, ShieldCheck, KeyRound, GraduationCap, Award, UserCog, Receipt } from 'lucide-react';
import { EditorTopBar, EditorSection, Field, inputClass, editorPrimaryButtonClass } from './EditorShell';
import { Pill, ToggleRow, Button } from './ui';

interface PersonAccessEditorProps {
  person: UserProfile;
  courses: Course[];
  mockTests: MockTest[];
  payments: PaymentSubmission[];
  /** The admin doing the editing — used to stop them removing their own access. */
  actingUser: UserProfile | null;
  onUpdateAccess: (userId: string, updates: Partial<UserProfile['access']>) => void;
  onToggleCourse: (userId: string, courseId: string) => void;
  onToggleMockTest: (userId: string, mockTestId: string) => void;
  onSetRole: (userId: string, role: UserProfile['role']) => void;
  onSetPermissions: (userId: string, updates: Partial<AdminPermission>) => void;
  onToggleStatus: (userId: string) => void;
  backTab: string;
}

const ROLE_LABEL: Record<UserProfile['role'], string> = {
  student: 'Student',
  sub_admin: 'Staff',
  admin: 'Full admin',
};

export const PersonAccessEditor: React.FC<PersonAccessEditorProps> = ({
  person,
  courses,
  mockTests,
  payments,
  actingUser,
  onUpdateAccess,
  onToggleCourse,
  onToggleMockTest,
  onSetRole,
  onSetPermissions,
  onToggleStatus,
  backTab,
}) => {
  const router = useRouter();

  const access = person.access;
  // A full pass covers the individual subject passes and all mock tests, so those render locked-on
  // rather than pretending they can be turned off independently.
  const coveredByFullPass = access.fullPremium;
  const isActive = person.status !== 'suspended' && !person.isSuspended;
  const isSelf = actingUser?.id === person.id;
  const effective = permissionsFor(person);
  const personPayments = payments.filter((p) => p.userId === person.id);

  const setPass = (key: keyof UserProfile['access'], value: boolean) =>
    onUpdateAccess(person.id, { [key]: value } as Partial<UserProfile['access']>);

  const unlockedMockCount = (access.unlockedMockTestIds || []).filter((id) =>
    mockTests.some((m) => m.id === id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-[#071126] flex flex-col">
      <EditorTopBar
        eyebrow={ROLE_LABEL[person.role]}
        title={person.name}
        onBack={() => router.push(`/admin?tab=${backTab}`)}
        backLabel="Back to the admin console"
        status="Changes apply immediately"
      >
        <button
          type="button"
          onClick={() => router.push(`/admin?tab=${backTab}`)}
          className={editorPrimaryButtonClass}
        >
          <Check className="w-4 h-4" />
          Done
        </button>
      </EditorTopBar>

      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto w-full space-y-4">
          <EditorSection icon={GraduationCap} title="Account">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
              {[
                ['Email', person.email || 'None on file'],
                ['Phone', person.phone || 'None on file'],
                ['Target score', `${person.targetScore} / 1600`],
                ['Exam date', person.examDate || 'Not set'],
                ['Registered', person.createdAt],
                ['Role', ROLE_LABEL[person.role]],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-[#58708A]">{label}</span>
                  <span className="font-medium text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Pill tone={isActive ? 'success' : 'danger'}>{isActive ? 'active' : 'suspended'}</Pill>
              <Button
                size="sm"
                variant={isActive ? 'danger' : 'primary'}
                disabled={isSelf}
                title={isSelf ? 'You cannot suspend your own account' : undefined}
                onClick={() => {
                  if (
                    !isActive ||
                    confirm(`Suspend ${person.name}? They will not be able to sign in until reactivated.`)
                  ) {
                    onToggleStatus(person.id);
                  }
                }}
                className="ml-auto"
              >
                {isActive ? 'Suspend account' : 'Reactivate account'}
              </Button>
            </div>
          </EditorSection>

          <EditorSection icon={KeyRound} title="Passes" hint="Global question bank and feature passes">
            <ToggleRow
              label="Full master pass"
              hint="Unlocks everything: all practice questions, all courses, and all mock tests."
              checked={access.fullPremium}
              onChange={(next) => setPass('fullPremium', next)}
            />
            <ToggleRow
              label="Math question bank"
              hint="Unlocks all Math practice questions and solutions."
              checked={access.premiumMath || coveredByFullPass}
              disabled={coveredByFullPass}
              lockedReason={coveredByFullPass ? 'Included in the full master pass.' : undefined}
              onChange={(next) => setPass('premiumMath', next)}
            />
            <ToggleRow
              label="Reading & Writing question bank"
              hint="Unlocks all Reading & Writing practice questions and solutions."
              checked={access.premiumReadingWriting || coveredByFullPass}
              disabled={coveredByFullPass}
              lockedReason={coveredByFullPass ? 'Included in the full master pass.' : undefined}
              onChange={(next) => setPass('premiumReadingWriting', next)}
            />
            <ToggleRow
              label="Supplemental question sets"
              hint="Unlocks extra curated practice question sets and problem banks."
              checked={access.redbookPractice || coveredByFullPass}
              disabled={coveredByFullPass}
              lockedReason={coveredByFullPass ? 'Included in the full master pass.' : undefined}
              onChange={(next) => setPass('redbookPractice', next)}
            />
          </EditorSection>

          <EditorSection
            icon={Award}
            title="Mock test access"
            hint={
              coveredByFullPass
                ? 'All mock tests via full master pass'
                : `${unlockedMockCount} of ${mockTests.length} unlocked`
            }
          >
            {mockTests.length === 0 ? (
              <p className="text-[13px] text-[#58708A]">No mock tests created yet.</p>
            ) : (
              mockTests.map((mock) => {
                const isUnlocked =
                  mock.is_free ||
                  coveredByFullPass ||
                  (access.unlockedMockTestIds?.includes(mock.id) ?? false);
                const isLockedReason = mock.is_free
                  ? 'Free diagnostic test for all students.'
                  : coveredByFullPass
                  ? 'Included in the full master pass.'
                  : undefined;

                return (
                  <ToggleRow
                    key={mock.id}
                    label={mock.title}
                    hint={`${mock.totalQuestions} questions · ${mock.totalTimeMinutes} mins · ${mock.difficulty} · ${mock.is_free ? 'Free Diagnostic' : 'Premium'}`}
                    checked={isUnlocked}
                    disabled={mock.is_free || coveredByFullPass}
                    lockedReason={isLockedReason}
                    onChange={() => onToggleMockTest(person.id, mock.id)}
                  />
                );
              })
            )}
          </EditorSection>

          <EditorSection
            icon={GraduationCap}
            title="Course enrolment"
            hint={
              coveredByFullPass
                ? 'All courses via the full master pass'
                : `${access.enrolledCourseIds.length} of ${courses.length}`
            }
          >
            {courses.length === 0 ? (
              <p className="text-[13px] text-[#58708A]">No courses in the catalog yet.</p>
            ) : (
              courses.map((course) => (
                <ToggleRow
                  key={course.id}
                  label={course.title}
                  hint={`${course.lessonsCount} lessons · ৳${course.price}`}
                  checked={access.enrolledCourseIds.includes(course.id) || coveredByFullPass}
                  disabled={coveredByFullPass}
                  lockedReason={coveredByFullPass ? 'Included in the full master pass.' : undefined}
                  onChange={() => onToggleCourse(person.id, course.id)}
                />
              ))
            )}
          </EditorSection>

          <EditorSection icon={UserCog} title="Role">
            <Field
              label="Account role"
              hint={
                isSelf
                  ? 'You cannot change your own role.'
                  : 'Staff can open the admin console with only the permissions you grant below.'
              }
            >
              <select
                value={person.role}
                disabled={isSelf}
                onChange={(e) => {
                  const role = e.target.value as UserProfile['role'];
                  if (
                    role === 'admin' &&
                    !confirm(
                      `Make ${person.name} a full admin? They will be able to manage everything, including other staff.`
                    )
                  ) {
                    return;
                  }
                  onSetRole(person.id, role);
                }}
                className={`${inputClass} disabled:bg-[#F8FBFB] disabled:cursor-not-allowed`}
              >
                <option value="student">Student — no admin access</option>
                <option value="sub_admin">Staff — admin access you choose</option>
                <option value="admin">Full admin — everything</option>
              </select>
            </Field>
          </EditorSection>

          {person.role !== 'student' && (
            <EditorSection
              icon={ShieldCheck}
              title="What they can manage"
              hint={
                person.role === 'admin'
                  ? 'All areas'
                  : `${grantedCount(person.permissions)} of ${PERMISSION_KEYS.length}`
              }
            >
              {person.role === 'admin' ? (
                <p className="text-[13px] text-[#58708A] leading-relaxed">
                  Full admins always have every permission. Change the role to Staff to grant a
                  narrower set.
                </p>
              ) : (
                <>
                  {PERMISSION_KEYS.map((key) => (
                    <ToggleRow
                      key={key}
                      label={PERMISSION_LABELS[key].label}
                      hint={PERMISSION_LABELS[key].hint}
                      checked={effective[key]}
                      disabled={isSelf}
                      lockedReason={isSelf ? 'You cannot change your own permissions.' : undefined}
                      onChange={(next) => onSetPermissions(person.id, { [key]: next })}
                    />
                  ))}
                  {grantedCount(person.permissions) === 0 && (
                    <p className="text-[12px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
                      With nothing granted, this staff member cannot open the admin console.
                    </p>
                  )}
                </>
              )}
            </EditorSection>
          )}

          <EditorSection icon={Receipt} title={`Payments (${personPayments.length})`}>
            {personPayments.length === 0 ? (
              <p className="text-[13px] text-[#58708A]">No payment submissions from this account.</p>
            ) : (
              <ul className="divide-y divide-[#E2E8F0]">
                {personPayments.map((p) => (
                  <li key={p.id} className="py-2.5 flex items-center gap-3 text-[13px]">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.productTitle}</div>
                      <div className="text-[11px] text-[#58708A] font-mono">
                        {p.paymentMethod} · {p.referenceNumber}
                      </div>
                    </div>
                    <span className="font-mono tabular-nums shrink-0">
                      ৳{p.amount.toLocaleString()}
                    </span>
                    <Pill
                      tone={
                        p.status === 'verified' ? 'success' : p.status === 'pending' ? 'warning' : 'danger'
                      }
                    >
                      {p.status || 'pending'}
                    </Pill>
                  </li>
                ))}
              </ul>
            )}
          </EditorSection>
        </div>
      </div>
    </div>
  );
};
