"""Servicio de estadísticas.

Calcula las métricas del dashboard a partir del estado de una simulación. Es
lógica de solo lectura (no muta el mundo), separada del SimulationService para
poder evolucionar las métricas sin tocar el ciclo de ejecución.
"""
from __future__ import annotations

from dataclasses import dataclass

from domain.entities import EstadoPaquete
from domain.estado import EstadoSimulacion


@dataclass
class MetricasSimulacion:
    entregas: int
    total_paquetes: int
    pendientes: int
    movimientos: int
    pasos: int
    tasa_entrega: float                 # entregas / total (0.0 .. 1.0)
    movimientos_por_entrega: float | None


class StatsService:
    def metricas(self, estado: EstadoSimulacion) -> MetricasSimulacion:
        """Calcula metricas del dashboard a partir del estado actual."""
        total = len(estado.paquetes)
        entregas = sum(
            1 for p in estado.paquetes if p.estado == EstadoPaquete.ENTREGADO
        )
        movimientos = estado.stats.movimientos
        return MetricasSimulacion(
            entregas=entregas,
            total_paquetes=total,
            pendientes=total - entregas,
            movimientos=movimientos,
            pasos=estado.stats.pasos,
            tasa_entrega=(entregas / total) if total else 0.0,
            movimientos_por_entrega=(movimientos / entregas) if entregas else None,
        )
