import React, { useState, useEffect } from 'react';

interface ZonaEntregaProps {
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  isActive?: boolean;
  isAnimating?: boolean;
}

const ZonaEntrega: React.FC<ZonaEntregaProps> = ({ 
  size = 'md', 
  name,
  isActive = false,
  isAnimating = false 
}) => {
  const [scale, setScale] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  const sizeClasses = {
    sm: 'w-2 h-2 sm:w-2.5 sm:h-2.5',
    md: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    lg: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
  };

  useEffect(() => {
    setTimeout(() => setScale(1), 50);
  }, []);

 
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulseIntensity(prev => prev === 1 ? 1.5 : 1);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-green-400 shadow-lg shadow-green-400/50`}
        style={{
          transform: `scale(${scale * (isActive ? pulseIntensity : 1)})`,
          transition: 'transform 0.3s ease-in-out',
          boxShadow: isActive 
            ? '0 0 30px rgba(0, 255, 100, 0.6), 0 0 60px rgba(0, 255, 100, 0.3)'
            : isAnimating
              ? '0 0 20px rgba(0, 255, 100, 0.4)'
              : '0 0 10px rgba(0, 255, 100, 0.2)',
        }}
      >
        <div 
          className={`w-full h-full rounded-full bg-green-400/20 ${isActive ? 'animate-ping' : ''}`}
          style={{
            animationDuration: isActive ? '0.6s' : '1.5s',
          }}
        ></div>
      </div>
      {name && (
        <span 
          className="text-[6px] sm:text-[8px] text-green-400/80 font-mono mt-0.5 transition-all duration-300"
          style={{
            opacity: isActive ? 1 : 0.6,
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          {name}
        </span>
      )}
      {isAnimating && (
        <div className="absolute inset-[-8px] rounded-full bg-green-400/5 blur-lg animate-pulse"></div>
      )}
    </div>
  );
};

export default ZonaEntrega;
