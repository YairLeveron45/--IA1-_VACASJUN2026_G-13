import React from 'react';
import { Bot } from 'lucide-react';

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
  isAnimating = false 
}) => {
  // Tamaño del icono (70% del tamaño de la celda para que se vea bien)
  const iconSize = cellSize * 0.7;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - cellSize / 2,
        top: y - cellSize / 2,
        width: cellSize,
        height: cellSize,
        zIndex: 10,
        transition: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Glow externo durante movimiento */}
        {isMoving && (
          <>
            <div 
              className="absolute inset-[-8px] rounded-full bg-neon-blue/10 blur-xl animate-pulse"
              style={{
                animationDuration: '0.8s',
              }}
            ></div>
            <div 
              className="absolute inset-[-4px] rounded-full bg-purple-500/10 blur-lg animate-pulse"
              style={{
                animationDuration: '0.6s',
                animationDelay: '0.2s',
              }}
            ></div>
          </>
        )}

        {/* Solo el icono del robot, sin cuadrado de fondo */}
        <Bot 
          className={`text-blue-400 drop-shadow-2xl transition-all duration-300
                     ${isMoving ? 'scale-110' : 'scale-100'}`}
          style={{
            width: iconSize,
            height: iconSize,
            filter: isMoving 
              ? 'drop-shadow(0 0 20px rgba(0, 150, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 100, 255, 0.3))'
              : 'drop-shadow(0 0 10px rgba(0, 150, 255, 0.3))',
            transition: 'all 0.3s ease-in-out',
          }}
        />

        {/* Indicador de carga */}
        {carrying && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4">
            <div className="w-full h-full rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50 animate-bounce flex items-center justify-center text-[8px] sm:text-[10px]">
              📦
            </div>
          </div>
        )}

        {/* Rastro de movimiento */}
        {isMoving && (
          <div className="absolute inset-[-12px] rounded-full pointer-events-none">
            <div 
              className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 animate-ping"
              style={{
                animationDuration: '0.6s',
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Robot;
