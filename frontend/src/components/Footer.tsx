import React from 'react';
import { Github, Database, Code, Cpu } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass-effect rounded-xl mx-8 mb-6 p-4 border border-neon-blue/10 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Database className="w-3.5 h-3.5 text-neon-blue/60" />
            <span>Prolog v7.6</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Code className="w-3.5 h-3.5 text-neon-blue/60" />
            <span>Python 3.11</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Cpu className="w-3.5 h-3.5 text-neon-blue/60" />
            <span>React 18</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span>© 2026 Smart Warehouse</span>
          <span className="w-px h-4 bg-gray-700"></span>
          <span>USAC · Ingeniería en Ciencias y Sistemas</span>
          <span className="w-px h-4 bg-gray-700"></span>
          <a 
            href="#" 
            className="hover:text-neon-blue transition-colors flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-3.5 h-3.5" />
            Repositorio
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;