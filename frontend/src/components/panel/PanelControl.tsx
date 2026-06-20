import React from 'react';
import { Zap, StepForward, Pause, Package } from 'lucide-react';
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
  // Determinar qué botones mostrar
  const showStart = !isRunning && !isPaused;
  const showPause = isRunning && !isPaused;
  const showResume = isRunning && isPaused;
  const showStep = mode === 'step' && isRunning && !isPaused;

  // Estilo unificado para todos los botones (negro-azul)
  const btnStyle = 'flex-1 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-blue-700/40 hover:from-blue-800/80 hover:via-blue-700/60 hover:to-blue-600/40 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

  // Estilo para botón de pausa (amarillo)
  const pauseBtnStyle = 'flex-1 bg-gradient-to-r from-yellow-800/80 via-yellow-700/60 to-yellow-600/40 hover:from-yellow-700/80 hover:via-yellow-600/60 hover:to-yellow-500/40 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 border border-yellow-500/20 hover:border-yellow-400/40 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

  return (
    <div className="glass-effect rounded-xl p-6 border border-neon-blue/10">
      <h3 className="text-sm font-semibold text-neon-blue/80 mb-4 tracking-wider uppercase flex items-center gap-2">
        <Zap className="w-4 h-4" />
        Panel de Control
      </h3>

      {/* Botones de acción - Grid 3 columnas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {showStart && (
          <button onClick={onStart} className={btnStyle}>
            <Zap className="w-4 h-4" />
            Iniciar
          </button>
        )}
        {showPause && (
          <button onClick={onPause} className={pauseBtnStyle}>
            <Pause className="w-4 h-4" />
            Pausar
          </button>
        )}
        {showResume && onResume && (
          <button onClick={onResume} className={btnStyle}>
            <Zap className="w-4 h-4" />
            Reanudar
          </button>
        )}
        {!showStart && !showPause && !showResume && (
          <div className="flex-1 bg-gradient-to-r from-gray-800/30 to-gray-700/20 text-gray-500 font-semibold px-4 py-2.5 rounded-lg border border-gray-500/10 flex items-center justify-center gap-2 cursor-not-allowed opacity-50 min-h-[44px]">
            <span className="text-sm">▶️</span>
            Ejecutando
          </div>
        )}
        
        <button onClick={onReset} className={btnStyle}>
          <Zap className="w-4 h-4" />
          Reiniciar
        </button>
        
        {showStep && (
          <button onClick={onStep} className={btnStyle}>
            <StepForward className="w-4 h-4" />
            Siguiente
          </button>
        )}
        {!showStep && mode === 'step' && isRunning && isPaused && (
          <div className="flex-1 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 text-yellow-500/40 font-semibold px-4 py-2.5 rounded-lg border border-yellow-500/10 flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]">
            <StepForward className="w-4 h-4" />
            En pausa
          </div>
        )}
        {mode === 'auto' && isRunning && !isPaused && (
          <div className="flex-1 bg-gradient-to-r from-green-900/20 to-green-800/10 text-green-500/40 font-semibold px-4 py-2.5 rounded-lg border border-green-500/10 flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]">
            <Zap className="w-4 h-4" />
            Automático
          </div>
        )}
        {!isRunning && !isPaused && mode === 'step' && (
          <div className="flex-1 bg-gradient-to-r from-blue-900/20 to-blue-800/10 text-blue-500/40 font-semibold px-4 py-2.5 rounded-lg border border-blue-500/10 flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]">
            <StepForward className="w-4 h-4" />
            Esperando
          </div>
        )}
        {!isRunning && !isPaused && mode === 'auto' && (
          <div className="flex-1 bg-gradient-to-r from-gray-800/20 to-gray-700/10 text-gray-500/40 font-semibold px-4 py-2.5 rounded-lg border border-gray-500/10 flex items-center justify-center gap-2 cursor-not-allowed min-h-[44px]">
            <Zap className="w-4 h-4" />
            Listo
          </div>
        )}
      </div>

      {/* Botón Cargar Objetos - Ocupa todo el ancho - Estilo negro-azul */}
      <div className="mb-6">
        <button 
          onClick={onCargarObjetos} 
          className="w-full bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-blue-700/40 hover:from-blue-800/80 hover:via-blue-700/60 hover:to-blue-600/40 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 border border-blue-500/20 hover:border-blue-400/40 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          disabled={isRunning}
        >
          <Package className="w-4 h-4" />
          Cargar Objetos Aleatorios
        </button>
        {isRunning && (
          <p className="text-[10px] text-yellow-500/60 text-center mt-1">
             Detén la simulación para cargar nuevos objetos
          </p>
        )}
      </div>

      {/* Selector de Modo */}
      <SelectorModo 
        mode={mode} 
        setMode={setMode} 
        disabled={isRunning && !isPaused} 
      />

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

export default PanelControl;
