'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPermission } from '../../../types';
import { useAppStore } from '../../../services/store';
import {
  PERMISSION_KEYS,
  PERMISSION_LABELS,
} from '../../../features/admin/lib/permissions';
import { ShieldCheck, UserPlus, Save } from 'lucide-react';
import {
  EditorTopBar,
  EditorSection,
  Field,
  inputClass,
  editorPrimaryButtonClass,
} from '../../../features/admin/components/EditorShell';
import { ToggleRow } from '../../../features/admin/components/ui';

export default function NewStaffPage() {
  const store = useAppStore();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Partial<AdminPermission>>({});
  const [isDirty, setIsDirty] = useState(false);

  const grantedCount = PERMISSION_KEYS.filter((k) => permissions[k]).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Await it: the server mints the id this navigates to, and a failure here
    // (a phone already in use) must not look like a successful create.
    const staff = await store.createStaffUser(
      name.trim(),
      phone.trim(),
      email.trim() || undefined,
      permissions,
    );
    setIsDirty(false);
    router.push(`/admin/people/${staff.id}?from=staff`);
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
        <button type="submit" form="staff-form" className={editorPrimaryButtonClass}>
          <Save className="w-4 h-4" />
          Create staff member
        </button>
      </EditorTopBar>

      <div className="flex-1 p-4 sm:p-6">
        <form
          id="staff-form"
          onSubmit={handleSubmit}
          onChange={() => setIsDirty(true)}
          className="max-w-3xl mx-auto w-full space-y-4"
        >
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
              <Field label="Phone" hint="Used to sign in">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" hint="Optional">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rafiq@whiteboardsat.com"
                  className={inputClass}
                />
              </Field>
            </div>
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
