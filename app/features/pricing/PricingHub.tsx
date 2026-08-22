import React from 'react';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { ProductPlan, UserProfile } from '../../types';

interface PricingHubProps {
  plans: ProductPlan[];
  currentUser: UserProfile | null;
  onSelectPlan: (plan: ProductPlan) => void;
}

export const PricingHub: React.FC<PricingHubProps> = ({ plans, onSelectPlan }) => {
  return (
    <div className="bg-[#FFFFFF] min-h-[calc(100vh-70px)] py-12">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-in fade-in duration-200">
        {/* Editorial Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="text-[11.5px] font-[650] uppercase tracking-[0.08em] text-[#0D918A] font-mono">
            TRANSPARENT PASSES
          </div>
          <h1 className="text-3xl sm:text-[38px] font-extrabold text-[#071126] tracking-tight leading-tight">
            Choose the right path to your target score.
          </h1>
          <p className="text-[14px] text-[#58708A] leading-[1.55]">
            Start free, specialize by section, or unlock the complete White Board SAT system.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const isFeatured = plan.isFeatured;
            const isFree = plan.price === 0;

            return (
              <div
                key={plan.id}
                className={`rounded-[16px] p-6 flex flex-col justify-between h-full transition-all duration-160 relative ${isFeatured
                    ? 'bg-[#F1F8F7] border border-[#0D918A]/40 shadow-xs hover:-translate-y-0.5'
                    : 'bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0D918A]/50 hover:-translate-y-0.5'
                  }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#087C76] text-white rounded-md text-[10px] font-bold tracking-widest uppercase shadow-xs">
                    RECOMMENDED
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-[18px] font-[650] text-[#071126] tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-[13.5px] text-[#58708A] mt-1 leading-[1.5]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Area */}
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[36px] font-[650] font-mono text-[#071126] tracking-tight">
                        {isFree ? 'Free' : `৳${plan.price.toLocaleString()}`}
                      </span>
                      {!isFree && (
                        <span className="text-[12.5px] text-[#58708A] font-medium">
                          / One-time access
                        </span>
                      )}
                    </div>
                    {isFree ? (
                      <div className="text-[12.5px] text-[#0D918A] font-semibold mt-0.5">
                        Forever free
                      </div>
                    ) : plan.originalPrice && plan.originalPrice > plan.price ? (
                      <div className="text-[12.5px] text-slate-400 line-through mt-0.5 font-mono">
                        Regular: ৳{plan.originalPrice.toLocaleString()}
                      </div>
                    ) : null}
                  </div>

                  {/* Features List */}
                  <div className="pt-4 border-t border-[#E2E8F0] space-y-2.5">
                    <div className="text-[11.5px] uppercase font-[650] tracking-[0.06em] text-[#071126]">
                      Included in Pass
                    </div>
                    <div className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#087C76] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                          </div>
                          <span className="text-[13.5px] text-[#58708A] leading-[1.45]">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6 mt-auto">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className={`w-full py-2.5 rounded-[10px] font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer group/btn ${isFeatured
                        ? 'bg-[#087C76] hover:bg-[#066F6A] text-white shadow-xs'
                        : isFree
                          ? 'bg-white hover:bg-slate-50 text-[#071126] border border-[#E2E8F0]'
                          : 'bg-[#080D21] hover:bg-[#087C76] text-white shadow-xs'
                      }`}
                  >
                    <span>
                      {isFree ? 'Current Tier' : plan.id === 'master' ? 'Get Full Access' : `Get ${plan.name.replace('Pass', '').trim()} Pass`}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="p-6 bg-white rounded-[16px] border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#F1F8F7] text-[#087C76] flex items-center justify-center border border-teal-200 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-[650] text-[#071126] text-sm">Direct Human Verification</div>
              <div className="text-[13px] text-[#58708A] mt-0.5">All mobile wallet and bank transfers are verified within 15–30 minutes by our admin team.</div>
            </div>
          </div>

          <div className="text-[13px] text-[#58708A] font-mono shrink-0 bg-[#F1F8F7] px-4 py-2 rounded-[10px] border border-[#E2E8F0]">
            Support Hotline: <strong className="text-[#071126] font-semibold">+880 1712 345678</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
