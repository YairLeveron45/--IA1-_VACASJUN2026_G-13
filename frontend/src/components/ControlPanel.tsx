import React from 'react';
import { Play, Pause, RotateCcw, Zap, StepForward } from 'lucide-react';

interface ControlPanelProps {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  mode: 'auto' | 'step';
  setMode: (mode: 'auto' | 'step') => void;
  isRunning: boolean;
  isPaused: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onStart,
  onPause,
  onReset,
  onStep,
  mode,
  setMode,
  isRunning,
  isPaused,
}) => {
  // Botón con gradiente negro-azul
  const btnGradient = 'bg-gradient-to-r from-black via-blue-900/80 to-blue-700/60 hover:from-blue-900/80 hover:via-blue-700/60 hover:to-blue-500/40 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20';

  return (
    <div className="glass-effect rounded-xl p-6 border border-neon-blue/10">
      <h3 className="text-sm font-semibold text-neon-blue/80 mb-4 tracking-wider uppercase flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Panel de Control
      </h3>

      {/* Botones de acción - Todos del mismo tamaño */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {!isRunning ? (
          <button
            onClick={onStart}
            className={`${btnGradient} flex items-center justify-center gap-2`}
          >
            <Play className="w-4 h-4" />
            Iniciar
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`${btnGradient} flex items-center justify-center gap-2`}
          >
            <Pause className="w-4 h-4" />
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>
        )}
        <button
          onClick={onReset}
          className={`${btnGradient} flex items-center justify-center gap-2`}
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </button>
        <button
          onClick={onStep}
          className={`${btnGradient} flex items-center justify-center gap-2`}
          disabled={!isRunning}
        >
          <StepForward className="w-4 h-4" />
          Paso
        </button>
      </div>

      {/* Selector de Modo */}
      <div className="flex gap-2 bg-black/40 rounded-lg p-1 border border-blue-500/10">
        <button
          onClick={() => setMode('auto')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                     ${mode === 'auto' 
                       ? 'bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                       : 'text-gray-400 hover:text-white hover:bg-blue-900/20'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            Automático
          </div>
        </button>
        <button
          onClick={() => setMode('step')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300
                     ${mode === 'step' 
                       ? 'bg-gradient-to-r from-blue-900/80 to-blue-700/60 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30' 
                       : 'text-gray-400 hover:text-white hover:bg-blue-900/20'}`}
        >
          <div className="flex items-center justify-center gap-2">
            <StepForward className="w-3.5 h-3.5" />
            Paso a Paso
          </div>
        </button>
      </div>

      {/* Indicador de estado */}
      <div className="mt-4 p-3 rounded-lg bg-black/40 border border-blue-500/10">
        <p className="text-xs text-gray-500 text-center font-mono">
          {isRunning 
            ? isPaused 
              ? ' Simulación pausada' 
              : ' Simulación en ejecución'
            : ' Simulación detenida'}
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;
