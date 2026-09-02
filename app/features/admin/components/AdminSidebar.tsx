'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '../../../types';
import {
  BarChart3,
  CreditCard,
  Users,
  BookOpen,
  FileText,
  Award,
  Database,
  Shield,
  ShieldCheck,
  Tags,
  MessageSquareWarning,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
} from 'lucide-react';

export type AdminSubPage =
  | 'overview'
  | 'payments'
  | 'candidates'
  | 'staff'
  | 'courses'
  | 'resources'
  | 'mock-tests'
  | 'questions'
  | 'topics'
  | 'feedback';

export const ADMIN_SUB_PAGES: AdminSubPage[] = [
  'overview',
  'payments',
  'candidates',
  'staff',
  'courses',
  'resources',
  'mock-tests',
  'questions',
  'topics',
  'feedback',
];

interface AdminSidebarProps {
  activeSubPage: AdminSubPage;
  onSelectSubPage: (page: AdminSubPage) => void;
  currentUser: UserProfile | null;
  pendingPaymentsCount: number;
  totalUsersCount: number;
  totalQuestionsCount: number;
  totalCoursesCount: number;
  totalResourcesCount: number;
  totalMockTestsCount: number;
  totalStaffCount: number;
  totalTopicsCount: number;
  openFeedbackCount: number;
  /** Pages this person may open. Anything else is hidden, not just disabled. */
  allowedPages: AdminSubPage[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile drawer state — the sidebar is off-canvas below lg. */
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}

const SECTIONS = ['Analytics', 'People & payments', 'Content'] as const;

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSubPage,
  onSelectSubPage,
  currentUser,
  pendingPaymentsCount,
  totalUsersCount,
  totalQuestionsCount,
  totalCoursesCount,
  totalResourcesCount,
  totalMockTestsCount,
  totalStaffCount,
  totalTopicsCount,
  openFeedbackCount,
  allowedPages,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  type NavItem = {
    id: AdminSubPage;
    label: string;
    icon: typeof BarChart3;
    count?: number;
    urgent?: boolean;
  };

  // All available nav items with their respective section grouping
  const allNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, count: undefined },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      count: pendingPaymentsCount || undefined,
      urgent: pendingPaymentsCount > 0,
    },
    {
      id: 'candidates',
      label: 'Students',
      icon: Users,
      count: totalUsersCount,
    },
    { id: 'staff', label: 'Team', icon: ShieldCheck, count: totalStaffCount },
    { id: 'questions', label: 'Question bank', icon: Database, count: totalQuestionsCount },
    { id: 'topics', label: 'Topics', icon: Tags, count: totalTopicsCount },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: MessageSquareWarning,
      count: openFeedbackCount || undefined,
      urgent: openFeedbackCount > 0,
    },
    { id: 'courses', label: 'Courses', icon: BookOpen, count: totalCoursesCount },
    { id: 'mock-tests', label: 'Mock tests', icon: Award, count: totalMockTestsCount },
    { id: 'resources', label: 'Resources', icon: FileText, count: totalResourcesCount },
  ];

  const sectionMap: Record<(typeof SECTIONS)[number], AdminSubPage[]> = {
    Analytics: ['overview'],
    'People & payments': ['payments', 'candidates', 'staff'],
    Content: ['questions', 'topics', 'feedback', 'courses', 'mock-tests', 'resources'],
  };

  const showLabels = isMobileOpen || !isCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 transition-all duration-200
          fixed inset-y-0 left-0 z-50 w-64 lg:static lg:z-auto lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-17' : 'lg:w-60'}`}
      >
        {/* Brand header */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-[#E2E8F0] shrink-0">
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'lg:mx-auto' : ''}`}>
            <div className="w-8 h-8 rounded-[10px] bg-[#087C76] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            {showLabels && (
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#071126] leading-tight truncate">Admin console</div>
                <div className="text-[10px] text-[#58708A] leading-tight truncate">White Board SAT</div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-[#F8FBFB] rounded-lg transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>

          {/* Mobile drawer close */}
          <button
            onClick={onCloseMobile}
            aria-label="Close menu"
            className="lg:hidden p-1.5 text-[#58708A] hover:text-[#071126] hover:bg-[#F8FBFB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation items grouped by section */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-4">
          {SECTIONS.map((section) => {
            const pageIds = sectionMap[section];
            const items = allNavItems.filter(
              (item) => pageIds.includes(item.id) && allowedPages.includes(item.id)
            );
            if (items.length === 0) return null;

            return (
              <div key={section} className="space-y-0.5">
                {showLabels ? (
                  <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#58708A]">
                    {section}
                  </div>
                ) : (
                  <div className="h-1.5" />
                )}

                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectSubPage(item.id);
                        onCloseMobile();
                      }}
                      title={!showLabels ? item.label : undefined}
                      className={`relative w-full h-10 flex items-center gap-2.5 rounded-[10px] text-[12px] font-medium text-left transition-colors cursor-pointer ${isCollapsed ? 'lg:justify-center lg:px-0 px-2.5' : 'px-2.5'
                        } ${isActive
                          ? 'bg-[#F1F8F7] text-[#087C76] font-semibold'
                          : 'text-[#071126] hover:bg-[#F8FBFB]'
                        }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#087C76]' : 'text-[#58708A]'}`}
                      />
                      {showLabels && <span className="flex-1 text-left truncate">{item.label}</span>}
                      {showLabels && item.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums shrink-0 ${item.urgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-[#58708A]'
                            }`}
                        >
                          {item.count}
                        </span>
                      )}
                      {/* Collapsed: keep the pending-payment signal visible as a dot */}
                      {!showLabels && item.urgent && (
                        <span
                          className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Signed-in identity + Log out */}
        <div className="p-2.5 border-t border-[#E2E8F0] space-y-1.5 shrink-0">
          {showLabels ? (
            <div className="px-2.5 py-2 rounded-[10px] bg-[#F8FBFB] border border-[#E2E8F0]">
              <div className="text-[12px] font-semibold text-[#071126] truncate">
                {currentUser?.name || 'Not signed in'}
              </div>
              <div className="text-[10px] text-[#58708A] truncate">
                {currentUser?.email || currentUser?.phone || 'No contact on file'}
              </div>
            </div>
          ) : (
            <div
              className="w-8 h-8 mx-auto rounded-[10px] bg-[#F1F8F7] border border-[#E2E8F0] text-[#087C76] flex items-center justify-center text-[12px] font-bold"
              title={currentUser?.name || 'Not signed in'}
            >
              {(currentUser?.name || '?').charAt(0).toUpperCase()}
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={`w-full h-9 flex items-center gap-2.5 rounded-[10px] text-[12px] font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer ${isCollapsed ? 'lg:justify-center lg:px-0 px-2.5' : 'px-2.5'
              }`}
            title="Log out"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
            {showLabels && <span className="text-left">Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
