import React, { useState } from 'react';
import {X, Phone, User, Mail, Lock} from 'lucide-react';
import { AuthResult } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (phoneOrEmail: string, password: string) => Promise<AuthResult>;
  onRegister: (
    name: string,
    phone: string,
    password: string,
    email?: string,
    targetScore?: number
  ) => Promise<AuthResult>;
  onForgotPassword: (email: string) => Promise<void>;
}

type Mode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onForgotPassword,
}) => {
  const [mode, setMode] = useState<Mode>('login');
  const [resetSent, setResetSent] = useState(false);
  const isRegister = mode === 'register';
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [targetScore, setTargetScore] = useState('1550');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (mode === 'forgot') {
      await onForgotPassword(phoneOrEmail.trim());
      setIsSubmitting(false);
      setResetSent(true);
      return;
    }

    const result = isRegister
      ? await onRegister(
          name.trim(),
          phone.trim(),
          password,
          email.trim() || undefined,
          parseInt(targetScore, 10) || 1500
        )
      : await onLogin(phoneOrEmail.trim(), password);

    setIsSubmitting(false);
    if (result.ok) {
      setPassword('');
      onClose();
    } else {
      setErrorMsg(result.error);
    }
  };

  const passwordField = (
    <div>
      <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
        Password
      </label>
      <div className="relative">
        <Lock className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 top-3" />
        <input
          type="password"
          required
          minLength={isRegister ? 8 : undefined}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
          className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--surface)] rounded-2xl shadow-xl border border-[var(--border)] w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[var(--brand-text)] uppercase tracking-wider">
              {mode === 'register' ? 'Account Registration' : mode === 'forgot' ? 'Account Recovery' : 'Student Authentication'}
            </span>
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {mode === 'register'
                ? 'Create Your SAT Account'
                : mode === 'forgot'
                  ? 'Reset Your Password'
                  : 'Welcome to White Board'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abdullah Al Mubin"
                    className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Phone Number (Primary Account Key)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1712 345678"
                    className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                  Target SAT Score
                </label>
                <select
                  value={targetScore}
                  onChange={(e) => setTargetScore(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-[12px] font-mono focus:outline-none focus:border-[var(--brand)] bg-[var(--surface)]"
                >
                  <option value="1600">1600 (Perfect Score)</option>
                  <option value="1550">1550+ (Ivy League Tier)</option>
                  <option value="1500">1500+ (Top 1% Percentile)</option>
                  <option value="1450">1450+ (Competitive Honors)</option>
                </select>
              </div>

              {passwordField}
            </>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground-secondary)] uppercase tracking-wider mb-1">
                Phone Number or Email
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-[var(--foreground-muted)] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="e.g. +880 1712 345678 or student@whiteboard.edu"
                  className="w-full pl-9 pr-3 py-2 border border-[var(--border)] rounded-lg text-[12px] focus:outline-none focus:border-[var(--brand)]"
                />
              </div>
              {mode === 'forgot' && (
                <p className="text-[11px] text-[var(--foreground-secondary)] mt-1">
                  We will email a reset link to the address on this account.
                </p>
              )}
            </div>
          )}

          {mode === 'login' && (
            <>
              {passwordField}
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setErrorMsg('');
                  setResetSent(false);
                }}
                className="text-[11px] font-semibold text-[var(--brand-text)] hover:underline cursor-pointer"
              >
                Forgot your password?
              </button>
            </>
          )}

          {resetSent && (
            <div className="p-3 rounded-lg bg-[var(--brand-soft)] border border-[var(--border)] text-[12px] text-[var(--foreground)]">
              If that account exists, a reset link is on its way. The link expires in one hour.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[var(--brand-cta)] hover:bg-[var(--brand-hover)] disabled:opacity-60 text-white font-medium text-[12px] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {isSubmitting
              ? 'Please wait…'
              : mode === 'register'
                ? 'Create My Account'
                : mode === 'forgot'
                  ? 'Email me a reset link'
                  : 'Sign In'}
          </button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[11px] text-[var(--foreground-secondary)]">or</span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Deliberately a plain <a>, not <Link> or router.push: the OAuth
              handshake is a document-level redirect off-origin to Google and
              back, which the client-side router cannot follow. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/google"
            className="w-full py-2.5 flex items-center justify-center gap-2 border border-[var(--border)] hover:bg-[var(--surface-soft)] rounded-lg text-[12px] font-medium text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4h6.6c-.1 1.1-.9 2.8-2.5 3.9l-.02.15 3.6 2.8.25.02c2.3-2.1 3.6-5.2 3.6-8.7Z" />
              <path fill="#34A853" d="M12 24c3.3 0 6-1.1 8-2.9l-3.8-3c-1 .7-2.4 1.2-4.2 1.2a7.3 7.3 0 0 1-6.9-5l-.14.01-3.7 2.9-.05.14A12 12 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.1 14.3a7.4 7.4 0 0 1 0-4.6l-.01-.16-3.75-2.9-.12.06a12 12 0 0 0 0 10.8l3.9-3.1Z" />
              <path fill="#EA4335" d="M12 4.8c2.1 0 3.6.9 4.4 1.7l3.2-3.2C17.9 1.4 15.3 0 12 0A12 12 0 0 0 1.2 6.7l3.9 3a7.3 7.3 0 0 1 6.9-4.9Z" />
            </svg>
            Continue with Google
          </a>

          <div className="pt-2 text-center text-[12px] text-[var(--foreground-secondary)]">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-[var(--brand-text)] font-semibold hover:underline cursor-pointer"
              >
                Back to sign in
              </button>
            ) : isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-[var(--brand-text)] font-semibold hover:underline cursor-pointer"
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
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className="text-[var(--brand-text)] font-semibold hover:underline cursor-pointer"
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
