import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Bot } from 'lucide-react';
import type { Robot as RobotType, Package as PackageType, DeliveryZone, Obstacle } from '../../types';
import Robot from './Robot';
import Celda from './Celda';

interface SimulationGridProps {
  gridSize: number;
  robots: RobotType[];
  packages: PackageType[];
  deliveryZones: DeliveryZone[];
  obstacles: Obstacle[];
}

interface AnimatedRobot {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isAnimating: boolean;
  carrying: boolean;
  packageId?: string;
}

const SimulationGrid: React.FC<SimulationGridProps> = ({
  gridSize,
  robots,
  packages,
  deliveryZones,
  obstacles,
}) => {
  const [animatedRobots, setAnimatedRobots] = useState<AnimatedRobot[]>([]);
  const [robotPixelPos, setRobotPixelPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [targetPixelPos, setTargetPixelPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  // Calcular tamaño de celda
  useEffect(() => {
    const updateCellSize = () => {
      if (gridRef.current) {
        const gridWidth = gridRef.current.offsetWidth;
        const gapSize = 6;
        const totalGap = (gridSize - 1) * gapSize;
        const size = (gridWidth - totalGap) / gridSize;
        setCellSize(size);
      }
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [gridSize]);

  // Obtener posición en píxeles
  const getPixelPosition = (x: number, y: number): { x: number; y: number } => {
    const gap = 6;
    return {
      x: x * (cellSize + gap) + cellSize / 2,
      y: y * (cellSize + gap) + cellSize / 2,
    };
  };

  // Inicializar robots
  useEffect(() => {
    if (robots.length > 0 && animatedRobots.length === 0 && cellSize > 0) {
      const initialRobots = robots.map(r => ({
        ...r,
        targetX: r.x,
        targetY: r.y,
        isAnimating: false,
        carrying: r.carrying || false,
      }));
      setAnimatedRobots(initialRobots);
      
      const pos = getPixelPosition(robots[0].x, robots[0].y);
      setRobotPixelPos(pos);
      setTargetPixelPos(pos);
    }
  }, [robots, cellSize]);

  // Detectar cambios en la posición del robot
  useEffect(() => {
    if (robots.length === 0 || animatedRobots.length === 0 || cellSize === 0) return;

    const robotData = robots[0];
    const animatedRobot = animatedRobots[0];

    if (!robotData || !animatedRobot) return;

    if (robotData.x !== animatedRobot.targetX || robotData.y !== animatedRobot.targetY) {
      setIsAnimating(true);
      
      setAnimatedRobots(prev =>
        prev.map(r =>
          r.id === robotData.id
            ? {
                ...r,
                targetX: robotData.x,
                targetY: robotData.y,
                isAnimating: true,
                carrying: robotData.carrying || false,
                packageId: robotData.packageId,
              }
            : r
        )
      );

      const newTargetPos = getPixelPosition(robotData.x, robotData.y);
      setTargetPixelPos(newTargetPos);
      setIsMoving(true);
      setShowTrail(true);

      setTimeout(() => {
        setShowTrail(false);
      }, 800);

      setTimeout(() => {
        setAnimatedRobots(prev =>
          prev.map(r =>
            r.id === robotData.id
              ? {
                  ...r,
                  x: r.targetX,
                  y: r.targetY,
                  isAnimating: false,
                }
              : r
          )
        );
        setIsMoving(false);
        setTimeout(() => setIsAnimating(false), 300);
      }, 500);
    } else if (robotData.carrying !== animatedRobot.carrying) {
      setAnimatedRobots(prev =>
        prev.map(r =>
          r.id === robotData.id
            ? {
                ...r,
                carrying: robotData.carrying || false,
                packageId: robotData.packageId,
              }
            : r
        )
      );
    }
  }, [robots, animatedRobots, cellSize]);

  // Actualizar posición del robot en píxeles durante la animación
  useEffect(() => {
    if (isMoving && cellSize > 0 && animatedRobots.length > 0) {
      const startPos = getPixelPosition(animatedRobots[0]?.x || 0, animatedRobots[0]?.y || 0);
      const endPos = targetPixelPos;

      let startTime: number | null = null;
      const duration = 500;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min(1, (timestamp - startTime) / duration);
        
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentX = startPos.x + (endPos.x - startPos.x) * eased;
        const currentY = startPos.y + (endPos.y - startPos.y) * eased;

        setRobotPixelPos({ x: currentX, y: currentY });

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setRobotPixelPos(endPos);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMoving, targetPixelPos, cellSize, animatedRobots]);

  // Verificar si una celda tiene un robot
  const hasRobotInCell = (x: number, y: number): boolean => {
    return animatedRobots.some(r => {
      if (r.isAnimating) {
        const roundedX = Math.round(r.x);
        const roundedY = Math.round(r.y);
        return roundedX === x && roundedY === y;
      }
      return r.x === x && r.y === y;
    });
  };

  // Verificar si una zona de entrega está activa (tiene paquete cerca)
  const isZonaActiva = (x: number, y: number): boolean => {
    return animatedRobots.some(r => {
      const distX = Math.abs(Math.round(r.x) - x);
      const distY = Math.abs(Math.round(r.y) - y);
      return r.carrying && distX <= 1 && distY <= 1;
    });
  };

  const getCellData = (x: number, y: number) => {
    const pkg = packages.find(p => p.x === x && p.y === y && !p.delivered);
    const zone = deliveryZones.find(z => z.x === x && z.y === y);
    const obstacle = obstacles.find(o => o.x === x && o.y === y);
    
    const isPassingThrough = animatedRobots.some(r => {
      if (!r.isAnimating) return false;
      const startX = Math.floor(r.x);
      const startY = Math.floor(r.y);
      const endX = Math.ceil(r.x);
      const endY = Math.ceil(r.y);
      return (x === startX && y === startY) || (x === endX && y === endY);
    });

    const isSourceCell = animatedRobots.some(r => {
      if (!r.isAnimating) return false;
      return Math.floor(r.x) === x && Math.floor(r.y) === y && 
             !(Math.round(r.x) === x && Math.round(r.y) === y);
    });

    return {
      tieneObstaculo: !!obstacle,
      tienePaquete: !!pkg,
      paqueteEntregado: pkg?.delivered || false,
      tieneZonaEntrega: !!zone,
      zonaNombre: zone?.name,
      zonaActiva: isZonaActiva(x, y),
      esCeldaOrigen: isSourceCell,
      esPasoTransicion: isPassingThrough,
      isEven: (x + y) % 2 === 0,
      tieneRobot: hasRobotInCell(x, y),
      isAnimating: isAnimating || isMoving,
    };
  };

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-5 border border-neon-blue/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neon-blue/80 tracking-wider uppercase flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Mapa de la Bodega ({gridSize}x{gridSize})
        </h3>
        <div className="flex items-center gap-2">
          {isMoving && (
            <span className="text-[10px] text-blue-400 font-mono animate-pulse">
              
            </span>
          )}
        </div>
      </div>
      
      <div 
        ref={gridRef}
        className="grid gap-1.5 p-2 sm:p-2.5 rounded-lg bg-black/40 relative"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1/1',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const cellData = getCellData(x, y);

          return (
            <Celda
              key={`${x}-${y}`}
              x={x}
              y={y}
              {...cellData}
              showTrail={showTrail}
            />
          );
        })}

        {/* Robot - Solo el icono sin cuadrado */}
        {animatedRobots.length > 0 && cellSize > 0 && (
          <Robot
            x={robotPixelPos.x}
            y={robotPixelPos.y}
            cellSize={cellSize}
            isMoving={isMoving}
            carrying={animatedRobots[0]?.carrying || false}
            isAnimating={animatedRobots[0]?.isAnimating || false}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">Robot</span>
          {isMoving && (
            <span className="text-[10px] text-green-400 animate-pulse">⚡ en movimiento</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-blue/20 border border-neon-blue/30"></div>
          <span className="text-gray-400">Estela</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse"></div>
          <span className="text-gray-400">Paquete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
          <span className="text-gray-400">Zona de Entrega</span>
          {isAnimating && (
            <span className="text-[10px] text-green-400 animate-pulse"> activa</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/20 rounded"></div>
          <span className="text-gray-400">Obstáculo</span>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-gray-500 font-mono text-center">
        {isMoving ? (
          <span className="text-blue-400 animate-pulse">
            
          </span>
        ) : (
          <span className="text-gray-600">
            
          </span>
        )}
      </div>
    </div>
  );
};

export default SimulationGrid;
