import React from 'react';

interface QuickTableProps {
  rate: number;
}

export const QuickTable: React.FC<QuickTableProps> = ({ rate }) => {
  const amounts = [1, 5, 10, 20, 50, 100];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm sticky top-0">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          🇺🇸 USD <span className="text-slate-300">→</span> 🇲🇽 MXN
        </h3>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-100">
        <div className="divide-y divide-slate-50">
            {amounts.map(amount => (
                <div key={`usd-${amount}`} className="px-4 py-2 text-sm text-slate-600 flex justify-between">
                    <span className="font-semibold">${amount}</span>
                    <span className="text-slate-400">→</span>
                </div>
            ))}
        </div>
        <div className="divide-y divide-slate-50 bg-brand-50/30">
            {amounts.map(amount => (
                <div key={`mxn-${amount}`} className="px-4 py-2 text-sm font-bold text-brand-700 text-right">
                    ${(amount * rate).toFixed(0)}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};