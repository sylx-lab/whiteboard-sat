'use client';

import React, { useState } from 'react';
import { useAppStore } from './services/store';
import { Navbar, NavView } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { ProductPlan } from './types';
import { LandingPage } from './features/landing/LandingPage';
import { PracticeHub } from './features/practice/PracticeHub';
import { MockTestsHub } from './features/mocktests/MockTestsHub';
import { CoursesHub } from './features/courses/CoursesHub';
import { StudentDashboard } from './features/dashboard/StudentDashboard';
import { ProgressAnalytics } from './features/analytics/ProgressAnalytics';
import { PricingHub } from './features/pricing/PricingHub';
import { AdminPanel } from './features/admin/AdminPanel';

export default function Home() {
  const store = useAppStore();
  const [currentView, setCurrentView] = useState<NavView>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<ProductPlan | null>(null);

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
            courses={store.courses}
            resources={store.resources}
            mockTests={store.mockTests}
            plans={store.plans}
            onVerifyPayment={store.verifyPayment}
            onRejectPayment={store.rejectPayment}
            onUpdateUserAccess={store.updateUserAccess}
            onToggleUserStatus={store.toggleUserStatus}
            onAddQuestion={store.addQuestion}
            onUpdateQuestion={store.updateQuestion}
            onDeleteQuestion={store.deleteQuestion}
            onAddCourse={store.addCourse}
            onUpdateCourse={store.updateCourse}
            onDeleteCourse={store.deleteCourse}
            onAddLessonToCourse={store.addLessonToCourse}
            onUpdateLessonInCourse={store.updateLessonInCourse}
            onDeleteLessonFromCourse={store.deleteLessonFromCourse}
            onAddResource={store.addResource}
            onUpdateResource={store.updateResource}
            onDeleteResource={store.deleteResource}
            onAddMockTest={store.addMockTest}
            onUpdateMockTest={store.updateMockTest}
            onDeleteMockTest={store.deleteMockTest}
          />
        )}
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
