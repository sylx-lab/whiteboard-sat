'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../services/store';
import { PricingHub } from '../features/pricing/PricingHub';
import { PaymentModal } from '../components/PaymentModal';
import { AuthModal } from '../components/AuthModal';
import { ProductPlan } from '../types';

export default function PricingPage() {
  const store = useAppStore();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<ProductPlan | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleSelectPlan = (plan: ProductPlan) => {
    if (plan.price === 0) {
      router.push('/practice');
    } else {
      setSelectedPlan(plan);
      setIsPaymentOpen(true);
    }
  };

  return (
    <>
      <PricingHub
        plans={store.plans}
        currentUser={store.currentUser}
        onSelectPlan={handleSelectPlan}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        currentUser={store.currentUser}
        onSubmitPayment={store.submitPayment}
        onOpenAuth={() => {
          setIsPaymentOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={store.loginWithPhoneOrEmail}
        onRegister={store.registerUser}
        onForgotPassword={store.requestPasswordReset}
        onQuickRoleSelect={store.switchDemoRole}
      />
    </>
  );
}
