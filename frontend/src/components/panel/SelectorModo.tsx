import React from 'react';
import { Zap, StepForward } from 'lucide-react';

interface SelectorModoProps {
  mode: 'auto' | 'step';
  setMode: (mode: 'auto' | 'step') => void;
  disabled?: boolean;
}

const SelectorModo: React.FC<SelectorModoProps> = ({ mode, setMode, disabled = false }) => {
  return (
    <div className="flex gap-2 bg-black/40 rounded-lg p-1 border border-blue-500/10">
      <button
        onClick={() => setMode('auto')}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                   ${mode === 'auto' 
                     ? 'bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                     : 'text-gray-400 hover:text-white hover:bg-blue-900/20'}
                   disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-3.5 h-3.5" />
          Automático
        </div>
      </button>
      <button
        onClick={() => setMode('step')}
        disabled={disabled}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                   ${mode === 'step' 
                     ? 'bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                     : 'text-gray-400 hover:text-white hover:bg-blue-900/20'}
                   disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <div className="flex items-center justify-center gap-2">
          <StepForward className="w-3.5 h-3.5" />
          Paso a Paso
        </div>
      </button>
    </div>
  );
};

export default SelectorModo;
