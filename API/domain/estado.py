"""Estado completo de una simulación.

Es el "mundo" que el adapter traduce a hechos Prolog en cada tick y que la API
serializará hacia el frontend (Fase 3). Contiene datos y consultas simples; la
lógica de avance del ciclo vive en SimulationService (Fase 2).
"""
from __future__ import annotations

from dataclasses import dataclass, field

from domain.entities import EstadoPaquete, Obstaculo, Paquete, Robot, ZonaEntrega
from domain.grid import Grid


@dataclass
class Estadisticas:
    entregas: int = 0       # paquetes entregados con éxito
    movimientos: int = 0    # movimientos efectivos de robots
    pasos: int = 0          # ticks de simulación ejecutados


@dataclass
class EstadoSimulacion:
    grid: Grid
    robots: list[Robot] = field(default_factory=list)
    paquetes: list[Paquete] = field(default_factory=list)
    zonas: list[ZonaEntrega] = field(default_factory=list)
    obstaculos: list[Obstaculo] = field(default_factory=list)
    stats: Estadisticas = field(default_factory=Estadisticas)
    terminada: bool = False

    # --- Accesos por id ---
    def robot(self, id_robot: str) -> Robot:
        return next(r for r in self.robots if r.id == id_robot)           # busca robot por id

    def paquete(self, id_paquete: str) -> Paquete:
        return next(p for p in self.paquetes if p.id == id_paquete)       # busca paquete por id

    def zona(self, id_zona: str) -> ZonaEntrega:
        return next(z for z in self.zonas if z.id == id_zona)             # busca zona por id

    # --- Consultas de conveniencia ---
    def hay_obstaculo(self, x: int, y: int) -> bool:
        return any(o.x == x and o.y == y for o in self.obstaculos)        # True si hay obstaculo en (x,y)

    def todos_entregados(self) -> bool:
        return all(p.estado == EstadoPaquete.ENTREGADO for p in self.paquetes)  # True si todos entregados
