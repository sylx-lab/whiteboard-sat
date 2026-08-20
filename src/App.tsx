import React, { Suspense, lazy, useState } from 'react';
import { useAppStore } from './services/store';
import { Navbar, NavView } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { ProductPlan } from './types';

// Route-level code splitting: each hub is its own chunk so the initial load
// only ships the landing page instead of the entire app (practice engine,
// mock test player, admin panel, three.js hero scene, etc. all bundled in
// one 1.2MB+ file). This meaningfully improves first paint, especially on
// mobile connections.
const LandingPage = lazy(() => import('./features/landing/LandingPage').then((m) => ({ default: m.LandingPage })));
const PracticeHub = lazy(() => import('./features/practice/PracticeHub').then((m) => ({ default: m.PracticeHub })));
const MockTestsHub = lazy(() => import('./features/mocktests/MockTestsHub').then((m) => ({ default: m.MockTestsHub })));
const CoursesHub = lazy(() => import('./features/courses/CoursesHub').then((m) => ({ default: m.CoursesHub })));
const StudentDashboard = lazy(() => import('./features/dashboard/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const ProgressAnalytics = lazy(() => import('./features/analytics/ProgressAnalytics').then((m) => ({ default: m.ProgressAnalytics })));
const PricingHub = lazy(() => import('./features/pricing/PricingHub').then((m) => ({ default: m.PricingHub })));
const AdminPanel = lazy(() => import('./features/admin/AdminPanel').then((m) => ({ default: m.AdminPanel })));

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-teal-200 border-t-teal-600 animate-spin" />
        <span className="text-sm text-slate-400 font-medium">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  const store = useAppStore();
  const [currentView, setCurrentView] = useState<NavView>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<ProductPlan | null>(null);

  const handleOpenPricingModal = (plan?: ProductPlan) => {
    if (plan) {
      setSelectedPlanForPayment(plan);
      setIsPaymentModalOpen(true);
    } else {
      setCurrentView('pricing');
    }
  };

  const handleSelectPlan = (plan: ProductPlan) => {
    if (plan.price === 0) {
      setCurrentView('practice');
    } else {
      setSelectedPlanForPayment(plan);
      setIsPaymentModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-canvas text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        currentUser={store.currentUser}
        theme={store.theme}
        onSetTheme={store.setTheme}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={store.logout}
        onSwitchRole={store.switchDemoRole}
      />

      {/* Main Dynamic View Outlet */}
      <main className="flex-1">
      <Suspense fallback={<RouteLoadingFallback />}>
        {(currentView === 'home' || currentView === 'about') && (
          <LandingPage
            onNavigate={(view) => setCurrentView(view)}
            onOpenPricing={() => setCurrentView('pricing')}
          />
        )}

        {currentView === 'practice' && (
          <PracticeHub
            questions={store.questions}
            currentUser={store.currentUser}
            hasAccessToQuestion={store.hasAccessToQuestion}
            onLogAttempt={store.logPracticeAttempt}
            onOpenPricing={() => setCurrentView('pricing')}
          />
        )}

        {currentView === 'mock-tests' && (
          <MockTestsHub
            mockTests={store.mockTests}
            mockAttempts={store.mockTestAttempts}
            currentUser={store.currentUser}
            hasAccessToMockTest={store.hasAccessToMockTest}
            onSaveAttempt={store.saveMockTestAttempt}
            onFinalizeTest={store.finalizeMockTestAttempt}
            onOpenPricing={() => setCurrentView('pricing')}
          />
        )}

        {(currentView === 'courses' || currentView === 'my-courses' || currentView === 'course-detail' || currentView === 'resources') && (
          <CoursesHub
            courses={store.courses}
            currentUser={store.currentUser}
            hasAccessToCourse={store.hasAccessToCourse}
            courseProgress={store.courseProgress}
            onToggleLessonComplete={store.toggleLessonCompleted}
            onOpenPricing={() => setCurrentView('pricing')}
          />
        )}

        {(currentView === 'dashboard' || currentView === 'account') && (
          store.currentUser ? (
            <StudentDashboard
              currentUser={store.currentUser}
              courses={store.courses}
              practiceAttempts={store.practiceAttempts}
              totalQuestionsAttempted={store.totalQuestionsAttempted}
              totalCorrect={store.totalCorrect}
              overallAccuracy={store.overallAccuracy}
              totalTimeSpentMinutes={store.totalTimeSpentMinutes}
              domainStats={store.domainStats}
              onNavigate={(view) => setCurrentView(view)}
              onOpenPricing={() => setCurrentView('pricing')}
            />
          ) : (
            <LandingPage
              onNavigate={(view) => setCurrentView(view)}
              onOpenPricing={() => setCurrentView('pricing')}
            />
          )
        )}

        {currentView === 'progress' && (
          <ProgressAnalytics
            currentUser={store.currentUser}
            practiceAttempts={store.practiceAttempts}
            mockAttempts={store.mockTestAttempts}
            domainStats={store.domainStats}
            overallAccuracy={store.overallAccuracy}
            totalTimeSpentMinutes={store.totalTimeSpentMinutes}
            onNavigate={(view) => setCurrentView(view)}
          />
        )}

        {currentView === 'pricing' && (
          <PricingHub
            plans={store.plans}
            currentUser={store.currentUser}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {currentView.startsWith('admin') && (
          <AdminPanel
            currentUser={store.currentUser}
            payments={store.payments}
            users={store.allUsers}
            questions={store.questions}
            plans={store.plans}
            onVerifyPayment={store.verifyPayment}
            onRejectPayment={store.rejectPayment}
            onUpdateUserAccess={store.updateUserAccess}
            onToggleUserStatus={store.toggleUserStatus}
            onAddQuestion={store.addQuestion}
          />
        )}
      </Suspense>
      </main>

      {/* Global Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={store.loginWithPhoneOrEmail}
        onRegister={store.registerUser}
        onQuickRoleSelect={store.switchDemoRole}
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
}
