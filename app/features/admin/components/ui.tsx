'use client';

import React from 'react';
import { Search, X, LucideIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';

/**
 * Shared admin primitives.
 *
 * These deliberately reuse the student app's tokens (#071126 ink, #58708A muted,
 * #E2E8F0 border, #F1F8F7 soft, #0D918A brand) and its control metrics (h-10
 * controls, rounded-[10px] inputs, rounded-2xl cards, 12/13px body) so the admin
 * console reads as the same product. Palette is unchanged — only scale, spacing
 * and structure are unified.
 */

export const AdminCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={cn(
      'bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 space-y-5 animate-in fade-in duration-200',
      className
    )}
  >
    {children}
  </div>
);

/** Filter row: search + selects on the left, list-level actions on the right. */
export const Toolbar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-wrap items-center gap-2">{children}</div>
);

export const SearchInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}> = ({ value, onChange, placeholder, label, className = 'flex-1 min-w-45 lg:max-w-xs' }) => (
  <div className={cn('relative', className)}>
    <label className="sr-only" htmlFor={`search-${label}`}>
      {label}
    </label>
    <Search className="w-4 h-4 text-[#58708A] absolute left-2.5 top-2.5 pointer-events-none" />
    <input
      id={`search-${label}`}
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 pl-8 pr-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[12px] text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors"
    />
  </div>
);

export const FilterSelect = <T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
}) => (
  <div className={className}>
    <label className="sr-only" htmlFor={`filter-${label}`}>
      {label}
    </label>
    <select
      id={`filter-${label}`}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        'h-9 px-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[12px] font-medium text-[#071126] focus:outline-none focus:border-[#0D918A] transition-colors cursor-pointer',
        className && 'w-full'
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

/** "12 of 40 questions" — mirrors the student practice list's results header. */
export const ResultCount: React.FC<{ shown: number; total: number; noun: string }> = ({
  shown,
  total,
  noun,
}) => (
  <div className="text-[13px] text-[#58708A]">
    <span className="font-semibold text-[#071126]">{shown}</span>
    {shown !== total && <span> of {total}</span>} {noun}
  </div>
);

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon: Icon, title, description, action }) => (
  <div className="py-14 px-6 text-center space-y-4">
    <div className="w-12 h-12 rounded-xl bg-[#F1F8F7] text-[#58708A] flex items-center justify-center mx-auto border border-[#E2E8F0]">
      <Icon className="w-6 h-6" />
    </div>
    <div className="space-y-1">
      <h3 className="font-bold text-[#071126] text-base">{title}</h3>
      <p className="text-[13px] text-[#58708A] max-w-sm mx-auto leading-relaxed">{description}</p>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-[#080D21] hover:bg-[#087C76] text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer"
      >
        {action.label}
      </button>
    )}
  </div>
);

const DIFFICULTY_DOT: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-rose-500',
};

/**
 * Difficulty as a colour-coded dot plus muted text rather than a filled pill.
 * Every question has a difficulty, so a pill on each row is just chroma noise —
 * pills are reserved for exceptions (draft, archived).
 */
export const DifficultyDot: React.FC<{
  difficulty: 'easy' | 'medium' | 'hard';
  className?: string;
}> = ({ difficulty, className = '' }) => (
  <span className={cn('inline-flex items-center gap-1.5', className)}>
    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DIFFICULTY_DOT[difficulty]}`} />
    <span className="text-[11px] text-[#58708A]">{difficulty}</span>
  </span>
);

type PillTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

const PILL_TONES: Record<PillTone, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  brand: 'bg-teal-50 text-teal-800',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-rose-50 text-rose-800',
  info: 'bg-indigo-50 text-indigo-800',
};

export const Pill: React.FC<{ tone?: PillTone; children: React.ReactNode; className?: string }> = ({
  tone = 'neutral',
  children,
  className = '',
}) => (
  <span
    className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold', PILL_TONES[tone], className)}
  >
    {children}
  </span>
);

/** Icon-only control. `label` is required so these are never unlabelled to a screen reader. */
export const IconAction: React.FC<{
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger';
}> = ({ icon: Icon, label, onClick, tone = 'default' }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`p-2 rounded-lg text-[#58708A] transition-colors cursor-pointer ${
      tone === 'danger' ? 'hover:text-rose-600 hover:bg-rose-50' : 'hover:text-[#0D918A] hover:bg-[#F1F8F7]'
    }`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-[#0D918A] hover:bg-[#087C76] text-white border border-transparent',
  secondary: 'bg-white hover:bg-[#F1F8F7] text-[#071126] border border-[#E2E8F0]',
  danger: 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200',
  ghost: 'bg-transparent hover:bg-[#F8FBFB] text-[#58708A] hover:text-[#071126] border border-transparent',
};

export const Button: React.FC<
  {
    variant?: ButtonVariant;
    /** `sm` matches the h-9 toolbar controls; `md` is for forms and dialogs. */
    size?: 'sm' | 'md';
    icon?: LucideIcon;
    children: React.ReactNode;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ variant = 'secondary', size = 'md', icon: Icon, children, className = '', ...rest }) => (
  <button
    {...rest}
    className={cn(
      'rounded-lg text-[12px] font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'h-9 px-2.5' : 'h-10 px-3.5',
      BUTTON_VARIANTS[variant],
      className
    )}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {children}
  </button>
);

/** Horizontal-scroll wrapper with a sticky header row for the admin tables. */
export const TableShell: React.FC<{ head: React.ReactNode; children: React.ReactNode }> = ({
  head,
  children,
}) => (
  <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
    <table className="w-full text-left text-[12px] min-w-[720px]">
      <thead className="text-[#58708A] border-b border-[#E2E8F0] text-[11px]">
        <tr className="[&>th]:py-2.5 [&>th]:px-3 [&>th]:font-semibold [&>th:first-child]:pl-0 [&>th:last-child]:pr-0">
          {head}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#E2E8F0]">{children}</tbody>
    </table>
  </div>
);

export const Row: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tr className="hover:bg-[#F8FBFB] transition-colors [&>td]:py-3 [&>td]:px-3 [&>td:first-child]:pl-0 [&>td:last-child]:pr-0">
    {children}
  </tr>
);

/**
 * Shared admin dialog: scrim click and Escape both close, and the dialog is
 * labelled for screen readers. All admin modals go through this.
 */
export const Modal: React.FC<{
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ title, subtitle, icon: Icon, onClose, footer, children, maxWidth = 'max-w-lg' }) => {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const titleId = `modal-${title.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071126]/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-[#F1F8F7] text-[#0D918A] grid place-items-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-bold text-[#071126] leading-tight">
                {title}
              </h2>
              {subtitle && <p className="text-[12px] text-[#58708A] mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>
          <IconAction icon={X} label="Close dialog" onClick={onClose} />
        </div>

        <div className="p-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#F8FBFB] flex items-center justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Labelled toggle row. Used for access passes and staff permissions, so both read
 * as the same kind of control. Changes apply immediately — there is no save step
 * on an access screen.
 */
export const ToggleRow: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** Shown instead of the hint while the toggle is forced on by something else. */
  lockedReason?: string;
}> = ({ label, hint, checked, onChange, disabled = false, lockedReason }) => (
  <label
    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
      disabled
        ? 'border-[#E2E8F0] bg-[#F8FBFB] cursor-not-allowed'
        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FBFB] cursor-pointer'
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-0.5 w-4 h-4 shrink-0 accent-[#0D918A] disabled:opacity-50"
    />
    <span className="min-w-0 flex-1">
      <span className="block text-[13px] font-medium text-[#071126]">{label}</span>
      {(lockedReason || hint) && (
        <span className="block text-[12px] text-[#58708A] leading-relaxed">
          {lockedReason || hint}
        </span>
      )}
    </span>
  </label>
);
