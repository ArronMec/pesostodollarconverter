import React, { useEffect, useState, useCallback } from 'react';
import { fetchExchangeRates } from './services/currencyService';
import { ConversionState } from './types';
import { Converter } from './components/Converter';
import { CurrencyChart } from './components/CurrencyChart';
import { ArrowDown } from 'lucide-react';

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

  const init = useCallback(async () => {
    // Caching strategy: Store rate for 4 hours to minimize API hits.
    const cached = localStorage.getItem('pesoPro_rate');
    const cachedTime = localStorage.getItem('pesoPro_time');
    
    const now = new Date().getTime();
    const fourHours = 4 * 60 * 60 * 1000;

    // Load cached rate immediately to prevent glitch
    if (cached && cachedTime && (now - parseInt(cachedTime) < fourHours)) {
        setState(prev => ({
            ...prev,
            rate: parseFloat(cached),
            lastUpdated: new Date(parseInt(cachedTime)).toISOString()
        }));
        setLoading(false);
        // Fetch fresh in background for next time
        fetchExchangeRates().then(data => {
            if (data && data.rates && data.rates.MXN) {
                setState(prev => ({
                    ...prev,
                    rate: data.rates.MXN,
                    lastUpdated: data.time_last_update_utc
                }));
                localStorage.setItem('pesoPro_rate', data.rates.MXN.toString());
                localStorage.setItem('pesoPro_time', now.toString());
            }
        });
    } else {
        // Use cached rate even if expired, then update
        if (cached) {
            setState(prev => ({
                ...prev,
                rate: parseFloat(cached),
                lastUpdated: cachedTime ? new Date(parseInt(cachedTime)).toISOString() : null
            }));
            setLoading(false);
        }
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

  // Onboarding disabled for web version

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="w-full bg-slate-950 border-b border-slate-800">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white text-center">Pesos to Dollar Converter</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center px-4 pb-6 w-full max-w-md mx-auto gap-6">
          
          {/* Navigation Bar - Top of Page */}
          <nav className="flex items-center justify-center gap-2 pt-4 pb-4 w-full px-4">
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
            {state.rate ? (
                <Converter 
                    rate={state.rate} 
                    onAmountChange={() => {}}
                />
            ) : (
                <div className="h-96 w-full bg-slate-900 rounded-3xl shadow-xl border border-slate-800 flex items-center justify-center">
                    <p className="text-slate-400">Loading exchange rate...</p>
                </div>
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
  );
};

export default App;