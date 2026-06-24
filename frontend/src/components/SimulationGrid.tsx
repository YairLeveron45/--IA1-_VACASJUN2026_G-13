import React from 'react';
import { Bot, MapPin, Package, X } from 'lucide-react';
import type { DeliveryZone, Obstacle, Package as PackageType, Robot } from '../types.d';

interface SimulationGridProps {
  gridSize: number;
  robots: Robot[];
  packages: PackageType[];
  deliveryZones: DeliveryZone[];
  obstacles: Obstacle[];
}

const SimulationGrid: React.FC<SimulationGridProps> = ({
  gridSize,
  robots,
  packages,
  deliveryZones,
  obstacles,
}) => {
  const getCellContent = (x: number, y: number) => {
    const robot = robots.find((item) => item.x === x && item.y === y);
    const pkg = packages.find((item) => item.x === x && item.y === y && !item.delivered);
    const zone = deliveryZones.find((item) => item.x === x && item.y === y);
    const obstacle = obstacles.find((item) => item.x === x && item.y === y);

    if (robot) {
      return {
        className: 'bg-blue-500/20 border border-blue-400/30',
        content: <Bot className="w-5 h-5 text-blue-400" />,
      };
    }

    if (obstacle) {
      return {
        className: 'bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/20',
        content: <X className="w-4 h-4 text-red-400/60" />,
      };
    }

    if (zone) {
      return {
        className: 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-400/30',
        content: <MapPin className="w-4 h-4 text-green-400" />,
      };
    }

    if (pkg) {
      return {
        className: 'bg-yellow-500/20 border border-yellow-400/30',
        content: <Package className="w-4 h-4 text-yellow-400" />,
      };
    }

    return {
      className: (x + y) % 2 === 0 ? 'bg-dark-300/20' : 'bg-dark-200/40',
      content: null,
    };
  };

  return (
    <div className="glass-effect rounded-xl p-4 sm:p-5 border border-neon-blue/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-neon-blue/80 tracking-wider uppercase flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Mapa de la Bodega ({gridSize}x{gridSize})
        </h3>
      </div>

      <div
        className="grid gap-1.5 p-2 sm:p-2.5 rounded-lg bg-black/40"
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
          const cell = getCellContent(x, y);

          return (
            <div
              key={`${x}-${y}`}
              className={`${cell.className} rounded-md flex items-center justify-center min-h-[20px] sm:min-h-[28px] transition-all duration-200`}
            >
              {cell.content}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">Robot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-3 h-3 text-yellow-400" />
          <span className="text-gray-400">Paquete</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-green-400" />
          <span className="text-gray-400">Zona de Entrega</span>
        </div>
        <div className="flex items-center gap-1.5">
          <X className="w-3 h-3 text-red-400/60" />
          <span className="text-gray-400">Obstaculo</span>
        </div>
      </div>
    </div>
  );
};

export default SimulationGrid;
