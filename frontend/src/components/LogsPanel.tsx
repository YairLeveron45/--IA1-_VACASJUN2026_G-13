import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, Info, Terminal, XCircle } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface LogsPanelProps {
  logs: LogEntry[];
  isSlidebar?: boolean;
}

const LogsPanel: React.FC<LogsPanelProps> = ({ logs, isSlidebar = false }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />;
      case 'error': return <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />;
    }
  };

  const containerClass = isSlidebar
    ? 'bg-black/40 rounded-lg p-3 h-full overflow-y-auto font-mono text-xs border border-blue-500/10'
    : 'bg-black/60 rounded-lg p-3 h-[calc(100%-40px)] min-h-[400px] overflow-y-auto font-mono text-xs border border-neon-blue/5';

  const headerClass = isSlidebar ? 'hidden' : 'flex items-center gap-2 mb-3';

  return (
    <div className={isSlidebar ? 'h-full' : 'glass-effect rounded-xl p-4 border border-neon-blue/10 h-full min-h-[500px]'}>
      <div className={headerClass}>
        <Terminal className="w-4 h-4 text-neon-blue" />
        <h3 className="text-sm font-semibold text-neon-blue/80 tracking-wider uppercase">
          Historial de Inferencia Logica
        </h3>
        <span className="ml-auto text-xs text-gray-500 font-mono">
          {logs.length} eventos
        </span>
      </div>

      <div className={containerClass}>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <Terminal className="w-8 h-8 mb-2 text-gray-700" />
            <p>Esperando decisiones de Prolog...</p>
            <p className="text-[10px] text-gray-700 mt-1">Los logs apareceran aqui</p>
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 py-1.5 hover:bg-white/5 rounded px-2 transition-colors border-b border-white/5 last:border-0">
                <ChevronRight className="w-3 h-3 text-blue-400/40 mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 flex-shrink-0 text-[10px]">{log.timestamp}</span>
                {getLogIcon(log.type)}
                <span className={`${getLogColor(log.type)} break-all text-xs`}>
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default LogsPanel;
