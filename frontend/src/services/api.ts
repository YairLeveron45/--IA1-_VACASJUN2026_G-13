import type { DeliveryZone, Obstacle, Package, Robot } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface ConfiguracionDTO {
  ancho: number;
  alto: number;
  robots: Array<{ id: string; x: number; y: number }>;
  paquetes: Array<{ id: string; x: number; y: number; zona_destino: string }>;
  zonas: Array<{ id: string; x: number; y: number }>;
  obstaculos: Array<{ x: number; y: number }>;
}

export interface SimulacionDTO {
  id: string;
  ejecucion: 'creada' | 'en_ejecucion' | 'pausada' | 'finalizada';
  creada_en: string;
  finalizada_en: string | null;
  estado: {
    ancho: number;
    alto: number;
    robots: Array<{ id: string; x: number; y: number; carga: string | null }>;
    paquetes: Array<{
      id: string;
      x: number;
      y: number;
      zona_destino: string;
      estado: 'pendiente' | 'tomado' | 'entregado';
    }>;
    zonas: Array<{ id: string; x: number; y: number }>;
    obstaculos: Array<{ x: number; y: number }>;
    stats: {
      entregas: number;
      movimientos: number;
      pasos: number;
    };
  };
}

interface ApiErrorBody {
  detalle?: string;
  errores?: string[];
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = body.errores?.join(' ') || body.detalle || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};

export const api = {
  crearSimulacion: (config: ConfiguracionDTO) =>
    request<SimulacionDTO>('/simulaciones', {
      method: 'POST',
      body: JSON.stringify(config),
    }),
  paso: (id: string) => request<SimulacionDTO>(`/simulaciones/${id}/paso`, { method: 'POST' }),
  pausar: (id: string) => request<SimulacionDTO>(`/simulaciones/${id}/pausar`, { method: 'POST' }),
  reanudar: (id: string) => request<SimulacionDTO>(`/simulaciones/${id}/reanudar`, { method: 'POST' }),
  reiniciar: (id: string) => request<SimulacionDTO>(`/simulaciones/${id}/reiniciar`, { method: 'POST' }),
};

export const mapSimulacionToUi = (simulacion: SimulacionDTO) => {
  const zonasPorId = new Map(simulacion.estado.zonas.map((zona) => [zona.id, zona]));

  const robots: Robot[] = simulacion.estado.robots.map((robot) => ({
    id: robot.id,
    x: robot.x,
    y: robot.y,
    carrying: robot.carga !== null,
    packageId: robot.carga ?? undefined,
  }));

  const packages: Package[] = simulacion.estado.paquetes.map((paquete) => {
    const zona = zonasPorId.get(paquete.zona_destino);
    return {
      id: paquete.id,
      x: paquete.x,
      y: paquete.y,
      destination: {
        x: zona?.x ?? paquete.x,
        y: zona?.y ?? paquete.y,
      },
      delivered: paquete.estado !== 'pendiente',
    };
  });

  const deliveryZones: DeliveryZone[] = simulacion.estado.zonas.map((zona) => ({
    id: zona.id,
    x: zona.x,
    y: zona.y,
    name: zona.id.toUpperCase(),
  }));

  const obstacles: Obstacle[] = simulacion.estado.obstaculos.map((obstaculo, index) => ({
    id: index + 1,
    x: obstaculo.x,
    y: obstaculo.y,
  }));

  return { robots, packages, deliveryZones, obstacles };
};
