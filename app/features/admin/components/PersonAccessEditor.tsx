'use client';

import React, { useState, useMemo } from 'react';
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
import {
  Check,
  ShieldCheck,
  KeyRound,
  GraduationCap,
  Award,
  Receipt,
  Info,
  UserCog,
  Trash2,
  Mail,
  Key,
  Send,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { EditorTopBar, EditorSection, Field, inputClass, editorPrimaryButtonClass } from './EditorShell';
import { Pill, ToggleRow, Button, SearchInput } from './ui';

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
  onDeleteUser?: (userId: string) => Promise<void> | void;
  onResendResetLink?: (userId: string) => Promise<void>;
  onUpdatePasswordAndEmail?: (userId: string, newPassword: string) => Promise<void>;
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
  onDeleteUser,
  onResendResetLink,
  onUpdatePasswordAndEmail,
  backTab,
}) => {
  const router = useRouter();
  const [mockSearch, setMockSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(res);
  };

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

  const filteredMockTests = useMemo(() => {
    if (!mockSearch.trim()) return mockTests;
    const q = mockSearch.toLowerCase();
    return mockTests.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.difficulty?.toLowerCase().includes(q)
    );
  }, [mockTests, mockSearch]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q)
    );
  }, [courses, courseSearch]);

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

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0] mt-2">
              <div className="flex items-center gap-2">
                <Pill tone={isActive ? 'success' : 'danger'}>{isActive ? 'active' : 'suspended'}</Pill>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Button
                  size="sm"
                  variant={isActive ? 'secondary' : 'primary'}
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
                >
                  {isActive ? 'Suspend account' : 'Reactivate account'}
                </Button>

                {onDeleteUser && (
                  <Button
                    size="sm"
                    variant="danger"
                    icon={Trash2}
                    disabled={isSelf}
                    title={isSelf ? 'You cannot delete your own account' : undefined}
                    onClick={async () => {
                      if (
                        confirm(
                          `Permanently delete ${person.name}'s account (${person.email || person.phone || ''})? This will also remove their test history. This action cannot be undone.`
                        )
                      ) {
                        try {
                          await onDeleteUser(person.id);
                          toast.success(`Deleted ${person.name}'s account.`);
                          router.push(`/admin?tab=${backTab}`);
                        } catch (err: unknown) {
                          const msg = err instanceof Error ? err.message : 'Failed to delete user';
                          toast.error(msg);
                        }
                      }
                    }}
                  >
                    Delete account
                  </Button>
                )}
              </div>
            </div>
          </EditorSection>

          <EditorSection
            icon={Key}
            title="Credentials & Email"
            hint="Send password setup link or set a new password and email credentials"
          >
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
                <div>
                  <div className="font-semibold text-[#071126]">Send Password Setup / Reset Link</div>
                  <div className="text-[#58708A] text-[12px]">
                    Emails a secure link to {person.email || 'this user'} to choose or reset their password.
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Mail}
                  disabled={!person.email || isSendingReset}
                  title={!person.email ? 'No email address on file' : undefined}
                  onClick={async () => {
                    if (!person.email) return;
                    setIsSendingReset(true);
                    try {
                      if (onResendResetLink) {
                        await onResendResetLink(person.id);
                      }
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : 'Failed to send reset link';
                      toast.error(msg);
                    } finally {
                      setIsSendingReset(false);
                    }
                  }}
                >
                  {isSendingReset ? 'Sending…' : 'Send Setup Link'}
                </Button>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#071126] text-[13px]">
                      Set New Password & Email Credentials
                    </div>
                    <div className="text-[#58708A] text-[12px]">
                      Assign a password and immediately email full login credentials to {person.email || 'this user'}.
                    </div>
                  </div>
                  {!showPasswordInput && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Send}
                      disabled={!person.email}
                      title={!person.email ? 'No email address on file' : undefined}
                      onClick={() => {
                        setShowPasswordInput(true);
                        if (!newPassword) generateRandomPassword();
                      }}
                    >
                      Set & Email Password
                    </Button>
                  )}
                </div>

                {showPasswordInput && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter password (min 8 chars)"
                        className={`${inputClass} font-mono`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        icon={Sparkles}
                        onClick={generateRandomPassword}
                        className="shrink-0"
                      >
                        Generate
                      </Button>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setShowPasswordInput(false);
                          setNewPassword('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        icon={Send}
                        disabled={isUpdatingPassword || newPassword.trim().length < 8 || !person.email}
                        onClick={async () => {
                          if (newPassword.trim().length < 8) {
                            toast.error('Password must be at least 8 characters');
                            return;
                          }
                          setIsUpdatingPassword(true);
                          try {
                            if (onUpdatePasswordAndEmail) {
                              await onUpdatePasswordAndEmail(person.id, newPassword.trim());
                              setShowPasswordInput(false);
                              setNewPassword('');
                            }
                          } catch (err: unknown) {
                            const msg = err instanceof Error ? err.message : 'Failed to update credentials';
                            toast.error(msg);
                          } finally {
                            setIsUpdatingPassword(false);
                          }
                        }}
                      >
                        {isUpdatingPassword ? 'Saving & Sending…' : 'Save & Email Credentials'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
              <>
                {mockTests.length > 2 && (
                  <div className="pb-1">
                    <SearchInput
                      label="Search mock tests"
                      placeholder="Search mock tests by title or difficulty…"
                      value={mockSearch}
                      onChange={setMockSearch}
                      className="w-full"
                    />
                  </div>
                )}
                {filteredMockTests.length === 0 ? (
                  <p className="text-[12.5px] text-[#58708A] py-3 text-center">
                    No mock tests match &ldquo;{mockSearch}&rdquo;
                  </p>
                ) : (
                  filteredMockTests.map((mock) => {
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
              </>
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
              <>
                {courses.length > 2 && (
                  <div className="pb-1">
                    <SearchInput
                      label="Search courses"
                      placeholder="Search courses by title…"
                      value={courseSearch}
                      onChange={setCourseSearch}
                      className="w-full"
                    />
                  </div>
                )}
                {filteredCourses.length === 0 ? (
                  <p className="text-[12.5px] text-[#58708A] py-3 text-center">
                    No courses match &ldquo;{courseSearch}&rdquo;
                  </p>
                ) : (
                  filteredCourses.map((course) => (
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
              </>
            )}
          </EditorSection>

          {/* Role is never changed from the student detail page — that avoids an accidental
              privilege escalation where a staff member with student-management rights promotes a
              student to admin. Staff accounts are created from Team > New staff member. When
              opened from Team (backTab=staff) the role can still be edited for existing staff. */}
          {backTab === 'staff' ? (
            <EditorSection icon={UserCog} title="Role">
              <Field
                label="Account role"
                hint={
                  isSelf
                    ? 'You cannot change your own role.'
                    : 'Changing this takes effect immediately. Demoting to Student removes admin access.'
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
                    if (
                      role === 'student' &&
                      !confirm(
                        `Demote ${person.name} to Student? They will lose all admin access.`
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
          ) : person.role === 'student' ? (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-3 flex gap-2.5 text-[12.5px] leading-relaxed text-[#58708A]">
              <Info className="w-4 h-4 text-[#0D918A] shrink-0 mt-0.5" />
              <span>
                Role changes are not done here. To give someone admin access, create a separate staff
                account from <span className="font-semibold text-[#071126]">Team &gt; New staff member</span>.
              </span>
            </div>
          ) : null}

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
