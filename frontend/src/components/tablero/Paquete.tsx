import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

interface PaqueteProps {
  size?: 'sm' | 'md' | 'lg';
  isDelivered?: boolean;
  isAnimating?: boolean;
  onDeliver?: () => void;
}

const Paquete: React.FC<PaqueteProps> = ({ 
  size = 'md', 
  isDelivered = false,
  isAnimating = false,
  onDeliver 
}) => {
  const [show, setShow] = useState(true);
  const [scale, setScale] = useState(1);

  const sizeClasses = {
    sm: 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5',
    md: 'w-3 h-3 sm:w-4 sm:h-4',
    lg: 'w-4 h-4 sm:w-5 sm:h-5',
  };

  // Efecto de animación al entregar
  useEffect(() => {
    if (isDelivered) {
      setScale(1.5);
      setTimeout(() => {
        setScale(0);
        setTimeout(() => {
          setShow(false);
          if (onDeliver) onDeliver();
        }, 300);
      }, 300);
    } else {
      setShow(true);
      setScale(1);
    }
  }, [isDelivered]);

  // Animación de entrada
  useEffect(() => {
    if (!isDelivered && show) {
      setScale(0);
      setTimeout(() => setScale(1), 50);
    }
  }, []);

  if (!show) return null;

  if (isDelivered) {
    return (
      <div className="flex items-center justify-center w-full h-full transition-all duration-300">
        <div 
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"
          style={{
            transform: `scale(${scale})`,
            transition: 'transform 0.3s ease-in-out',
          }}
        ></div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center justify-center w-full h-full transition-all duration-300"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      <Package 
        className={`${sizeClasses[size]} text-yellow-400 drop-shadow-lg`}
        style={{
          filter: isAnimating 
            ? 'drop-shadow(0 0 15px rgba(255, 200, 0, 0.6))' 
            : 'drop-shadow(0 0 5px rgba(255, 200, 0, 0.3))',
          transition: 'all 0.3s ease-in-out',
        }}
      />
      {isAnimating && (
        <div className="absolute inset-[-4px] rounded-full bg-yellow-400/10 blur-md animate-pulse"></div>
      )}
    </div>
  );
};

export default Paquete;
