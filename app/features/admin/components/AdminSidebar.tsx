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
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
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
  | 'topics';

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
  /** Pages this person may open. Anything else is hidden, not just disabled. */
  allowedPages: AdminSubPage[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile drawer state — the sidebar is off-canvas below lg. */
  isMobileOpen: boolean;
  onCloseMobile: () => void;
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
  allowedPages,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  type NavItem = {
    id: AdminSubPage;
    label: string;
    icon: typeof BarChart3;
    section: (typeof SECTIONS)[number];
    count?: number;
    urgent?: boolean;
  };

  const allNavItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, section: 'Analytics' },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
      section: 'People & payments',
      count: pendingPaymentsCount || undefined,
      urgent: pendingPaymentsCount > 0,
    },
    {
      id: 'candidates',
      label: 'Students',
      icon: Users,
      section: 'People & payments',
      count: totalUsersCount,
    },
    { id: 'staff', label: 'Team', icon: ShieldCheck, section: 'People & payments', count: totalStaffCount },
    { id: 'questions', label: 'Question bank', icon: Database, section: 'Content', count: totalQuestionsCount },
    { id: 'topics', label: 'Topics', icon: Tags, section: 'Content', count: totalTopicsCount },
    { id: 'courses', label: 'Courses', icon: BookOpen, section: 'Content', count: totalCoursesCount },
    { id: 'mock-tests', label: 'Mock tests', icon: Award, section: 'Content', count: totalMockTestsCount },
    { id: 'resources', label: 'Resources', icon: FileText, section: 'Content', count: totalResourcesCount },
  ];

  // Pages a staff member cannot manage are hidden outright, not shown disabled.
  const navItems = allNavItems.filter((item) => allowedPages.includes(item.id));

  const showLabels = !isCollapsed;

  return (
    <>
      {/* Mobile scrim */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#071126]/40 lg:hidden animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 transition-all duration-200
          fixed inset-y-0 left-0 z-50 w-64 lg:static lg:z-auto lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-60'}`}
      >
        {/* Brand + collapse */}
        <div className="h-14 px-3 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'lg:mx-auto' : ''}`}>
            <div className="w-8 h-8 rounded-[10px] bg-[#0D918A] text-white flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            {showLabels && (
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#071126] leading-tight truncate">Admin console</div>
                <div className="text-[11px] text-[#58708A] leading-tight">White Board SAT</div>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-lg text-[#58708A] hover:text-[#071126] hover:bg-[#F1F8F7] transition-colors cursor-pointer hidden lg:block"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>

          <button
            onClick={onCloseMobile}
            aria-label="Close navigation"
            className="p-1.5 rounded-lg text-[#58708A] hover:bg-[#F1F8F7] transition-colors cursor-pointer lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-5" aria-label="Admin sections">
          {SECTIONS.map((section) => {
            const items = navItems.filter((i) => i.section === section);
            if (items.length === 0) return null;
            return (
              <div key={section} className="space-y-0.5">
                {showLabels && (
                  <div className="px-2.5 pb-1 text-[11px] font-semibold text-[#58708A]">{section}</div>
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
                      aria-current={isActive ? 'page' : undefined}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative w-full h-10 flex items-center gap-2.5 rounded-[10px] text-[12px] font-medium transition-colors cursor-pointer ${
                        isCollapsed ? 'lg:justify-center lg:px-0 px-2.5' : 'px-2.5'
                      } ${
                        isActive
                          ? 'bg-[#F1F8F7] text-[#087C76] font-semibold'
                          : 'text-[#071126] hover:bg-[#F8FBFB]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0D918A]' : 'text-[#58708A]'}`}
                      />
                      {showLabels && <span className="flex-1 text-left truncate">{item.label}</span>}
                      {showLabels && item.count !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums shrink-0 ${
                            item.urgent ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-[#58708A]'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      {/* Collapsed: keep the pending-payment signal visible as a dot */}
                      {isCollapsed && item.urgent && (
                        <span
                          className="hidden lg:block absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"
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

        {/* Signed-in identity + exit to student app */}
        <div className="p-2.5 border-t border-[#E2E8F0] space-y-1.5 shrink-0">
          {showLabels ? (
            <div className="px-2.5 py-2 rounded-[10px] bg-[#F8FBFB] border border-[#E2E8F0]">
              <div className="text-[12px] font-semibold text-[#071126] truncate">
                {currentUser?.name || 'Not signed in'}
              </div>
              <div className="text-[11px] text-[#58708A] truncate">
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

          <Link
            href="/dashboard"
            className={`h-9 flex items-center gap-2 rounded-[10px] text-[12px] font-medium text-[#58708A] hover:text-[#071126] hover:bg-[#F8FBFB] transition-colors ${
              isCollapsed ? 'lg:justify-center px-2.5' : 'px-2.5'
            }`}
            title="Open the student app"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {showLabels && <span>Student app</span>}
          </Link>
        </div>
      </aside>
    </>
  );
};
