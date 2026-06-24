import React from 'react';
import { StepForward, Zap } from 'lucide-react';

interface SelectorModoProps {
  mode: 'auto' | 'step';
  setMode: (mode: 'auto' | 'step') => void;
  disabled?: boolean;
}

const SelectorModo: React.FC<SelectorModoProps> = ({ mode, setMode, disabled = false }) => {
  const optionClass = 'min-h-[54px] rounded-lg px-3 text-sm font-semibold transition-all duration-300 border flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const activeClass = 'bg-blue-600/90 text-white border-blue-300/30 shadow-lg shadow-blue-500/15';
  const inactiveClass = 'bg-black/30 text-gray-400 border-blue-500/10 hover:text-white hover:bg-blue-900/30';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">
          Modo
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('auto')}
          disabled={disabled}
          className={`${optionClass} ${mode === 'auto' ? activeClass : inactiveClass}`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          Auto
        </button>
        <button
          onClick={() => setMode('step')}
          disabled={disabled}
          className={`${optionClass} ${mode === 'step' ? activeClass : inactiveClass}`}
        >
          <StepForward className="w-4 h-4 shrink-0" />
          Paso
        </button>
      </div>
    </div>
  );
};

export default SelectorModo;
