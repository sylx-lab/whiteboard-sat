'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { Navbar, NavView } from './Navbar';
import { Footer } from './Footer';
import { AuthModal } from './AuthModal';
import { PaymentModal } from './PaymentModal';
import { ProductPlan } from '../types';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useAppStore();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<ProductPlan | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = pathname.startsWith('/admin');

  // Map URL pathname to NavView for Navbar active highlights
  const getCurrentNavView = (): NavView => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/practice')) return 'practice';
    if (pathname.startsWith('/mock-tests')) return 'mock-tests';
    if (pathname.startsWith('/leaderboard')) return 'leaderboard';
    if (pathname.startsWith('/courses')) return 'courses';
    if (pathname.startsWith('/resources')) return 'resources';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/progress')) return 'progress';
    if (pathname.startsWith('/pricing')) return 'pricing';
    if (pathname.startsWith('/admin')) return 'admin-dashboard';
    return 'home';
  };

  const handleNavigate = (view: NavView) => {
    switch (view) {
      case 'home':
      case 'about':
        router.push('/');
        break;
      case 'practice':
        router.push('/practice');
        break;
      case 'mock-tests':
        router.push('/mock-tests');
        break;
      case 'leaderboard':
        router.push('/leaderboard');
        break;
      case 'courses':
      case 'my-courses':
      case 'course-detail':
      case 'resources':
        router.push('/courses');
        break;
      case 'dashboard':
      case 'account':
        router.push('/dashboard');
        break;
      case 'progress':
        router.push('/progress');
        break;
      case 'pricing':
        router.push('/pricing');
        break;
      case 'admin-dashboard':
      case 'admin-students':
      case 'admin-questions':
      case 'admin-purchases':
        router.push('/admin');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const handleSelectPlan = (plan: ProductPlan) => {
    if (plan.price === 0) {
      router.push('/practice');
    } else {
      setSelectedPlanForPayment(plan);
      setIsPaymentModalOpen(true);
    }
  };

  // Dedicated Admin layout without student Navbar or Footer.
  // Literal colours on purpose: the console is light-only, so it does not follow
  // the student app's white / warm / dark modes.
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
        <main className="min-h-screen">{children}</main>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={store.loginWithPhoneOrEmail}
          onRegister={store.registerUser}
          onForgotPassword={store.requestPasswordReset}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-app-canvas text-[var(--foreground)] selection:bg-teal-100 selection:text-teal-900">
      {/* Global Navigation Bar */}
      <Navbar
        currentView={getCurrentNavView()}
        onNavigate={handleNavigate}
        currentUser={mounted ? store.currentUser : null}
        theme={mounted ? store.theme : 'white'}
        onSetTheme={store.setTheme}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={store.logout}
      />

      {/* Main Next.js Page Route Outlet */}
      <main className="flex-1">{children}</main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={store.loginWithPhoneOrEmail}
        onRegister={store.registerUser}
        onForgotPassword={store.requestPasswordReset}
      />

      {/* Payment & Manual Verification Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPlanForPayment(null);
        }}
        plan={selectedPlanForPayment}
        currentUser={store.currentUser}
        onSubmitPayment={store.submitPayment}
        onOpenAuth={() => {
          setIsPaymentModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
};
