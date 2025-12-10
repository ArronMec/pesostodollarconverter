import React, { useEffect, useState } from 'react';
import { ArrowUpDown, RotateCcw } from 'lucide-react';
import { Keypad } from './Keypad';

interface ConverterProps {
  rate: number;
  onAmountChange: (amount: number) => void;
}

export const Converter: React.FC<ConverterProps> = ({ rate, onAmountChange }) => {
  const [inputValue, setInputValue] = useState<string>('10');
  const [activeCurrency, setActiveCurrency] = useState<'USD' | 'MXN'>('MXN');

  // Compute values
  const numericInput = parseFloat(inputValue) || 0;
  
  let usdValue = 0;
  let mxnValue = 0;

  if (activeCurrency === 'USD') {
    usdValue = numericInput;
    mxnValue = numericInput * rate;
  } else {
    mxnValue = numericInput;
    usdValue = numericInput / rate;
  }

  useEffect(() => {
    onAmountChange(usdValue);
  }, [usdValue, onAmountChange]);

  const handleKeyPress = (key: string) => {
    // If current value is "0" and user types a digit, replace it
    if (inputValue === '0' && key !== '.') {
        setInputValue(key);
        return;
    }
    // If current value is a small decimal (like "0.50") and user types a digit, replace it
    // This allows users to start typing a new number after currency switch
    if (key !== '.' && /^0\.\d+$/.test(inputValue)) {
        setInputValue(key);
        return;
    }
    if (key === '.' && inputValue.includes('.')) return;
    if (inputValue.length > 10) return; // Max length
    setInputValue((prev) => prev + key);
  };

  const handleDelete = () => {
    if (inputValue.length <= 1) {
        setInputValue('0');
    } else {
        setInputValue((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setInputValue('0');
  }

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
  };

  const formatInputDisplay = (val: string) => {
    if (val.endsWith('.')) return val;
    const parts = val.split('.');
    const intPart = parseInt(parts[0] || '0').toLocaleString('en-US');
    return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
  };

  const formatInputValue = (num: number): string => {
    if (num === 0) return '0';
    // Use toFixed to preserve up to 10 decimal places, then remove trailing zeros
    const str = num.toFixed(10);
    // Remove trailing zeros and the decimal point if it's a whole number
    return str.replace(/\.?0+$/, '');
  };

  const getDisplayFontClass = (val: string) => {
    const digitCount = val.replace(/[^\d]/g, '').length;
    if (digitCount <= 6) return 'text-5xl';
    if (digitCount <= 8) return 'text-4xl';
    if (digitCount <= 10) return 'text-[2.35rem]';
    return 'text-3xl';
  };

  const handleCurrencyChange = (newCurrency: 'USD' | 'MXN') => {
    if (activeCurrency === newCurrency) return;
    
    // Update inputValue to the current value of the currency being switched to
    // This ensures continuity when switching between currencies
    if (newCurrency === 'USD') {
      const currentUsdValue = activeCurrency === 'MXN' ? numericInput / rate : numericInput;
      setInputValue(formatInputValue(currentUsdValue));
    } else {
      const currentMxnValue = activeCurrency === 'USD' ? numericInput * rate : numericInput;
      setInputValue(formatInputValue(currentMxnValue));
    }
    
    setActiveCurrency(newCurrency);
  };

  const usdPerMxn = rate ? 1 / rate : 0;

  const mxnDisplay = activeCurrency === 'MXN' ? formatInputDisplay(inputValue) : formatNumber(mxnValue);
  const usdDisplay = activeCurrency === 'USD' ? formatInputDisplay(inputValue) : formatNumber(usdValue);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800">
      
      {/* Display Area */}
      <div className="flex-grow flex flex-col justify-center p-6 space-y-4 bg-slate-900 relative">
        
        {/* Rate Indicator */}
        <div className="absolute top-4 left-0 w-full text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               1 MXN ≈ {usdPerMxn.toFixed(4)} USD
            </span>
        </div>

        {/* MXN Row */}
        <div 
            onClick={() => handleCurrencyChange('MXN')}
            className={`
                relative flex flex-col p-4 rounded-2xl transition-all duration-200 cursor-pointer border-2
                ${activeCurrency === 'MXN' 
                    ? 'bg-brand-900/10 border-brand-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] scale-[1.02]' 
                    : 'bg-transparent border-transparent hover:bg-slate-800/50'}
            `}
        >
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🇲🇽</span>
                    <span className={`font-bold text-sm tracking-wider ${activeCurrency === 'MXN' ? 'text-brand-400' : 'text-slate-500'}`}>MXN</span>
                </div>
            </div>
            <div className={`text-right font-mono font-bold tracking-tight truncate ${getDisplayFontClass(mxnDisplay)} ${activeCurrency === 'MXN' ? 'text-white' : 'text-slate-500'}`}>
                <span className="text-2xl align-top opacity-50 mr-1">$</span>
                {mxnDisplay}
            </div>
        </div>

        {/* Divider / Swap Indicator */}
        <div className="relative h-px bg-slate-800 flex justify-center items-center my-2">
            <div className="bg-slate-900 p-1 rounded-full border border-slate-800">
                <ArrowUpDown className="w-4 h-4 text-slate-600" />
            </div>
        </div>

        {/* USD Row */}
        <div 
            onClick={() => handleCurrencyChange('USD')}
            className={`
                relative flex flex-col p-4 rounded-2xl transition-all duration-200 cursor-pointer border-2
                ${activeCurrency === 'USD' 
                    ? 'bg-brand-900/10 border-brand-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] scale-[1.02]' 
                    : 'bg-transparent border-transparent hover:bg-slate-800/50'}
            `}
        >
            <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🇺🇸</span>
                    <span className={`font-bold text-sm tracking-wider ${activeCurrency === 'USD' ? 'text-brand-400' : 'text-slate-500'}`}>USD</span>
                </div>
            </div>
            <div className={`text-right font-mono font-bold tracking-tight truncate ${getDisplayFontClass(usdDisplay)} ${activeCurrency === 'USD' ? 'text-white' : 'text-slate-500'}`}>
                <span className="text-2xl align-top opacity-50 mr-1">$</span>
                {usdDisplay}
            </div>
        </div>

        {/* Actions Row - Clear Button */}
        <div className="flex justify-end px-2 pt-4">
            <button 
                onClick={handleClear}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg border border-slate-700/50"
            >
                <RotateCcw className="w-4 h-4" /> Clear
            </button>
        </div>
      </div>

      {/* Keypad Area */}
      <div className="bg-slate-950/30 border-t border-slate-800">
        <Keypad onKeyPress={handleKeyPress} onDelete={handleDelete} onClear={handleClear} />
      </div>
    </div>
  );
};