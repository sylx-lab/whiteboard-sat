import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Sun,
  Moon,
  Eye,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { UserProfile, AppTheme } from '../types';

export type NavView =
  | 'home'
  | 'practice'
  | 'mock-tests'
  | 'leaderboard'
  | 'courses'
  | 'course-detail'
  | 'resources'
  | 'pricing'
  | 'about'
  | 'dashboard'
  | 'my-courses'
  | 'progress'
  | 'account'
  | 'admin-dashboard'
  | 'admin-students'
  | 'admin-questions'
  | 'admin-purchases';

interface NavbarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  currentUser: UserProfile | null;
  theme: AppTheme;
  onSetTheme: (theme: AppTheme) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  theme,
  onSetTheme,
  onOpenAuth,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'sub_admin';

  // Track scroll state for smooth sticky header transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 12) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to determine active state for nav links
  const isLinkActive = (view: NavView) => {
    if (view === 'courses' && (currentView === 'my-courses' || currentView === 'course-detail')) return true;
    if (view === 'admin-dashboard' && currentView.startsWith('admin')) return true;
    return currentView === view;
  };

  return (
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 bg-[#0D918A] border-b border-[rgba(255,255,255,0.15)] ${isScrolled ? 'shadow-md bg-[#087C76]' : 'shadow-xs'}`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Zone 1: LEFT Brand Wordmark */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'home')}
          >
            {/* Minimal Geometric WB Mark */}
            <div className="w-8 h-8 rounded-[8px] bg-white text-[#0D918A] flex items-center justify-center font-bold text-[11px] tracking-wider transition-transform duration-150 group-hover:scale-105 shadow-xs">
              WB
            </div>

            {/* Editorial Brand Name */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14.5px] tracking-tight text-white leading-none">
                  WHITE BOARD
                </span>
                <span className="text-[10px] font-bold text-[#0D918A] bg-white px-1.5 py-0.5 rounded-[4px] leading-none">
                  SAT
                </span>
              </div>
              <span className="text-[10px] font-semibold tracking-wider text-white/80 uppercase mt-1">
                DIGITAL SAT PREP
              </span>
            </div>
          </div>

          {/* Zone 2: CENTER Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-medium">
            {!currentUser ? (
              // Public Visitor Navigation Links
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('home') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Home</span>
                  {isLinkActive('home') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('practice')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('practice') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Practice</span>
                  {isLinkActive('practice') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('mock-tests')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('mock-tests') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Mock Tests</span>
                  {isLinkActive('mock-tests') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('courses')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('courses') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Courses</span>
                  {isLinkActive('courses') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('leaderboard')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('leaderboard') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Leaderboard</span>
                  {isLinkActive('leaderboard') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('pricing')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('pricing') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Pricing</span>
                  {isLinkActive('pricing') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
              </>
            ) : isAdmin ? (
              // Admin Navigation
              <>
                <button
                  onClick={() => onNavigate('admin-dashboard')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-dashboard' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Overview</span>
                  {currentView === 'admin-dashboard' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('admin-students')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-students' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Students</span>
                  {currentView === 'admin-students' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('admin-purchases')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-purchases' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Verifications</span>
                  {currentView === 'admin-purchases' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('admin-questions')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-questions' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Question Bank</span>
                  {currentView === 'admin-questions' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
              </>
            ) : (
              // Authenticated Student Navigation
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('dashboard') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Dashboard</span>
                  {isLinkActive('dashboard') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('practice')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('practice') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Practice</span>
                  {isLinkActive('practice') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('mock-tests') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Mock Tests</span>
                  {isLinkActive('mock-tests') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('courses')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('courses') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Courses</span>
                  {isLinkActive('courses') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('progress')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('progress') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Analytics</span>
                  {isLinkActive('progress') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('pricing') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Passes</span>
                  {isLinkActive('pricing') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-[#066F6A] rounded-full shadow-xs" />
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: RIGHT Action Controls */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-[10px] transition-colors cursor-pointer"
                title="Theme Settings"
              >
                {theme === 'warm' ? (
                  <Eye className="w-5 h-5 text-amber-200" />
                ) : theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-white" />
                ) : (
                  <Sun className="w-5 h-5 text-white" />
                )}
              </button>

              {themeDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(11,16,32,0.12)] border border-[#E7EBF0] p-1 z-50 text-[12px] font-medium animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setThemeDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onSetTheme('white');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${theme === 'white' ? 'bg-slate-50 text-[#071126] font-semibold' : 'text-[#58708A] hover:bg-slate-50'
                      }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pure Light</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetTheme('warm');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${theme === 'warm' ? 'bg-amber-50/60 text-amber-900 font-semibold' : 'text-[#58708A] hover:bg-slate-50'
                      }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>Eye Comfort</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetTheme('dark');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? 'bg-slate-900 text-white font-semibold' : 'text-[#58708A] hover:bg-slate-50'
                      }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark Atmosphere</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Menu or Log In / Get Started */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-[10px] border border-white/18 transition-colors cursor-pointer text-white"
                >
                  <div className="w-5 h-5 rounded-[6px] bg-white text-[#0D918A] flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[12px] font-semibold leading-tight truncate max-w-[100px] text-white">
                      {currentUser.name}
                    </span>
                    <span className="text-[9.5px] text-white/70 font-normal tracking-tight">
                      {currentUser.role === 'admin' ? 'Super Admin' : 'Candidate'}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-white/70" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(11,16,32,0.12)] border border-[#E7EBF0] p-1.5 z-50 text-[12px] font-medium space-y-1 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[#E7EBF0]">
                      <div className="font-bold text-[#071126]">{currentUser.name}</div>
                      <div className="text-[#58708A] text-[11px] truncate">{currentUser.phone}</div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[#58708A] hover:text-[#071126] hover:bg-slate-50 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#58708A]" />
                      Profile & Access
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('pricing');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[#087C76] bg-[#F1F8F7] hover:bg-teal-50 rounded-lg text-left transition-colors cursor-pointer font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#087C76]" />
                      Upgrade Pass
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[#071126] hover:bg-slate-50 rounded-lg text-left font-semibold transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#087C76]" />
                        Admin Control
                      </button>
                    )}

                    <div className="border-t border-[#E7EBF0] pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 text-[14px] font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
                >
                  Log In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4.5 py-2.5 bg-white hover:bg-[#F1F8F7] text-[#087C76] font-semibold text-[13.5px] rounded-[10px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 group shadow-none"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#087C76] transition-transform duration-150 group-hover:translate-x-0.5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-[10px] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E7EBF0] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <button
              onClick={() => {
                onNavigate(currentUser ? 'dashboard' : 'home');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-[#0B1020] hover:bg-slate-50 rounded-lg font-semibold"
            >
              {currentUser ? 'Dashboard' : 'Home'}
            </button>
            <button
              onClick={() => {
                onNavigate('practice');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50 rounded-lg"
            >
              Practice Question Bank
            </button>
            <button
              onClick={() => {
                onNavigate('mock-tests');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50 rounded-lg"
            >
              Full Mock Tests
            </button>
            <button
              onClick={() => {
                onNavigate('courses');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50 rounded-lg"
            >
              Masterclass Courses
            </button>
            <button
              onClick={() => {
                onNavigate('pricing');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50 rounded-lg"
            >
              Pricing & Passes
            </button>
            {currentUser && (
              <button
                onClick={() => {
                  onNavigate('progress');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left text-[#64748B] hover:text-[#0B1020] hover:bg-slate-50 rounded-lg"
              >
                Performance Analytics
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
