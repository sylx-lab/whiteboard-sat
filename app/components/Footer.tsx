import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { NavView } from './Navbar';

interface FooterProps {
  onNavigate: (view: NavView) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="relative bg-[var(--brand-hover)] text-white border-t border-white/15 overflow-hidden">
      {/* Subtle Premium Architectural Grid (60px, 4% opacity, thin 1px lines) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none select-none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern 
            id="sat-arch-grid" 
            width="60" 
            height="60" 
            patternUnits="userSpaceOnUse"
          >
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              stroke="#FFFFFF" 
              strokeWidth="1" 
              strokeOpacity="0.06" 
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sat-arch-grid)" />
      </svg>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 space-y-16">
        {/* Top Brand Statement & Editorial Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end pb-12 border-b border-white/15">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-white text-[var(--brand-hover)] font-mono font-bold text-xs flex items-center justify-center tracking-wider shadow-xs">
                WB
              </div>
              <span className="text-[12px] font-mono font-bold uppercase tracking-widest text-teal-200">
                WHITE BOARD SAT
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Prepare with precision. <br />
              Progress with purpose.
            </h2>

            <p className="text-[14.5px] text-teal-50/90 max-w-2xl leading-relaxed font-normal">
              Structured digital SAT preparation built around focused practice, measurable performance, and continuous improvement.
            </p>
          </div>

          {/* Action Row */}
          <div className="lg:col-span-4 flex flex-wrap lg:justify-end items-center gap-3">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavigate('practice');
              }}
              className="px-6 py-3 bg-white hover:bg-teal-50 text-[var(--brand-hover)] font-bold text-[13.5px] rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Start Practicing</span>
              <ArrowRight className="w-4 h-4 text-[var(--brand-hover)]" />
            </button>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                onNavigate('courses');
              }}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-semibold text-[13.5px] transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            >
              Explore Courses
            </button>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-[13.5px]">
          {/* PRACTICE */}
          <div>
            <div className="text-[12px] font-mono font-bold tracking-widest text-white uppercase mb-4">
              Practice
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('practice');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Math Question Bank
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('practice');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Reading & Writing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('mock-tests');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Mock Tests
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('practice');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Domain Drills
                </button>
              </li>
            </ul>
          </div>

          {/* LEARNING */}
          <div>
            <div className="text-[12px] font-mono font-bold tracking-widest text-white uppercase mb-4">
              Learning
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('courses');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  SAT Math 800
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('courses');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Reading & Writing
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('courses');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Courses
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('resources');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Resources
                </button>
              </li>
            </ul>
          </div>

          {/* PLATFORM */}
          <div>
            <div className="text-[12px] font-mono font-bold tracking-widest text-white uppercase mb-4">
              Platform
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('dashboard');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('progress');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Analytics
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('progress');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Progress
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('pricing');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <div className="text-[12px] font-mono font-bold tracking-widest text-white uppercase mb-4">
              Company
            </div>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('about');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('about');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    onNavigate('pricing');
                  }}
                  className="text-teal-100 hover:text-white font-medium hover:translate-x-0.5 transition-all duration-150 cursor-pointer text-left inline-block"
                >
                  Verification
                </button>
              </li>
              <li>
                <span className="text-teal-200/90 font-mono text-xs">Dhaka, BD</span>
              </li>
            </ul>
          </div>

          {/* LEGAL / SAT DISCLAIMER */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4 lg:col-span-1">
            <div className="text-[12px] font-mono font-bold tracking-widest text-white uppercase mb-4">
              Legal
            </div>
            <p className="text-xs text-teal-100/85 leading-relaxed">
              SAT® is a trademark registered by the College Board, which is not affiliated with, and does not endorse, this product.
            </p>
            <div className="pt-3">
              <div className="text-xs text-teal-200 inline-flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>College Board Aligned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Copyright */}
        <div className="pt-6 mt-12 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-100/90">
          <div>
            &copy; 2026 White Board SAT. All rights reserved.
          </div>
          <div className="flex items-center gap-6 font-medium">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            <span className="text-white/30">|</span>
            <span className="font-mono text-[11.5px] font-bold tracking-wider text-teal-200">WB / SAT / 2026</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
