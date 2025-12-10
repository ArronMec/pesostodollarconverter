import React from 'react';
import { TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center py-6 select-none">
      <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full shadow-xl shadow-black/20 border border-slate-800">
        <div className="bg-brand-600 p-1 rounded-full shadow-lg shadow-brand-500/20">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-sm font-bold text-slate-200 tracking-tight">PesoPro</h1>
      </div>
    </header>
  );
};