import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import LogsPanel from '../components/LogsPanel';
import { PanelControl } from '../components/panel';
import StatisticsPanel from '../components/StatisticsPanel';
import { SimulationGrid } from '../components/tablero';
import { api, mapSimulacionToUi } from '../services/api';
import type { ConfiguracionDTO, SimulacionDTO } from '../services/api';
import type { LogEntry } from '../types';

type UiStatus = 'ready' | 'running' | 'paused' | 'finished';

const GRID_SIZE = 10;

const toUiStatus = (estado?: SimulacionDTO['ejecucion']): UiStatus => {
  if (estado === 'en_ejecucion') return 'running';
  if (estado === 'pausada') return 'paused';
  if (estado === 'finalizada') return 'finished';
  return 'ready';
};

const addLog = (
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>,
  message: string,
  type: LogEntry['type'] = 'info',
) => {
  setLogs((prev) => [
    ...prev,
    {
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    },
  ].slice(-50));
};

const generarConfiguracion = (): ConfiguracionDTO => {
  const usedPositions = new Set<string>();
  const reserve = (x: number, y: number) => usedPositions.add(`${x},${y}`);
  const isUsed = (x: number, y: number) => usedPositions.has(`${x},${y}`);

  const randomFreePosition = () => {
    for (let attempts = 0; attempts < 200; attempts += 1) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (!isUsed(x, y)) {
        reserve(x, y);
        return { x, y };
      }
    }
    throw new Error('No se pudo encontrar una celda libre.');
  };

  const robotPosition = randomFreePosition();
  const zonas = [1, 2].map((index) => {
    const position = randomFreePosition();
    return { id: `z${index}`, ...position };
  });

  const paquetes = Array.from({ length: 5 }, (_, index) => {
    const position = randomFreePosition();
    const zona = zonas[index % zonas.length];
    return {
      id: `p${index + 1}`,
      ...position,
      zona_destino: zona.id,
    };
  });

  const obstaculos = Array.from({ length: 8 }, () => randomFreePosition());

  return {
    ancho: GRID_SIZE,
    alto: GRID_SIZE,
    robots: [{ id: 'r1', ...robotPosition }],
    paquetes,
    zonas,
    obstaculos,
  };
};

const Dashboard: React.FC = () => {
  const [simulacion, setSimulacion] = useState<SimulacionDTO | null>(null);
  const [mode, setMode] = useState<'auto' | 'step'>('auto');
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const status = toUiStatus(simulacion?.ejecucion);
  const isRunning = status === 'running';
  const isPaused = status === 'paused';

  const uiState = useMemo(
    () => simulacion ? mapSimulacionToUi(simulacion) : mapSimulacionToUi({
      id: 'preview',
      ejecucion: 'creada',
      creada_en: '',
      finalizada_en: null,
      estado: {
        ancho: GRID_SIZE,
        alto: GRID_SIZE,
        robots: [],
        paquetes: [],
        zonas: [],
        obstaculos: [],
        stats: { entregas: 0, movimientos: 0, pasos: 0 },
      },
    }),
    [simulacion],
  );

  const crearNuevaSimulacion = useCallback(async () => {
    setIsLoading(true);
    try {
      const nueva = await api.crearSimulacion(generarConfiguracion());
      setSimulacion(nueva);
      setTimeElapsed(0);
      setLogs([]);
      addLog(setLogs, `Simulación ${nueva.id} creada desde la API.`, 'success');
      return nueva;
    } catch (error) {
      addLog(setLogs, error instanceof Error ? error.message : 'Error al crear simulación.', 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void crearNuevaSimulacion();
  }, [crearNuevaSimulacion]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const avanzarPaso = useCallback(async () => {
    if (!simulacion || simulacion.ejecucion === 'finalizada') return;

    try {
      const anterior = simulacion;
      const siguiente = await api.paso(simulacion.id);
      setSimulacion(siguiente);

      const deltaMovimientos = siguiente.estado.stats.movimientos - anterior.estado.stats.movimientos;
      const deltaEntregas = siguiente.estado.stats.entregas - anterior.estado.stats.entregas;
      const tipo = deltaEntregas > 0 ? 'success' : deltaMovimientos > 0 ? 'info' : 'warning';
      addLog(
        setLogs,
        `Paso ${siguiente.estado.stats.pasos}: +${deltaMovimientos} movimientos, +${deltaEntregas} entregas.`,
        tipo,
      );

      if (siguiente.ejecucion === 'finalizada') {
        addLog(setLogs, 'Simulación finalizada por el backend.', 'success');
      }
    } catch (error) {
      addLog(setLogs, error instanceof Error ? error.message : 'Error al avanzar paso.', 'error');
    }
  }, [simulacion]);

  useEffect(() => {
    if (!simulacion || mode !== 'auto' || !isRunning) return;
    const interval = window.setInterval(() => void avanzarPaso(), 850);
    return () => window.clearInterval(interval);
  }, [avanzarPaso, isRunning, mode, simulacion]);

  const handleCargarObjetos = async () => {
    if (isRunning || isPaused || isLoading) return;
    await crearNuevaSimulacion();
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const actual = simulacion ?? await crearNuevaSimulacion();
      if (!actual) return;
      const reanudada = await api.reanudar(actual.id);
      setSimulacion(reanudada);
      addLog(setLogs, mode === 'auto' ? 'Modo automático iniciado.' : 'Modo paso a paso iniciado.', 'success');
    } catch (error) {
      addLog(setLogs, error instanceof Error ? error.message : 'Error al iniciar simulación.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    if (!simulacion || isLoading) return;
    setIsLoading(true);
    try {
      const nueva = isPaused ? await api.reanudar(simulacion.id) : await api.pausar(simulacion.id);
      setSimulacion(nueva);
      addLog(setLogs, isPaused ? 'Simulación reanudada.' : 'Simulación pausada.', 'warning');
    } catch (error) {
      addLog(setLogs, error instanceof Error ? error.message : 'Error al cambiar pausa.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!simulacion || isLoading) {
      await crearNuevaSimulacion();
      return;
    }

    setIsLoading(true);
    try {
      const reiniciada = await api.reiniciar(simulacion.id);
      setSimulacion(reiniciada);
      setTimeElapsed(0);
      setLogs([]);
      addLog(setLogs, 'Simulación reiniciada desde la API.', 'success');
    } catch (error) {
      addLog(setLogs, error instanceof Error ? error.message : 'Error al reiniciar simulación.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep = () => {
    void avanzarPaso();
  };

  const stats = simulacion?.estado.stats ?? { entregas: 0, movimientos: 0, pasos: 0 };
  const totalPaquetes = simulacion?.estado.paquetes.length ?? 0;
  const efficiency = totalPaquetes > 0 ? Math.round((stats.entregas / totalPaquetes) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header status={status} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 max-w-[1920px] mx-auto">
          <div className="lg:col-span-1 space-y-4 lg:space-y-6">
            <PanelControl
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onStep={handleStep}
              onResume={handlePause}
              onCargarObjetos={handleCargarObjetos}
              mode={mode}
              setMode={setMode}
              isRunning={isRunning}
              isPaused={isPaused}
            />
            <StatisticsPanel
              deliveries={stats.entregas}
              movements={stats.movimientos}
              efficiency={efficiency}
              timeElapsed={timeElapsed}
              robotName={simulacion ? `ID ${simulacion.id} | pasos ${stats.pasos}` : 'Conectando con API'}
            />
          </div>

          <div className="lg:col-span-4 flex items-start justify-center">
            <div className="w-full max-w-[780px]">
              <SimulationGrid
                gridSize={GRID_SIZE}
                robots={uiState.robots}
                packages={uiState.packages}
                deliveryZones={uiState.deliveryZones}
                obstacles={uiState.obstacles}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsLogsOpen((open) => !open)}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-50 bg-gradient-to-r from-black via-blue-900/80 to-blue-700/60
                     text-white p-3 rounded-l-xl border border-blue-500/20 hover:border-blue-400/40
                     transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20
                     flex items-center gap-2 group"
        >
          <span className="text-xs font-medium hidden sm:inline">
            {isLogsOpen ? 'Cerrar' : 'Historial'}
          </span>
          {isLogsOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            {logs.length}
          </span>
        </button>

        <div
          className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-gradient-to-b from-black/95 via-blue-950/95 to-black/95
                      backdrop-blur-xl border-l border-blue-500/20 shadow-2xl shadow-blue-500/10
                      transition-all duration-500 ease-in-out z-40
                      ${isLogsOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ paddingTop: '80px' }}
        >
          <div className="h-full px-6 pb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Historial de Inferencia
              </h2>
              <span className="text-xs text-gray-400 font-mono">{logs.length} eventos</span>
            </div>
            <div className="h-[calc(100%-60px)]">
              <LogsPanel logs={logs} isSlidebar={true} />
            </div>
          </div>
        </div>

        {isLogsOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={() => setIsLogsOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
