export interface SimulationStatus {
  isRunning: boolean;
  isPaused: boolean;
  mode: 'auto' | 'step';
  time: number;
}

export interface Robot {
  id: string;
  x: number;
  y: number;
  carrying: boolean;
  packageId?: string;
}

export interface Package {
  id: string;
  x: number;
  y: number;
  destination: { x: number; y: number };
  delivered: boolean;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
}

export interface DeliveryZone {
  id: string;
  x: number;
  y: number;
  name: string;
}

export interface Statistics {
  deliveries: number;
  movements: number;
  efficiency: number;
  timeElapsed: number;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
