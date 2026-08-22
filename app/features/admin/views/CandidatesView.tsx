import React, { useState } from 'react';
import { UserProfile } from '../../../types';
import { Search, Eye } from 'lucide-react';

interface CandidatesViewProps {
  users: UserProfile[];
  onInspectUser: (user: UserProfile) => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({
  users,
  onInspectUser,
  onUpdateUserAccess,
  onToggleUserStatus,
}) => {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.phone.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
            Registered Candidates & Grant Controls
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Grant or revoke full master passes, math passes, or inspect student practice target scores.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or phone..."
            className="pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D918A]"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 text-[11px]">
            <tr>
              <th className="py-3 px-4">Student Profile</th>
              <th className="py-3 px-4">Phone / Account</th>
              <th className="py-3 px-4">Target Score</th>
              <th className="py-3 px-4">Access Privileges</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{u.name}</span>
                    {u.role === 'admin' && (
                      <span className="px-1.5 py-0.2 bg-teal-100 text-teal-800 text-[9px] font-extrabold rounded">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{u.email || 'No email specified'}</div>
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-700">{u.phone}</td>

                <td className="py-3.5 px-4 font-mono font-bold text-[#0D918A]">{u.targetScore}</td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1">
                    {u.access.fullPremium && (
                      <span className="px-2 py-0.5 bg-teal-100 text-teal-800 font-bold text-[10px] rounded">
                        Full Pass
                      </span>
                    )}
                    {u.access.premiumMath && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                        Math Pass
                      </span>
                    )}
                    {u.access.premiumReadingWriting && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold text-[10px] rounded">
                        Verbal Pass
                      </span>
                    )}
                    {!u.access.fullPremium &&
                      !u.access.premiumMath &&
                      !u.access.premiumReadingWriting && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                          Free Starter
                        </span>
                      )}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <button
                    onClick={() => onToggleUserStatus(u.id)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                      u.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {(u.status || 'active').toUpperCase()}
                  </button>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onInspectUser(u)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                      title="Inspect student detail"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onUpdateUserAccess(u.id, { fullPremium: !u.access.fullPremium })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                        u.access.fullPremium
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-[#0D918A] text-white hover:bg-[#087C76]'
                      }`}
                    >
                      {u.access.fullPremium ? 'Revoke Pass' : 'Grant Pass'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
