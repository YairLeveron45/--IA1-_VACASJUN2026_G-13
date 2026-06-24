import React from 'react';
import { BarChart3, CalendarClock, CheckCircle2, Move, PackageCheck, Route } from 'lucide-react';
import type { RegistroHistorialDTO } from '../services/api';

interface HistoryPanelProps {
  registros: RegistroHistorialDTO[];
  isLoading: boolean;
  error?: string | null;
  onRefresh: () => void;
}

const formatDate = (value: string | null) => {
  if (!value) return 'Pendiente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  registros,
  isLoading,
  error,
  onRefresh,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-blue-300/80 font-semibold">
            Simulaciones ejecutadas
          </p>
          <p className="text-[11px] text-gray-500 font-mono">
            {registros.length} registros
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="min-h-[34px] px-3 rounded-lg bg-blue-900/50 hover:bg-blue-800/60 border border-blue-400/20 text-xs font-semibold text-white transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-400/20 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading && registros.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            Cargando historial...
          </div>
        ) : registros.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-600">
            <BarChart3 className="w-9 h-9 mb-2 text-gray-700" />
            <p className="text-sm">Sin simulaciones finalizadas</p>
            <p className="text-[11px] mt-1">Cuando una entrega finalice aparecera aqui.</p>
          </div>
        ) : (
          registros.map((registro) => {
            const eficiencia = Math.round(registro.tasa_entrega * 100);
            return (
              <article
                key={registro.id}
                className="rounded-lg border border-blue-500/10 bg-black/35 p-3 hover:border-blue-400/25 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">Simulacion {registro.id}</h3>
                    <p className="text-[11px] text-gray-500 font-mono flex items-center gap-1.5 mt-1">
                      <CalendarClock className="w-3 h-3" />
                      {formatDate(registro.finalizada_en)}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
                    {registro.estado_final}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-slate-900/70 border border-white/5 p-2">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-green-400" />
                      Entregas
                    </span>
                    <strong className="text-white text-lg">{registro.entregas}/{registro.num_paquetes}</strong>
                  </div>
                  <div className="rounded-md bg-slate-900/70 border border-white/5 p-2">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-blue-400" />
                      Movimientos
                    </span>
                    <strong className="text-white text-lg">{registro.movimientos}</strong>
                  </div>
                  <div className="rounded-md bg-slate-900/70 border border-white/5 p-2">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-cyan-400" />
                      Pasos
                    </span>
                    <strong className="text-white text-lg">{registro.pasos}</strong>
                  </div>
                  <div className="rounded-md bg-slate-900/70 border border-white/5 p-2">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400" />
                      Eficiencia
                    </span>
                    <strong className="text-white text-lg">{eficiencia}%</strong>
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-gray-500 font-mono">
                  Mapa {registro.ancho}x{registro.alto} | robots {registro.num_robots} | zonas {registro.num_zonas} | obstaculos {registro.num_obstaculos}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
