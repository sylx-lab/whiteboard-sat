'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from './features/landing/LandingPage';
import { NavView } from './components/Navbar';

export default function Home() {
  const router = useRouter();

  const handleNavigate = (view: NavView) => {
    switch (view) {
      case 'practice':
        router.push('/practice');
        break;
      case 'mock-tests':
        router.push('/mock-tests');
        break;
      case 'courses':
        router.push('/courses');
        break;
      case 'pricing':
        router.push('/pricing');
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      default:
        router.push('/');
        break;
    }
  };

  return (
    <LandingPage
      onNavigate={handleNavigate}
      onOpenPricing={() => router.push('/pricing')}
    />
  );
}
