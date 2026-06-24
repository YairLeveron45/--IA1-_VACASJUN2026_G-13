"""Registro de historial de una simulacion finalizada.

Es el dato que persiste el HistoryRepository para consulta y analisis
posterior, y la base del dashboard de estadisticas.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RegistroHistorial:
    id: str
    creada_en: str
    finalizada_en: str | None
    ancho: int
    alto: int
    num_robots: int
    num_paquetes: int
    num_zonas: int
    num_obstaculos: int
    entregas: int
    movimientos: int
    pasos: int
    tasa_entrega: float          # entregas / paquetes (0.0 .. 1.0)
    estado_final: str            # "completada" | "detenida"
