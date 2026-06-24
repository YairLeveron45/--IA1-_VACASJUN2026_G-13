import React from 'react';
import { Bot, Package } from 'lucide-react';

interface RobotProps {
  x: number;
  y: number;
  cellSize: number;
  isMoving: boolean;
  carrying: boolean;
  isAnimating?: boolean;
}

const Robot: React.FC<RobotProps> = ({
  x,
  y,
  cellSize,
  isMoving,
  carrying,
  isAnimating = false,
}) => {
  const iconSize = cellSize * 0.68;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - cellSize / 2,
        top: y - cellSize / 2,
        width: cellSize,
        height: cellSize,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {isMoving && (
          <>
            <div className="absolute inset-[-9px] rounded-full bg-neon-blue/10 blur-xl animate-pulse" />
            <div className="absolute inset-[-5px] rounded-full bg-cyan-500/10 blur-lg animate-pulse" />
          </>
        )}

        <Bot
          className={`text-blue-400 drop-shadow-2xl transition-all duration-300 ${
            isMoving ? 'scale-110' : 'scale-100'
          } ${isAnimating ? 'rotate-3' : 'rotate-0'}`}
          style={{
            width: iconSize,
            height: iconSize,
            filter: isMoving
              ? 'drop-shadow(0 0 20px rgba(0, 150, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 100, 255, 0.3))'
              : 'drop-shadow(0 0 10px rgba(0, 150, 255, 0.3))',
          }}
        />

        {carrying && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-bounce flex items-center justify-center">
            <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-black" />
          </div>
        )}

        {isMoving && (
          <div className="absolute inset-[-12px] rounded-full pointer-events-none">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-cyan-500/0 animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Robot;
