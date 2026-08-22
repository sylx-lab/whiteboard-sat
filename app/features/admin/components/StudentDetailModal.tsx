import React from 'react';
import { UserProfile } from '../../../types';
import { User, Phone, Award } from 'lucide-react';

interface StudentDetailModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onUpdateUserAccess: (userId: string, accessUpdate: Partial<UserProfile['access']>) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  user,
  onClose,
  onUpdateUserAccess,
  onToggleUserStatus,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D918A] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-base">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">{user.name}</h3>
              <p className="text-[11px] text-teal-100 font-mono">ID: {user.id}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-teal-100 hover:text-white cursor-pointer font-bold">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto">
          {/* Roster Information Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#0D918A]" />
                <span>Contact Phone</span>
              </div>
              <div className="font-mono font-bold text-slate-900 text-sm">{user.phone}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <Award className="w-3 h-3 text-teal-600" />
                <span>SAT Target Score</span>
              </div>
              <div className="font-mono font-black text-[#0D918A] text-sm">
                {user.targetScore} / 1600
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold">Email:</span>
              <span className="font-mono font-medium">{user.email || 'None registered'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold">Account Role:</span>
              <span className="font-bold uppercase text-[#0D918A]">{user.role}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold">Registered On:</span>
              <span className="font-mono">{user.createdAt}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-semibold">Account Status:</span>
              <span className={`font-extrabold uppercase px-2 py-0.5 rounded text-[10px] ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                {user.status || 'active'}
              </span>
            </div>
          </div>

          {/* Access Controls */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Access Privileges & Pass Grants
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Full Master Pass (All Access)</div>
                  <div className="text-[10px] text-slate-500">Unlocks all courses, mock tests, and questions</div>
                </div>
                <button
                  onClick={() => onUpdateUserAccess(user.id, { fullPremium: !user.access.fullPremium })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    user.access.fullPremium
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-[#0D918A] text-white hover:bg-[#087C76]'
                  }`}
                >
                  {user.access.fullPremium ? 'Revoke Pass' : 'Grant Pass'}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Premium Math Pass</div>
                  <div className="text-[10px] text-slate-500">Unlocks all Math bank questions and courses</div>
                </div>
                <button
                  onClick={() => onUpdateUserAccess(user.id, { premiumMath: !user.access.premiumMath })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    user.access.premiumMath
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {user.access.premiumMath ? 'Revoke' : 'Grant'}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Premium Reading & Writing Pass</div>
                  <div className="text-[10px] text-slate-500">Unlocks all Verbal questions and courses</div>
                </div>
                <button
                  onClick={() => onUpdateUserAccess(user.id, { premiumReadingWriting: !user.access.premiumReadingWriting })}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                    user.access.premiumReadingWriting
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {user.access.premiumReadingWriting ? 'Revoke' : 'Grant'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onToggleUserStatus(user.id)}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer ${
              user.status === 'active'
                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            {user.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
