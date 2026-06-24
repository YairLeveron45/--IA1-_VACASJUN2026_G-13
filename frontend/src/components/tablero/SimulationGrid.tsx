import React, { useEffect, useRef, useState } from 'react';
import { Bot, MapPin } from 'lucide-react';
import type { DeliveryZone, Obstacle, Package as PackageType, Robot as RobotType } from '../../types';
import Celda from './Celda';
import Robot from './Robot';

interface SimulationGridProps {
  gridSize: number;
  robots: RobotType[];
  packages: PackageType[];
  deliveryZones: DeliveryZone[];
  obstacles: Obstacle[];
}

interface AnimatedRobot {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  carrying: boolean;
  packageId?: string;
}

const GAP_SIZE = 6;
const MOVE_DURATION_MS = 620;

const easeInOutCubic = (progress: number) =>
  progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;

const SimulationGrid: React.FC<SimulationGridProps> = ({
  gridSize,
  robots,
  packages,
  deliveryZones,
  obstacles,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const trailTimeoutRef = useRef<number | null>(null);
  const currentCellRef = useRef<{ id: string; x: number; y: number } | null>(null);

  const [animatedRobot, setAnimatedRobot] = useState<AnimatedRobot | null>(null);
  const [robotPixelPos, setRobotPixelPos] = useState({ x: 0, y: 0 });
  const [cellSize, setCellSize] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [trailCells, setTrailCells] = useState<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    const updateCellSize = () => {
      if (!gridRef.current) return;
      const gridWidth = gridRef.current.offsetWidth;
      const totalGap = (gridSize - 1) * GAP_SIZE;
      setCellSize((gridWidth - totalGap) / gridSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, [gridSize]);

  const getPixelPosition = (x: number, y: number) => ({
    x: x * (cellSize + GAP_SIZE) + cellSize / 2,
    y: y * (cellSize + GAP_SIZE) + cellSize / 2,
  });

  useEffect(() => {
    const robot = robots[0];
    if (!robot || cellSize === 0) {
      setAnimatedRobot(null);
      return;
    }

    const targetCell = { id: robot.id, x: robot.x, y: robot.y };
    const currentCell = currentCellRef.current;

    if (!currentCell || currentCell.id !== robot.id) {
      const pos = getPixelPosition(robot.x, robot.y);
      currentCellRef.current = targetCell;
      setRobotPixelPos(pos);
      setAnimatedRobot({
        ...targetCell,
        targetX: robot.x,
        targetY: robot.y,
        carrying: robot.carrying,
        packageId: robot.packageId,
      });
      setIsMoving(false);
      setShowTrail(false);
      setTrailCells([]);
      return;
    }

    setAnimatedRobot((prev) => prev && ({
      ...prev,
      carrying: robot.carrying,
      packageId: robot.packageId,
      targetX: robot.x,
      targetY: robot.y,
    }));

    if (currentCell.x === robot.x && currentCell.y === robot.y) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (trailTimeoutRef.current) {
      window.clearTimeout(trailTimeoutRef.current);
    }

    const startCell = { ...currentCell };
    const startPos = getPixelPosition(startCell.x, startCell.y);
    const endPos = getPixelPosition(robot.x, robot.y);
    const startTime = performance.now();

    setIsMoving(true);
    setShowTrail(true);
    setTrailCells([startCell, targetCell]);
    setAnimatedRobot({
      id: robot.id,
      x: startCell.x,
      y: startCell.y,
      targetX: robot.x,
      targetY: robot.y,
      carrying: robot.carrying,
      packageId: robot.packageId,
    });

    const animate = (timestamp: number) => {
      const progress = Math.min(1, (timestamp - startTime) / MOVE_DURATION_MS);
      const eased = easeInOutCubic(progress);

      setRobotPixelPos({
        x: startPos.x + (endPos.x - startPos.x) * eased,
        y: startPos.y + (endPos.y - startPos.y) * eased,
      });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      currentCellRef.current = targetCell;
      setRobotPixelPos(endPos);
      setAnimatedRobot({
        id: robot.id,
        x: robot.x,
        y: robot.y,
        targetX: robot.x,
        targetY: robot.y,
        carrying: robot.carrying,
        packageId: robot.packageId,
      });
      setIsMoving(false);
      trailTimeoutRef.current = window.setTimeout(() => {
        setShowTrail(false);
        setTrailCells([]);
      }, 260);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [robots, cellSize]);

  useEffect(() => () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (trailTimeoutRef.current) {
      window.clearTimeout(trailTimeoutRef.current);
    }
  }, []);

  const hasRobotInCell = (x: number, y: number) => {
    if (!animatedRobot || isMoving) return false;
    return animatedRobot.x === x && animatedRobot.y === y;
  };

  const isZonaActiva = (x: number, y: number) => {
    if (!animatedRobot?.carrying) return false;
    const referenceX = isMoving ? animatedRobot.targetX : animatedRobot.x;
    const referenceY = isMoving ? animatedRobot.targetY : animatedRobot.y;
    return Math.abs(referenceX - x) <= 1 && Math.abs(referenceY - y) <= 1;
  };

  const getCellData = (x: number, y: number) => {
    const pkg = packages.find((item) => item.x === x && item.y === y && !item.delivered);
    const zone = deliveryZones.find((item) => item.x === x && item.y === y);
    const obstacle = obstacles.find((item) => item.x === x && item.y === y);
    const trailIndex = trailCells.findIndex((cell) => cell.x === x && cell.y === y);

    return {
      tieneObstaculo: !!obstacle,
      tienePaquete: !!pkg,
      paqueteEntregado: pkg?.delivered || false,
      tieneZonaEntrega: !!zone,
      zonaNombre: zone?.name,
      zonaActiva: isZonaActiva(x, y),
      esCeldaOrigen: showTrail && trailIndex === 0,
      esPasoTransicion: showTrail && trailIndex > 0,
      isEven: (x + y) % 2 === 0,
      tieneRobot: hasRobotInCell(x, y),
      isAnimating: isMoving,
    };
  };

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-5 border border-neon-blue/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neon-blue/80 tracking-wider uppercase flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Mapa de la Bodega ({gridSize}x{gridSize})
        </h3>
        {isMoving && (
          <span className="text-[10px] text-blue-400 font-mono animate-pulse">
            Movimiento
          </span>
        )}
      </div>

      <div
        ref={gridRef}
        className="grid gap-1.5 p-2 sm:p-2.5 rounded-lg bg-black/40 relative overflow-hidden"
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

          return (
            <Celda
              key={`${x}-${y}`}
              x={x}
              y={y}
              {...getCellData(x, y)}
              showTrail={showTrail}
            />
          );
        })}

        {animatedRobot && cellSize > 0 && (
          <Robot
            x={robotPixelPos.x}
            y={robotPixelPos.y}
            cellSize={cellSize}
            isMoving={isMoving}
            carrying={animatedRobot.carrying}
            isAnimating={isMoving}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">Robot</span>
          {isMoving && <span className="text-[10px] text-green-400 animate-pulse">en movimiento</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-blue/20 border border-neon-blue/30" />
          <span className="text-gray-400">Estela</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-gray-400">Paquete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse" />
          <span className="text-gray-400">Zona de Entrega</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/20 rounded" />
          <span className="text-gray-400">Obstaculo</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationGrid;
