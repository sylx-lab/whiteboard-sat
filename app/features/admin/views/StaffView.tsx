'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '../../../types';
import { PERMISSION_KEYS, PERMISSION_LABELS, permissionsFor, grantedCount } from '../lib/permissions';
import { ShieldCheck, SearchX, Settings2, UserPlus } from 'lucide-react';
import {
  AdminCard,
  Toolbar,
  SearchInput,
  ResultCount,
  EmptyState,
  Pill,
  Button,
  TableShell,
  Row,
} from '../components/ui';

interface StaffViewProps {
  users: UserProfile[];
  currentUser: UserProfile | null;
}

export const StaffView: React.FC<StaffViewProps> = ({ users, currentUser }) => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const staff = users.filter((u) => u.role === 'admin' || u.role === 'sub_admin');
  const filtered = staff.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <AdminCard>
      <Toolbar>
        <SearchInput
          label="Search team"
          value={search}
          onChange={setSearch}
          placeholder="Name, phone, or email…"
        />
        <div className="flex items-center gap-2 ml-auto">
          <ResultCount shown={filtered.length} total={staff.length} noun="team members" />
          <Button
            size="sm"
            variant="primary"
            icon={UserPlus}
            onClick={() => router.push('/admin/staff/new')}
          >
            New staff member
          </Button>
        </div>
      </Toolbar>

      {staff.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No staff yet"
          description="Add a staff member and choose exactly which areas of the console they can manage."
          action={{ label: 'New staff member', onClick: () => router.push('/admin/staff/new') }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching team members"
          description={`Nobody on the team matches “${search}”.`}
          action={{ label: 'Clear search', onClick: () => setSearch('') }}
        />
      ) : (
        <TableShell
          head={
            <>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Can manage</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </>
          }
        >
          {filtered.map((u) => {
            const effective = permissionsFor(u);
            const isActive = u.status !== 'suspended' && !u.isSuspended;
            const granted = PERMISSION_KEYS.filter((k) => effective[k]);

            return (
              <Row key={u.id}>
                <td>
                  <div className="font-semibold text-[#071126] flex items-center gap-1.5">
                    <span>{u.name}</span>
                    {currentUser?.id === u.id && <Pill>you</Pill>}
                  </div>
                  <div className="text-[11px] text-[#58708A]">Since {u.createdAt}</div>
                </td>

                <td>
                  <div className="font-mono text-[#071126]">{u.phone}</div>
                  <div className="text-[11px] text-[#58708A]">{u.email || 'No email'}</div>
                </td>

                <td>
                  <Pill tone={u.role === 'admin' ? 'brand' : 'info'}>
                    {u.role === 'admin' ? 'Full admin' : 'Staff'}
                  </Pill>
                </td>

                <td>
                  {u.role === 'admin' ? (
                    <span className="text-[12px] text-[#58708A]">Everything</span>
                  ) : granted.length === 0 ? (
                    <span className="text-[12px] text-amber-700">Nothing granted</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {granted.slice(0, 3).map((k) => (
                        <Pill key={k}>{PERMISSION_LABELS[k].label}</Pill>
                      ))}
                      {granted.length > 3 && (
                        <span className="text-[11px] text-[#58708A]">
                          +{granted.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td>
                  <Pill tone={isActive ? 'success' : 'danger'}>
                    {isActive ? 'active' : 'suspended'}
                  </Pill>
                </td>

                <td>
                  <div className="flex items-center justify-end">
                    <Button
                      size="sm"
                      icon={Settings2}
                      onClick={() => router.push(`/admin/people/${u.id}?from=staff`)}
                    >
                      {u.role === 'admin'
                        ? 'Manage'
                        : `Permissions (${grantedCount(u.permissions)})`}
                    </Button>
                  </div>
                </td>
              </Row>
            );
          })}
        </TableShell>
      )}
    </AdminCard>
  );
};
