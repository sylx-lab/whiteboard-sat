import React from 'react';
import {
  BarChart3,
  CreditCard,
  Users,
  BookOpen,
  FileText,
  Award,
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export type AdminSubPage = 'overview' | 'payments' | 'candidates' | 'courses' | 'resources' | 'mock-tests' | 'questions';

interface AdminSidebarProps {
  activeSubPage: AdminSubPage;
  onSelectSubPage: (page: AdminSubPage) => void;
  pendingPaymentsCount: number;
  totalUsersCount: number;
  totalQuestionsCount: number;
  totalCoursesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSubPage,
  onSelectSubPage,
  pendingPaymentsCount,
  totalUsersCount,
  totalQuestionsCount,
  totalCoursesCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    {
      id: 'overview' as AdminSubPage,
      label: 'Overview',
      icon: BarChart3,
      section: 'ANALYTICS',
    },
    {
      id: 'payments' as AdminSubPage,
      label: 'Manual Payments',
      icon: CreditCard,
      badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950',
      section: 'FINANCIALS & USERS',
    },
    {
      id: 'candidates' as AdminSubPage,
      label: 'Candidate Accounts',
      icon: Users,
      badge: totalUsersCount,
      badgeColor: 'bg-teal-100 text-teal-800',
      section: 'FINANCIALS & USERS',
    },
    {
      id: 'courses' as AdminSubPage,
      label: 'Courses & Lessons',
      icon: BookOpen,
      badge: totalCoursesCount,
      badgeColor: 'bg-teal-100 text-teal-800',
      section: 'CMS CONTENT',
    },
    {
      id: 'resources' as AdminSubPage,
      label: 'Study Resources',
      icon: FileText,
      section: 'CMS CONTENT',
    },
    {
      id: 'mock-tests' as AdminSubPage,
      label: 'Digital SAT Mocks',
      icon: Award,
      section: 'CMS CONTENT',
    },
    {
      id: 'questions' as AdminSubPage,
      label: 'Question Bank',
      icon: Database,
      badge: totalQuestionsCount,
      badgeColor: 'bg-teal-100 text-teal-800',
      section: 'CMS CONTENT',
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 transition-all duration-200 flex flex-col justify-between shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0D918A] text-white flex items-center justify-center font-black shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest text-[#0D918A] uppercase">SAT Platform</div>
                <div className="font-extrabold text-slate-900 text-xs tracking-tight">Admin CMS Hub</div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-8 h-8 rounded-xl bg-[#0D918A] text-white flex items-center justify-center font-black mx-auto">
              <Shield className="w-4 h-4" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer hidden md:block"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items Grouped */}
        <div className="p-3 space-y-6 overflow-y-auto">
          {['ANALYTICS', 'FINANCIALS & USERS', 'CMS CONTENT'].map((section) => {
            const items = navItems.filter((i) => i.section === section);
            return (
              <div key={section} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase mb-1">
                    {section}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectSubPage(item.id)}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                      } py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0D918A] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Badge */}
      <div className="p-3 border-t border-slate-200">
        {!isCollapsed ? (
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#0D918A] text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Supervisor Online</div>
              <div className="text-[10px] text-teal-700 font-semibold">Full Control Active</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-[#0D918A] text-white flex items-center justify-center font-bold mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </div>
    </aside>
  );
};
