import React from 'react';
import { Activity, Cpu, Wifi } from 'lucide-react';

interface HeaderProps {
  status: 'ready' | 'running' | 'paused' | 'finished';
}

const Header: React.FC<HeaderProps> = ({ status }) => {
  const statusConfig = {
    ready: { label: 'Simulación Lista', color: 'text-yellow-400', icon: Activity },
    running: { label: 'En Ejecución', color: 'text-green-400', icon: Activity },
    paused: { label: 'Pausada', color: 'text-orange-400', icon: Activity },
    finished: { label: 'Finalizada', color: 'text-blue-400', icon: Activity },
  };

  const config = statusConfig[status];

  return (
    <header className="glass-effect px-8 py-4 flex items-center justify-between border-b border-neon-blue/20">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-blue-800/20 blur-xl rounded-xl"></div>
        </div>
        <div>
          <h1 
            className="text-3xl font-extrabold bg-gradient-to-r from-black via-blue-900 to-blue-700 bg-clip-text text-transparent tracking-tight"
            style={{
              textShadow: '0 0 20px rgba(0, 150, 255, 0.15), 0 0 40px rgba(0, 150, 255, 0.05)',
            }}
          >
            Smart Warehouse
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-wider">
            G13
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 border border-neon-blue/10">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${config.color}`}></div>
          <span className={`text-sm font-medium ${config.color}`}>
            {config.label}
          </span>
          <Wifi className="w-4 h-4 text-neon-blue/60 ml-2" />
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs text-gray-400 font-mono">
          Inteligencia Artificial 1
        </p>
        <p className="text-[10px] text-gray-500 font-mono">
          PROYECTO 2 VJ2026
        </p>
      </div>
    </header>
  );
};

export default Header;
