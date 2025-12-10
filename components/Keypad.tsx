import React from 'react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({ onKeyPress, onDelete, onClear }) => {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

  return (
    <div className="grid grid-cols-3 gap-3 p-4 pb-8 select-none">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onKeyPress(k)}
          className="h-16 rounded-2xl text-2xl font-medium text-slate-200 bg-slate-800 shadow-[0_2px_0_#0f172a] active:shadow-none active:translate-y-[2px] active:bg-slate-700 transition-all flex items-center justify-center hover:bg-slate-700 border border-slate-700/50"
        >
          {k}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="h-16 rounded-2xl text-slate-400 bg-slate-800 shadow-[0_2px_0_#0f172a] active:shadow-none active:translate-y-[2px] active:bg-slate-700 transition-all flex items-center justify-center hover:bg-slate-700 border border-slate-700/50"
      >
        <Delete className="w-7 h-7" />
      </button>
    </div>
  );
};