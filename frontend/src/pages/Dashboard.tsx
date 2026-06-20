import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { PanelControl } from '../components/panel';
import { SimulationGrid } from '../components/tablero';
import StatisticsPanel from '../components/StatisticsPanel';
import LogsPanel from '../components/LogsPanel';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { Robot, Package, Obstacle, DeliveryZone, LogEntry } from '../types';


const generateRandomData = () => {
  const gridSize = 10;
  const usedPositions = new Set<string>();
  
  const robotX = Math.floor(Math.random() * gridSize);
  const robotY = Math.floor(Math.random() * gridSize);
  const robots: Robot[] = [
    { id: 1, x: robotX, y: robotY, carrying: false }
  ];
  usedPositions.add(`${robotX},${robotY}`);

  const packages: Package[] = [];
  for (let i = 1; i <= 5; i++) {
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
      attempts++;
    } while (usedPositions.has(`${x},${y}`) && attempts < 100);
    
    usedPositions.add(`${x},${y}`);
    
    let destX, destY;
    let destAttempts = 0;
    do {
      destX = Math.floor(Math.random() * gridSize);
      destY = Math.floor(Math.random() * gridSize);
      destAttempts++;
    } while ((destX === x && destY === y) && destAttempts < 100);
    
    packages.push({
      id: `P${i}`,
      x,
      y,
      destination: { x: destX, y: destY },
      delivered: false,
    });
  }

  const obstacles: Obstacle[] = [];
  for (let i = 1; i <= 8; i++) {
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
      attempts++;
    } while (usedPositions.has(`${x},${y}`) && attempts < 100);
    
    usedPositions.add(`${x},${y}`);
    obstacles.push({ id: i, x, y });
  }

  const deliveryZones: DeliveryZone[] = [];
  const zoneNames = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 1; i <= 2; i++) {
    let x, y;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
      attempts++;
    } while (usedPositions.has(`${x},${y}`) && attempts < 100);
    
    usedPositions.add(`${x},${y}`);
    deliveryZones.push({ 
      id: i, 
      x, 
      y, 
      name: zoneNames[Math.floor(Math.random() * zoneNames.length)] 
    });
  }

  return { robots, packages, obstacles, deliveryZones };
};

const generateMockData = () => {
  const robots: Robot[] = [
    { id: 1, x: 2, y: 2, carrying: false }
  ];

  const packages: Package[] = [
    { id: 'P1', x: 8, y: 2, destination: { x: 5, y: 7 }, delivered: false },
    { id: 'P2', x: 7, y: 4, destination: { x: 8, y: 8 }, delivered: false },
    { id: 'P3', x: 3, y: 8, destination: { x: 2, y: 2 }, delivered: false },
    { id: 'P4', x: 1, y: 6, destination: { x: 6, y: 3 }, delivered: false },
    { id: 'P5', x: 9, y: 5, destination: { x: 4, y: 9 }, delivered: false },
  ];

  const obstacles: Obstacle[] = [
    { id: 1, x: 4, y: 3 },
    { id: 2, x: 5, y: 4 },
    { id: 3, x: 6, y: 5 },
    { id: 4, x: 3, y: 6 },
    { id: 5, x: 8, y: 3 },
    { id: 6, x: 2, y: 7 },
    { id: 7, x: 7, y: 9 },
    { id: 8, x: 9, y: 2 },
  ];

  const deliveryZones: DeliveryZone[] = [
    { id: 1, x: 5, y: 7, name: 'A' },
    { id: 2, x: 8, y: 8, name: 'B' },
  ];

  return { robots, packages, obstacles, deliveryZones };
};

const Dashboard: React.FC = () => {
  const [status, setStatus] = useState<'ready' | 'running' | 'paused' | 'finished'>('ready');
  const [mode, setMode] = useState<'auto' | 'step'>('auto');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  const [gridSize] = useState(10);
  const [robots, setRobots] = useState<Robot[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  
  const [deliveries, setDeliveries] = useState(0);
  const [movements, setMovements] = useState(0);
  const [efficiency, setEfficiency] = useState(0);

  // Inicializar con datos aleatorios
  useEffect(() => {
    const data = generateRandomData();
    setRobots(data.robots);
    setPackages(data.packages);
    setObstacles(data.obstacles);
    setDeliveryZones(data.deliveryZones);
  }, []);

  const handleCargarObjetos = () => {
    if (isRunning) return;
    const data = generateRandomData();
    setRobots(data.robots);
    setPackages(data.packages);
    setObstacles(data.obstacles);
    setDeliveryZones(data.deliveryZones);
    setDeliveries(0);
    setMovements(0);
    setEfficiency(0);
    setTimeElapsed(0);
    setLogs([]);
    setStatus('ready');
    setIsRunning(false);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setMovements(prev => prev + Math.floor(Math.random() * 3) + 1);
        setDeliveries(prev => {
          if (Math.random() < 0.1 && packages.some(p => !p.delivered)) {
            return prev + 1;
          }
          return prev;
        });
        
        const actions = [
          'Mover Derecha',
          'Mover Izquierda',
          'Mover Arriba',
          'Mover Abajo',
          'Recoger Paquete',
          'Entregar Paquete',
          'Esperar',
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const logTypes: Array<'info' | 'success' | 'warning'> = ['info', 'success', 'warning'];
        
        setLogs(prev => [
          ...prev,
          {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: `Robot 1 -> ${randomAction}`,
            type: logTypes[Math.floor(Math.random() * logTypes.length)] as any,
          }
        ].slice(-50));

        const newEfficiency = Math.min(95, Math.floor(deliveries / (movements + 1) * 100));
        setEfficiency(newEfficiency);

      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, deliveries, movements, packages]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStatus('running');
    setLogs([]);
    setDeliveries(0);
    setMovements(0);
    setEfficiency(0);
    setTimeElapsed(0);
    
    const interval = setInterval(() => {
      setRobots(prev => {
        const robot = prev[0];
        if (!robot) return prev;
        
        const directions = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
        ];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const newX = Math.max(0, Math.min(gridSize - 1, robot.x + dir.dx));
        const newY = Math.max(0, Math.min(gridSize - 1, robot.y + dir.dy));
        
        const isObstacle = obstacles.some(o => o.x === newX && o.y === newY);
        if (isObstacle) return prev;
        
        const packageAtPos = packages.find(p => p.x === newX && p.y === newY && !p.delivered);
        if (packageAtPos && !robot.carrying) {
          setPackages(prevPackages => 
            prevPackages.map(p => 
              p.id === packageAtPos.id ? { ...p, x: -1, y: -1 } : p
            )
          );
          return prev.map(r => 
            r.id === robot.id ? { ...r, x: newX, y: newY, carrying: true, packageId: packageAtPos.id } : r
          );
        }
        
        const zone = deliveryZones.find(z => z.x === newX && z.y === newY);
        if (zone && robot.carrying && robot.packageId) {
          setDeliveries(prev => prev + 1);
          setPackages(prevPackages => 
            prevPackages.map(p => 
              p.id === robot.packageId ? { ...p, delivered: true } : p
            )
          );
          return prev.map(r => 
            r.id === robot.id ? { ...r, x: newX, y: newY, carrying: false, packageId: undefined } : r
          );
        }
        
        return prev.map(r => 
          r.id === robot.id ? { ...r, x: newX, y: newY } : r
        );
      });
    }, 1500);
    
    return () => clearInterval(interval);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    setStatus(isPaused ? 'running' : 'paused');
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setStatus('ready');
    setLogs([]);
    setDeliveries(0);
    setMovements(0);
    setEfficiency(0);
    setTimeElapsed(0);
    const data = generateRandomData();
    setRobots(data.robots);
    setPackages(data.packages);
    setObstacles(data.obstacles);
    setDeliveryZones(data.deliveryZones);
  };

  const handleStep = () => {
    const actions = [
      'Mover Derecha',
      'Mover Izquierda', 
      'Mover Arriba',
      'Mover Abajo',
      'Recoger Paquete',
      'Entregar Paquete',
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    setLogs(prev => [
      ...prev,
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        message: `[Paso] Robot 1 -> ${randomAction}`,
        type: 'info',
      }
    ]);
    setMovements(prev => prev + 1);
  };

  const toggleLogs = () => {
    setIsLogsOpen(!isLogsOpen);
  };

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
              deliveries={deliveries}
              movements={movements}
              efficiency={efficiency}
              timeElapsed={timeElapsed}
            />
          </div>

          <div className="lg:col-span-4 flex items-start justify-center">
            <div className="w-full max-w-[780px]">
              <SimulationGrid
                gridSize={gridSize}
                robots={robots}
                packages={packages}
                deliveryZones={deliveryZones}
                obstacles={obstacles}
              />
            </div>
          </div>
        </div>

        <button
          onClick={toggleLogs}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-50 bg-gradient-to-r from-black via-blue-900/80 to-blue-700/60 
                     text-white p-3 rounded-l-xl border border-blue-500/20 hover:border-blue-400/40 
                     transition-all duration-300 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20
                     flex items-center gap-2 group"
        >
          <span className="text-xs font-medium hidden sm:inline">
            {isLogsOpen ? 'Cerrar' : 'Historial'}
          </span>
          {isLogsOpen ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
            {logs.length}
          </span>
        </button>

        <div 
          className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-gradient-to-b from-black/95 via-blue-950/95 to-black/95 
                      backdrop-blur-xl border-l border-blue-500/20 shadow-2xl shadow-blue-500/10
                      transition-all duration-500 ease-in-out z-40
                      ${isLogsOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{
            paddingTop: '80px',
          }}
        >
          <div className="h-full px-6 pb-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                 Historial de Inferencia
              </h2>
              <span className="text-xs text-gray-400 font-mono">
                {logs.length} eventos
              </span>
            </div>
            <div className="h-[calc(100%-60px)]">
              <LogsPanel logs={logs} isSlidebar={true} />
            </div>
          </div>
        </div>

        {isLogsOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={toggleLogs}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
