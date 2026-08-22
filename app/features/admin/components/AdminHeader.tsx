import React from 'react';
import { Shield, ChevronRight, Plus } from 'lucide-react';
import { AdminSubPage } from './AdminSidebar';

interface AdminHeaderProps {
  activeSubPage: AdminSubPage;
  totalRevenue: number;
  onQuickAction?: () => void;
  quickActionLabel?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeSubPage,
  totalRevenue,
  onQuickAction,
  quickActionLabel,
}) => {
  const getSubPageTitles = (page: AdminSubPage) => {
    switch (page) {
      case 'overview':
        return { title: 'Operational Analytics & Overview', category: 'Dashboard' };
      case 'payments':
        return { title: 'Manual Payment Verification Queue', category: 'Financials' };
      case 'candidates':
        return { title: 'Candidate Roster & Access Controls', category: 'Users' };
      case 'courses':
        return { title: 'Course Catalog & Video Lesson CMS', category: 'Content' };
      case 'resources':
        return { title: 'Study Resource Library CMS', category: 'Content' };
      case 'mock-tests':
        return { title: 'Digital SAT Mock Test CMS', category: 'Content' };
      case 'questions':
        return { title: 'SAT Question Bank Builder & KaTeX Editor', category: 'Content' };
      default:
        return { title: 'Admin Console', category: 'System' };
    }
  };

  const info = getSubPageTitles(activeSubPage);

  return (
    <header className="bg-[#0D918A] text-white p-4 sm:p-6 shadow-xs border-b border-[rgba(255,255,255,0.15)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Breadcrumbs & Page Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-teal-100 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1 text-white">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-teal-200" />
            <span className="text-teal-100">{info.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-teal-200" />
            <span className="text-white capitalize">{activeSubPage.replace('-', ' ')}</span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-white">{info.title}</h2>
        </div>

        {/* Right Metric Ticker & Action Button */}
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-[#087C76] rounded-2xl border border-[rgba(255,255,255,0.2)] text-right">
            <div className="text-[10px] text-teal-100 font-bold uppercase tracking-wider">Verified Revenue</div>
            <div className="text-lg font-black text-white font-mono">৳{totalRevenue.toLocaleString()}</div>
          </div>

          {onQuickAction && quickActionLabel && (
            <button
              onClick={onQuickAction}
              className="px-4 py-2.5 bg-white text-[#0D918A] hover:bg-teal-50 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{quickActionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
