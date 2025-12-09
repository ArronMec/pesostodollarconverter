import React, { useEffect, useState, useCallback } from 'react';
import { fetchExchangeRates } from './services/currencyService';
import { ConversionState } from './types';
import { Converter } from './components/Converter';
import { CurrencyChart } from './components/CurrencyChart';
import { ArrowDown } from 'lucide-react';
import { Onboarding } from './components/Onboarding';

const App: React.FC = () => {
  const [state, setState] = useState<ConversionState>({
    amount: '1',
    from: 'USD' as any,
    to: 'MXN' as any,
    rate: null,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const init = useCallback(async () => {
    setLoading(true);
    // Caching strategy: Store rate for 4 hours to minimize API hits.
    const cached = localStorage.getItem('pesoPro_rate');
    const cachedTime = localStorage.getItem('pesoPro_time');
    
    const now = new Date().getTime();
    const fourHours = 4 * 60 * 60 * 1000;

    if (cached && cachedTime && (now - parseInt(cachedTime) < fourHours)) {
        setState(prev => ({
            ...prev,
            rate: parseFloat(cached),
            lastUpdated: new Date(parseInt(cachedTime)).toISOString()
        }));
        setLoading(false);
    } else {
        // Fetch fresh
        const data = await fetchExchangeRates();
        if (data && data.rates && data.rates.MXN) {
            setState(prev => ({
                ...prev,
                rate: data.rates.MXN,
                lastUpdated: data.time_last_update_utc
            }));
            localStorage.setItem('pesoPro_rate', data.rates.MXN.toString());
            localStorage.setItem('pesoPro_time', now.toString());
        }
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    // Check if user has already completed onboarding
    const seen = localStorage.getItem('pesoPro_onboarding_seen');
    if (seen === 'true') {
      setShowOnboarding(false);
    }
  }, []);

  const handleCompleteOnboarding = () => {
    // Mark onboarding as completed
    localStorage.setItem('pesoPro_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding ? (
        <Onboarding onContinue={handleCompleteOnboarding} />
      ) : (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-slate-100">
      <main className="flex-grow flex flex-col items-center px-4 pb-6 w-full max-w-md mx-auto gap-6">
          
          {/* Navigation Bar - Top of Page */}
          <nav className="flex items-center justify-center gap-2 pt-6 pb-4 w-full px-4">
            <a 
              href="https://pesopro-curreny-converter.vercel.app"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors font-medium rounded-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
            >
              Home
            </a>
            <a 
              href="https://pesopro-curreny-converter.vercel.app/privacy-policy.html"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors font-medium rounded-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
            >
              Privacy Policy
            </a>
            <a 
              href="https://pesopro-curreny-converter.vercel.app/terms-of-service.html"
              className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors font-medium rounded-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700"
            >
              Terms of Service
            </a>
          </nav>

          {/* Main Converter Card */}
          <div className="w-full flex-none">
            {loading || !state.rate ? (
                <div className="h-96 w-full bg-slate-900 rounded-3xl animate-pulse shadow-xl border border-slate-800"></div>
            ) : (
                <Converter 
                    rate={state.rate} 
                    onAmountChange={() => {}}
                />
            )}
          </div>

          {/* Divider / More Button */}
          <div className="w-full flex items-center gap-4">
              <div className="h-px bg-slate-800 flex-grow"></div>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 hover:text-brand-400 transition-colors py-2"
              >
                  {showDetails ? 'Hide Graph' : 'View Trend Graph'} <ArrowDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
              <div className="h-px bg-slate-800 flex-grow"></div>
          </div>

          {/* Expanded Details */}
          {showDetails && state.rate && (
              <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <CurrencyChart currentRate={state.rate} />
                  
                  <div className="text-center pb-8">
                     <p className="text-[10px] text-slate-600">
                        Last Updated: {state.lastUpdated ? new Date(state.lastUpdated).toLocaleString() : '...'}
                     </p>
                  </div>
              </div>
          )}

      </main>
    </div>
      )}
    </>
  );
};

export default App;