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
    <header className={`sticky top-0 z-40 w-full transition-all duration-200 bg-(--brand) border-b border-[rgba(255,255,255,0.15) ${isScrolled ? 'shadow-md bg-(--brand-cta)' : 'shadow-xs'}`}>
      <div className="max-w-310 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17.5">
          {/* Zone 1: LEFT Brand Wordmark */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'home')}
          >
            {/* Minimal Geometric WB Mark */}
            <div className="w-8 h-8 rounded-lg bg-(--surface) text-(--brand-text) flex items-center justify-center font-bold text-[11px] tracking-wider transition-transform duration-150 group-hover:scale-105 shadow-xs">
              WB
            </div>

            {/* Editorial Brand Name */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[14.5px] tracking-tight text-white leading-none">
                  WHITE BOARD
                </span>
                <span className="text-[10px] font-bold text-(--brand-text) bg-(--surface) px-1.5 py-0.5 rounded-sm leading-none">
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
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('practice')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('practice') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Practice</span>
                  {isLinkActive('practice') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('mock-tests')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('mock-tests') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Mock Tests</span>
                  {isLinkActive('mock-tests') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('courses')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('courses') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Courses</span>
                  {isLinkActive('courses') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('leaderboard')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('leaderboard') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Leaderboard</span>
                  {isLinkActive('leaderboard') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>

                <button
                  onClick={() => onNavigate('pricing')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('pricing') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Pricing</span>
                  {isLinkActive('pricing') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
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
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('admin-students')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-students' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Students</span>
                  {currentView === 'admin-students' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('admin-purchases')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-purchases' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Verifications</span>
                  {currentView === 'admin-purchases' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('admin-questions')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${currentView === 'admin-questions' ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Question Bank</span>
                  {currentView === 'admin-questions' && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
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
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('practice')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('practice') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Practice</span>
                  {isLinkActive('practice') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('mock-tests') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Mock Tests</span>
                  {isLinkActive('mock-tests') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('courses')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('courses') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Courses</span>
                  {isLinkActive('courses') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('progress')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('progress') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Analytics</span>
                  {isLinkActive('progress') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('pricing')}
                  className={`relative py-2 text-sm transition-colors duration-150 cursor-pointer ${isLinkActive('pricing') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'
                    }`}
                >
                  <span>Passes</span>
                  {isLinkActive('pricing') && (
                    <div className="absolute -bottom-1 left-0 right-0 h-[2.5px] bg-(--brand-hover) rounded-full shadow-xs" />
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
                aria-label="Theme Settings"
                aria-expanded={themeDropdownOpen}
                aria-haspopup="menu"
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
                  className="absolute right-0 mt-2 w-44 bg-(--surface) rounded-xl shadow-[0_4px_20px_-4px_rgba(11,16,32,0.12) border border-(--border) p-1 z-50 text-[12px] font-medium animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setThemeDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onSetTheme('white');
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${theme === 'white' ? 'bg-(--surface-soft) text-(--foreground) font-semibold' : 'text-(--foreground-secondary) hover:bg-(--surface-soft)'
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
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${theme === 'warm' ? 'bg-amber-50/60 text-amber-900 font-semibold' : 'text-(--foreground-secondary) hover:bg-(--surface-soft)'
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
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${theme === 'dark' ? 'bg-(--navy-section) text-white font-semibold' : 'text-(--foreground-secondary) hover:bg-(--surface-soft)'
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
                  <div className="w-5 h-5 rounded-md bg-(--surface) text-(--brand-text) flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-[12px] font-semibold leading-tight truncate max-w-25 text-white">
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
                    className="absolute right-0 mt-2 w-52 bg-(--surface) rounded-xl shadow-[0_4px_20px_-4px_rgba(11,16,32,0.12) border border-(--border) p-1.5 z-50 text-[12px] font-medium space-y-1 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-(--border)">
                      <div className="font-bold text-(--foreground)">{currentUser.name}</div>
                      <div className="text-(--foreground-secondary) text-[11px] truncate">{currentUser.email || currentUser.phone}</div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate('account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft) rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-(--foreground-secondary)" />
                      Profile & Access
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('pricing');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-(--brand-text) bg-(--brand-soft) hover:bg-teal-50 rounded-lg text-left transition-colors cursor-pointer font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-(--brand-text)" />
                      Upgrade Pass
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-(--foreground) hover:bg-(--surface-soft) rounded-lg text-left font-semibold transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-(--brand-text)" />
                        Admin Control
                      </button>
                    )}

                    <div className="border-t border-(--border) pt-1">
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
                  className="px-4.5 py-2.5 bg-(--surface) hover:bg-(--brand-soft) text-(--brand-text) font-semibold text-[13.5px] rounded-[10px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 group shadow-none"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 text-(--brand-text) transition-transform duration-150 group-hover:translate-x-0.5" />
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

      {/* Mobile Backdrop & Drawer Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 top-17.5 z-30 bg-black/40 backdrop-blur-xs lg:hidden animate-in fade-in duration-150"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-x-0 top-17.5 z-40 lg:hidden bg-(--surface) border-b border-(--border) px-4 py-5 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-150 max-h-[calc(100dvh-70px) overflow-y-auto pb-safe">
            <nav className="flex flex-col space-y-1 text-[13.5px] font-medium">
              <button
                onClick={() => {
                  onNavigate(currentUser ? 'dashboard' : 'home');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl font-semibold transition-colors flex items-center justify-between ${isLinkActive(currentUser ? 'dashboard' : 'home')
                    ? 'bg-(--brand-soft) text-(--brand-text)'
                    : 'text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>{currentUser ? 'Student Dashboard' : 'Home'}</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('practice');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('practice')
                    ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>Practice Question Bank</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('mock-tests');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('mock-tests')
                    ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>Full Mock Tests</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('courses');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('courses')
                    ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>Masterclass Courses</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('leaderboard');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('leaderboard')
                    ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>Leaderboard</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('resources');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('resources')
                    ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>Cheat Sheets & Resources</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('pricing');
                  setMobileMenuOpen(false);
                }}
                className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('pricing')
                    ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                    : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                  }`}
              >
                <span>Pricing & Passes</span>
              </button>
              {currentUser && (
                <button
                  onClick={() => {
                    onNavigate('progress');
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-left rounded-xl transition-colors flex items-center justify-between ${isLinkActive('progress')
                      ? 'bg-(--brand-soft) text-(--brand-text) font-semibold'
                      : 'text-(--foreground-secondary) hover:text-(--foreground) hover:bg-(--surface-soft)'
                    }`}
                >
                  <span>Performance Analytics</span>
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('admin-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="px-3.5 py-2.5 text-left rounded-xl text-(--brand-text) font-semibold hover:bg-(--brand-soft) transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Control Console</span>
                </button>
              )}

              {currentUser && (
                <div className="pt-2 border-t border-(--border)">
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 text-left rounded-xl text-rose-600 font-semibold hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out ({currentUser.name})</span>
                  </button>
                </div>
              )}

              {/* Mobile Theme Selector */}
              <div className="pt-3 border-t border-(--border)">
                <span className="px-3 text-[11px] font-semibold text-(--foreground-muted) uppercase tracking-wider block mb-2">
                  Color Theme
                </span>
                <div className="grid grid-cols-3 gap-2 px-1">
                  <button
                    onClick={() => {
                      onSetTheme('white');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-colors ${theme === 'white'
                        ? 'bg-(--surface-soft) border-(--brand) text-(--foreground) font-semibold shadow-xs'
                        : 'border-(--border) text-(--foreground-secondary) hover:bg-(--surface-soft)'
                      }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500 mb-1" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetTheme('warm');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-colors ${theme === 'warm'
                        ? 'bg-amber-50/70 border-amber-600 text-amber-950 font-semibold shadow-xs'
                        : 'border-(--border) text-(--foreground-secondary) hover:bg-(--surface-soft)'
                      }`}
                  >
                    <Eye className="w-4 h-4 text-amber-700 mb-1" />
                    <span>Comfort</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetTheme('dark');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-xs font-medium transition-colors ${theme === 'dark'
                        ? 'bg-(--navy-section) border-(--brand) text-white font-semibold shadow-xs'
                        : 'border-(--border) text-(--foreground-secondary) hover:bg-(--surface-soft)'
                      }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400 mb-1" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};
