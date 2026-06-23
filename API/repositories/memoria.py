"""Repositorio de simulaciones activas en memoria.

Las simulaciones "vivas" no necesitan persistir en disco: se mantienen en un
diccionario mientras la aplicación corre. Cuando una finaliza, su resumen pasa
al HistoryRepository (SQLite), que sí persiste.
"""
from __future__ import annotations

from domain.simulacion import Simulacion
from repositories.base import SimulationRepository


class SimulacionEnMemoria(SimulationRepository):
    def __init__(self) -> None:
        self._datos: dict[str, Simulacion] = {}

    def guardar(self, sim: Simulacion) -> None:
        self._datos[sim.id] = sim

    def obtener(self, id_sim: str) -> Simulacion | None:
        return self._datos.get(id_sim)

    def existe(self, id_sim: str) -> bool:
        return id_sim in self._datos

    def listar(self) -> list[Simulacion]:
        return list(self._datos.values())

    def eliminar(self, id_sim: str) -> None:
        self._datos.pop(id_sim, None)
