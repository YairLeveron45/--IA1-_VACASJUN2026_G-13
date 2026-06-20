import React from 'react';
import { Package, Move, TrendingUp, Clock, Award } from 'lucide-react';

interface StatisticsPanelProps {
  deliveries: number;
  movements: number;
  efficiency: number;
  timeElapsed: number;
  robotName?: string;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  deliveries,
  movements,
  efficiency,
  timeElapsed,
  robotName = '',
}) => {
  const stats = [
    {
      icon: Package,
      label: 'Entregas Realizadas',
      value: deliveries,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      icon: Move,
      label: 'Movimientos Ejecutados',
      value: movements,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Eficiencia',
      value: `${efficiency}%`,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: Clock,
      label: 'Tiempo de Ejecución',
      value: `${timeElapsed}s`,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="glass-effect rounded-xl p-6 border border-neon-blue/10">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-neon-blue" />
        <h3 className="text-sm font-semibold text-neon-blue/80 tracking-wider uppercase">
          Estadísticas en Tiempo Real
        </h3>
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <span className="text-2xl font-bold text-white">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-black/40 border border-neon-blue/10">
        <p className="text-xs text-gray-500 text-center font-mono">
           {robotName}  
        </p>
      </div>
    </div>
  );
};

export default StatisticsPanel;