import React from 'react';
import { Package, Pause, Play, RotateCcw, StepForward, Zap } from 'lucide-react';
import SelectorModo from './SelectorModo';

interface PanelControlProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onResume?: () => void;
  onCargarObjetos: () => void;
  mode: 'auto' | 'step';
  setMode: (mode: 'auto' | 'step') => void;
  isRunning: boolean;
  isPaused: boolean;
}

const PanelControl: React.FC<PanelControlProps> = ({
  onStart,
  onPause,
  onReset,
  onStep,
  onResume,
  onCargarObjetos,
  mode,
  setMode,
  isRunning,
  isPaused,
}) => {
  const canStep = mode === 'step' && isRunning && !isPaused;
  const isLocked = isRunning || isPaused;

  const baseButton = 'min-h-[44px] rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-300 border flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed';
  const primaryButton = `${baseButton} bg-blue-600 hover:bg-blue-500 text-white border-blue-400/30 shadow-lg shadow-blue-500/20`;
  const resumeButton = `${baseButton} bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300/30 shadow-lg shadow-emerald-500/20`;
  const pauseButton = `${baseButton} bg-amber-600 hover:bg-amber-500 text-white border-amber-300/30 shadow-lg shadow-amber-500/20`;
  const secondaryButton = `${baseButton} bg-slate-900/80 hover:bg-slate-800 text-slate-100 border-blue-500/15 hover:border-blue-400/35`;
  const stepButton = `${baseButton} bg-cyan-700/90 hover:bg-cyan-600 text-white border-cyan-300/25 shadow-lg shadow-cyan-500/15`;

  const statusText = isPaused
    ? 'Pausada'
    : isRunning
      ? mode === 'step' ? 'Paso a paso' : 'Automatica'
      : 'Lista';

  return (
    <div className="glass-effect rounded-xl p-5 border border-neon-blue/10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-neon-blue/80 tracking-wider uppercase flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Control
        </h3>
        <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${
          isPaused
            ? 'text-amber-300 bg-amber-500/10 border-amber-400/20'
            : isRunning
              ? 'text-emerald-300 bg-emerald-500/10 border-emerald-400/20'
              : 'text-blue-300 bg-blue-500/10 border-blue-400/20'
        }`}>
          {statusText}
        </span>
      </div>

      <div className="space-y-3">
        {!isRunning && !isPaused && (
          <button onClick={onStart} className={`${primaryButton} w-full min-h-[52px] text-base`}>
            <Play className="w-5 h-5" />
            Iniciar simulacion
          </button>
        )}

        {isRunning && !isPaused && (
          <button onClick={onPause} className={`${pauseButton} w-full min-h-[52px] text-base`}>
            <Pause className="w-5 h-5" />
            Pausar simulacion
          </button>
        )}

        {isPaused && onResume && (
          <button onClick={onResume} className={`${resumeButton} w-full min-h-[52px] text-base`}>
            <Play className="w-5 h-5" />
            Reanudar simulacion
          </button>
        )}

        <SelectorModo mode={mode} setMode={setMode} />

        <div className="grid grid-cols-2 gap-3">
          <button onClick={onStep} className={stepButton} disabled={!canStep}>
            <StepForward className="w-4 h-4" />
            Siguiente
          </button>
          <button onClick={onReset} className={secondaryButton}>
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
        </div>

        <button
          onClick={onCargarObjetos}
          className={`${secondaryButton} w-full`}
          disabled={isLocked}
        >
          <Package className="w-4 h-4" />
          Nuevo mapa
        </button>
      </div>
    </div>
  );
};

export default PanelControl;
