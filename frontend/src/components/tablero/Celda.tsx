import React from 'react';
import Obstaculo from './Obstaculo';
import Paquete from './Paquete';
import ZonaEntrega from './ZonaEntrega';

interface CeldaProps {
  x: number;
  y: number;
  tieneObstaculo: boolean;
  tienePaquete: boolean;
  paqueteEntregado?: boolean;
  tieneZonaEntrega: boolean;
  zonaNombre?: string;
  zonaActiva?: boolean;
  esCeldaOrigen: boolean;
  esPasoTransicion: boolean;
  showTrail: boolean;
  isEven: boolean;
  tieneRobot?: boolean;
  isAnimating?: boolean;
  onPaqueteEntregado?: () => void;
}

const Celda: React.FC<CeldaProps> = ({
  tieneObstaculo,
  tienePaquete,
  paqueteEntregado = false,
  tieneZonaEntrega,
  zonaNombre,
  zonaActiva = false,
  esCeldaOrigen,
  esPasoTransicion,
  showTrail,
  isEven,
  tieneRobot = false,
  isAnimating = false,
  onPaqueteEntregado,
}) => {
  let cellStyle = 'bg-dark-200/40 hover:bg-dark-100/60 transition-all duration-200';
  let cellContent = null;

  // Si tiene robot, la celda queda vacía (el robot se renderiza encima)
  if (tieneRobot) {
    cellStyle = 'bg-transparent';
    cellContent = null;
  } else if (tieneObstaculo) {
    cellStyle += ' bg-gradient-to-br from-gray-800 to-gray-900 border border-red-500/20';
    cellContent = <Obstaculo size="md" isAnimating={isAnimating} />;
  } else if (tieneZonaEntrega) {
    cellStyle += ' bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-400/30';
    cellContent = (
      <ZonaEntrega 
        size="md" 
        name={zonaNombre} 
        isActive={zonaActiva}
        isAnimating={isAnimating}
      />
    );
  } else if (esCeldaOrigen && showTrail) {
    cellStyle += ' bg-gradient-to-br from-neon-blue/5 to-purple-600/5 border border-neon-blue/10';
    cellContent = (
      <div className="relative">
        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neon-blue/20 animate-pulse"></div>
      </div>
    );
  } else if (esPasoTransicion && showTrail) {
    cellStyle += ' bg-gradient-to-br from-neon-blue/5 to-purple-600/5 border border-neon-blue/10';
    cellContent = (
      <div className="relative">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neon-blue/10 animate-pulse"></div>
      </div>
    );
  } else if (tienePaquete) {
    cellStyle += ' bg-yellow-500/20 border border-yellow-400/30';
    cellContent = (
      <Paquete 
        size="md" 
        isDelivered={paqueteEntregado}
        isAnimating={isAnimating}
        onDeliver={onPaqueteEntregado}
      />
    );
  } else if (isEven) {
    cellStyle += ' bg-dark-300/20';
  }

  return (
    <div
      className={`${cellStyle} rounded-md flex items-center justify-center min-h-[20px] sm:min-h-[28px] transition-all duration-200 relative overflow-hidden`}
    >
      {cellContent}
    </div>
  );
};

export default Celda;
