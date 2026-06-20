import React from 'react';
import { Play } from 'lucide-react';

interface BotonReanudarProps {
  onClick: () => void;
  disabled?: boolean;
}

const BotonReanudar: React.FC<BotonReanudarProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex-1 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-blue-700/40 
                 hover:from-blue-800/80 hover:via-blue-700/60 hover:to-blue-600/40
                 text-white font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 
                 border border-blue-500/20 hover:border-blue-400/40 
                 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20
                 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                 min-h-[44px]"
    >
      <Play className="w-4 h-4" />
      Reanudar
    </button>
  );
};

export default BotonReanudar;
