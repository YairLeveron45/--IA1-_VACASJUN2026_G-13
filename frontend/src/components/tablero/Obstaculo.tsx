import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ObstaculoProps {
  size?: 'sm' | 'md' | 'lg';
  isAnimating?: boolean;
}

const Obstaculo: React.FC<ObstaculoProps> = ({ size = 'md', isAnimating = false }) => {
  const [scale, setScale] = useState(0);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5 sm:w-6 sm:h-6',
  };

  // Animación de entrada
  useEffect(() => {
    setTimeout(() => setScale(1), 50);
  }, []);

  return (
    <div 
      className="flex items-center justify-center w-full h-full transition-all duration-300"
      style={{
        transform: `scale(${scale}) rotate(${isAnimating ? '45deg' : '0deg'})`,
        transition: 'transform 0.4s ease-in-out',
      }}
    >
      <X 
        className={`${sizeClasses[size]} text-red-400/60 drop-shadow-lg`}
        style={{
          filter: isAnimating 
            ? 'drop-shadow(0 0 15px rgba(255, 0, 0, 0.4))' 
            : 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.2))',
          transition: 'all 0.3s ease-in-out',
        }}
      />
      {isAnimating && (
        <div className="absolute inset-[-4px] rounded-full bg-red-500/10 blur-md animate-pulse"></div>
      )}
    </div>
  );
};

export default Obstaculo;
