"""Interfaces del repository pattern.

Definen el contrato de persistencia sin atarlo a una tecnología concreta. Los
servicios dependen de estas abstracciones, no de las implementaciones, así que
cambiar memoria por Redis o JSON por Postgres no toca la lógica de negocio.
"""
from __future__ import annotations

from abc import ABC, abstractmethod

from domain.historial import RegistroHistorial
from domain.simulacion import Simulacion


class SimulationRepository(ABC):
    """Almacena las simulaciones activas (su estado vivo)."""

    @abstractmethod
    def guardar(self, sim: Simulacion) -> None: ...          # guardar/actualizar simulacion

    @abstractmethod
    def obtener(self, id_sim: str) -> Simulacion | None: ... # obtener por id

    @abstractmethod
    def existe(self, id_sim: str) -> bool: ...                # verificar si existe

    @abstractmethod
    def listar(self) -> list[Simulacion]: ...                 # listar todas

    @abstractmethod
    def eliminar(self, id_sim: str) -> None: ...              # eliminar por id


class HistoryRepository(ABC):
    """Persiste los registros de simulaciones finalizadas."""

    @abstractmethod
    def registrar(self, registro: RegistroHistorial) -> None: ...  # guardar nuevo registro

    @abstractmethod
    def listar(self) -> list[RegistroHistorial]: ...               # listar historial completo

    @abstractmethod
    def obtener(self, id_sim: str) -> RegistroHistorial | None: ...  # buscar por id de simulacion
