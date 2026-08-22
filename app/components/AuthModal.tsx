import React, { useState } from 'react';
import { X, Phone, User, Mail, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (phoneOrEmail: string) => boolean;
  onRegister: (name: string, phone: string, email?: string, targetScore?: number) => UserProfile;
  onQuickRoleSelect: (role: 'student' | 'admin') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onQuickRoleSelect,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [targetScore, setTargetScore] = useState('1550');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister) {
      if (!name.trim() || !phone.trim()) {
        setErrorMsg('Please enter your full name and contact phone number.');
        return;
      }
      onRegister(name.trim(), phone.trim(), email.trim() || undefined, parseInt(targetScore, 10) || 1500);
      onClose();
    } else {
      if (!phoneOrEmail.trim()) {
        setErrorMsg('Please enter your registered phone number or email.');
        return;
      }
      const success = onLogin(phoneOrEmail.trim());
      if (success) {
        onClose();
      } else {
        setErrorMsg('Unable to login. If this account is suspended, contact support.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#0D918A] uppercase tracking-wider">
              {isRegister ? 'Account Registration' : 'Student Authentication'}
            </span>
            <h3 className="text-lg font-bold text-[#071126]">
              {isRegister ? 'Create Your SAT Account' : 'Welcome to White Board'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Mode Banners */}
        <div className="px-6 py-3 bg-[#F1F8F7] border-b border-[#E2E8F0]">
          <div className="text-[10px] font-bold text-[#58708A] uppercase tracking-wider mb-2">
            Instant 1-Click Demo Profiles:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onQuickRoleSelect('student');
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-teal-50/50 border border-[#E2E8F0] rounded-lg text-[12px] font-medium text-[#071126] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#0D918A]" />
              <span>Student Profile</span>
            </button>
            <button
              onClick={() => {
                onQuickRoleSelect('admin');
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 p-2 bg-white hover:bg-purple-50/50 border border-[#E2E8F0] rounded-lg text-[12px] font-medium text-[#071126] transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Supervisor</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[12px] text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {isRegister ? (
            <>
              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abdullah Al Mubin"
                    className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#0D918A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Phone Number (Primary Account Key)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712 345678"
                    className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#0D918A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#0D918A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                  Target SAT Score
                </label>
                <select
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] font-mono focus:outline-none focus:border-[#0D918A] bg-white"
                >
                  <option value="1600">1600 (Perfect Score)</option>
                  <option value="1550">1550+ (Ivy League Tier)</option>
                  <option value="1500">1500+ (Top 1% Percentile)</option>
                  <option value="1450">1450+ (Competitive Honors)</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-[#58708A] uppercase tracking-wider mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="e.g. +880 1712 345678 or student@whiteboard.edu"
                  className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] focus:outline-none focus:border-[#0D918A]"
                />
              </div>
              <p className="text-[11px] text-[#58708A] mt-1">
                Enter your registered phone number or email for instant sign-in.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#087C76] hover:bg-[#066F6A] text-white font-medium text-[12px] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {isRegister ? 'Create My Account' : 'Sign In'}
          </button>

          <div className="pt-2 text-center text-[12px] text-[#58708A]">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                  }}
                  className="text-[#0D918A] font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to White Board SAT?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                  }}
                  className="text-[#0D918A] font-semibold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
