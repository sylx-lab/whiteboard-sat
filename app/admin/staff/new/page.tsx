'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPermission } from '../../../types';
import { useAppStore } from '../../../services/store';
import {
  PERMISSION_KEYS,
  PERMISSION_LABELS,
} from '../../../features/admin/lib/permissions';
import { ShieldCheck, UserPlus, Save, AlertCircle, Loader2 } from 'lucide-react';
import {
  EditorTopBar,
  EditorSection,
  Field,
  inputClass,
  editorPrimaryButtonClass,
} from '../../../features/admin/components/EditorShell';
import { ToggleRow } from '../../../features/admin/components/ui';

import { toast } from 'sonner';

export default function NewStaffPage() {
  const store = useAppStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Partial<AdminPermission>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grantedCount = PERMISSION_KEYS.filter((k) => permissions[k]).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const staff = await store.createStaffUser(
        name.trim(),
        email.trim(),
        phone.trim() || undefined,
        permissions,
        password.trim() || undefined,
      );
      setIsDirty(false);
      toast.success('Staff member created successfully.');
      router.push(`/admin/people/${staff.id}?from=staff`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create staff member.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#071126] flex flex-col">
      <EditorTopBar
        eyebrow="Team"
        title="New staff member"
        onBack={() => {
          if (isDirty && !window.confirm('Discard this staff member?')) return;
          router.push('/admin?tab=staff');
        }}
        backLabel="Back to the team list"
        status={isDirty ? 'Unsaved' : undefined}
      >
        <button
          type="submit"
          form="staff-form"
          disabled={isSubmitting}
          className={`${editorPrimaryButtonClass} flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Create staff member</span>
            </>
          )}
        </button>
      </EditorTopBar>

      <div className="flex-1 p-4 sm:p-6">
        <form
          id="staff-form"
          onSubmit={handleSubmit}
          onChange={() => setIsDirty(true)}
          className="max-w-3xl mx-auto w-full space-y-4"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[13px] flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <EditorSection icon={UserPlus} title="Who they are">
            <Field label="Full name">
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rafiq Hasan"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email" hint="Used to sign in">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rafiq@whiteboardsat.com"
                  className={inputClass}
                />
              </Field>
              <Field label="Phone" hint="Optional">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field
              label="Initial password"
              hint="Optional (min 8 chars). If left empty, the staff member can set their password via 'Forgot password'."
            >
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </Field>
          </EditorSection>

          <EditorSection
            icon={ShieldCheck}
            title="What they can manage"
            hint={`${grantedCount} of ${PERMISSION_KEYS.length}`}
          >
            {PERMISSION_KEYS.map((key) => (
              <ToggleRow
                key={key}
                label={PERMISSION_LABELS[key].label}
                hint={PERMISSION_LABELS[key].hint}
                checked={Boolean(permissions[key])}
                onChange={(next) => {
                  setPermissions((prev) => ({ ...prev, [key]: next }));
                  setIsDirty(true);
                }}
              />
            ))}
            {grantedCount === 0 && (
              <p className="text-[12px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
                With nothing granted they will not be able to open the admin console. You can change
                this at any time.
              </p>
            )}
          </EditorSection>
        </form>
      </div>
    </div>
  );
}
