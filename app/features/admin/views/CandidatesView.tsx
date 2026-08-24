'use client';

import React, { useState } from 'react';
import { UserProfile } from '../../../types';
import { Eye, Users, SearchX } from 'lucide-react';
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

interface CandidatesViewProps {
  users: UserProfile[];
  onInspectUser: (user: UserProfile) => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
}

type AccessFilter = 'all' | 'premium' | 'free';

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  users,
  onInspectUser,
  onUpdateUserAccess,
  onToggleUserStatus,
}) => {
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');

  const filtered = users.filter((u) => {
    const hasPaidAccess =
      u.access.fullPremium || u.access.premiumMath || u.access.premiumReadingWriting;
    if (accessFilter === 'premium' && !hasPaidAccess) return false;
    if (accessFilter === 'free' && hasPaidAccess) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    setSearch('');
    setAccessFilter('all');
  };

  return (
    <AdminCard>
      <Toolbar>
        <SearchInput
          label="Search students"
          value={search}
          onChange={setSearch}
          placeholder="Name, phone, or email…"
        />
        <FilterSelect<AccessFilter>
          label="Access level"
          value={accessFilter}
          onChange={setAccessFilter}
          options={[
            { value: 'all', label: 'All access levels' },
            { value: 'premium', label: 'Has a paid pass' },
            { value: 'free', label: 'Free tier only' },
          ]}
        />
        <div className="lg:ml-auto">
          <ResultCount shown={filtered.length} total={users.length} noun="students" />
        </div>
      </Toolbar>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No student accounts yet"
          description="Accounts appear here as soon as students register in the student app."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching students"
          description="Nothing matches the current search and access filter."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      ) : (
        <TableShell
          head={
            <>
              <th>Student</th>
              <th>Contact</th>
              <th>Target</th>
              <th>Access</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </>
          }
        >
          {filtered.map((u) => (
            <Row key={u.id}>
              <td>
                <div className="font-semibold text-[#071126] flex items-center gap-1.5">
                  <span>{u.name}</span>
                  {u.role === 'admin' && <Pill tone="brand">Admin</Pill>}
                </div>
                <div className="text-[11px] text-[#58708A]">{u.email || 'No email on file'}</div>
              </td>

              <td className="font-mono text-[#071126]">{u.phone}</td>

              <td className="font-mono font-semibold text-[#087C76] tabular-nums">{u.targetScore}</td>

              <td>
                <div className="flex flex-wrap gap-1">
                  {u.access.fullPremium && <Pill tone="brand">Full pass</Pill>}
                  {u.access.premiumMath && <Pill tone="success">Math</Pill>}
                  {u.access.premiumReadingWriting && <Pill tone="info">Verbal</Pill>}
                  {!u.access.fullPremium &&
                    !u.access.premiumMath &&
                    !u.access.premiumReadingWriting && <Pill>Free tier</Pill>}
                </div>
              </td>

              <td>
                <button
                  onClick={() => {
                    const suspending = u.status === 'active';
                    if (
                      !suspending ||
                      confirm(`Suspend ${u.name}? They will not be able to sign in until reactivated.`)
                    ) {
                      onToggleUserStatus(u.id);
                    }
                  }}
                  className="cursor-pointer"
                  title={u.status === 'active' ? `Suspend ${u.name}` : `Reactivate ${u.name}`}
                >
                  <Pill tone={u.status === 'active' ? 'success' : 'danger'}>{u.status || 'active'}</Pill>
                </button>
              </td>

              <td>
                <div className="flex items-center justify-end gap-1.5">
                  <IconAction icon={Eye} label={`View ${u.name}'s details`} onClick={() => onInspectUser(u)} />
                  <Button
                    variant={u.access.fullPremium ? 'danger' : 'primary'}
                    onClick={() => {
                      if (
                        !u.access.fullPremium ||
                        confirm(`Revoke ${u.name}'s full pass? They lose access to all premium content.`)
                      ) {
                        onUpdateUserAccess(u.id, { fullPremium: !u.access.fullPremium });
                      }
                    }}
                    className="h-9 px-3"
                  >
                    {u.access.fullPremium ? 'Revoke pass' : 'Grant pass'}
                  </Button>
                </div>
              </td>
            </Row>
          ))}
        </TableShell>
      )}
    </AdminCard>
  );
};
