import React from 'react';
import { ArrowLeftRight, Cloud, PartyPopper } from 'lucide-react';

interface OnboardingProps {
  onContinue: () => void;
}

const benefits = [
  {
    icon: ArrowLeftRight,
    title: 'Instant Currency Conversions',
    description: 'Easily convert from US Dollars to Mexican Pesos.',
  },
  {
    icon: Cloud,
    title: '24/7 Live Updates',
    description: 'Get access to the latest currency conversion rates with premium.',
  },
  {
    icon: PartyPopper,
    title: 'Ad-Free Experience',
    description: 'Thank you for downloading my app, I hope you enjoy it :)',
  },
] as const;

export const Onboarding: React.FC<OnboardingProps> = ({ onContinue }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100 px-6 pt-6 pb-10">
      <div className="flex flex-col h-full max-w-2xl mx-auto gap-4">
        <div className="space-y-6 text-center pb-2 pt-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-black leading-tight text-white">
              Welcome to...
            </h1>
          </div>
        </div>

        <div className="flex-1 space-y-12">
          {benefits.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <Icon className="w-7 h-7 text-emerald-400" strokeWidth={1.75} />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white text-xl">{title}</p>
                <p className="text-base text-slate-400">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full pb-4">
          <button
            onClick={onContinue}
            className="w-full py-5 bg-emerald-500 text-slate-950 font-semibold text-lg rounded-2xl hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 transition-all shadow-[0_15px_60px_rgba(16,185,129,0.35)]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

