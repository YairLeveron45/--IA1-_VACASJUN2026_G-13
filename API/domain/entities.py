"""Entidades puras del dominio.

No dependen de FastAPI, Pydantic ni Prolog: solo datos e invariantes simples.
Los DTOs de la API (Pydantic) viven en la capa `api/` (Fase 3); el puente a
Prolog vive en `inference/`. Mantener este módulo libre de dependencias es lo
que permite que el repository pattern y el motor de inferencia sean piezas
intercambiables.
"""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum


class Accion(str, Enum):
    """Acciones que un robot puede ejecutar (las define el enunciado)."""
    MOVER_ARRIBA = "mover_arriba"
    MOVER_ABAJO = "mover_abajo"
    MOVER_IZQUIERDA = "mover_izquierda"
    MOVER_DERECHA = "mover_derecha"
    RECOGER = "recoger_paquete"
    ENTREGAR = "entregar_paquete"
    ESPERAR = "esperar"


class EstadoPaquete(str, Enum):
    PENDIENTE = "pendiente"   # aún en su origen, esperando ser recogido
    TOMADO = "tomado"         # lo transporta un robot
    ENTREGADO = "entregado"   # ya llegó a su zona de entrega


@dataclass
class Robot:
    id: str          # atom Prolog válido: r1, r2, ...
    x: int
    y: int
    carga: str | None = None   # id del paquete que transporta, o None si está libre


@dataclass
class Paquete:
    id: str          # p1, p2, ...
    x: int
    y: int
    zona_destino: str           # id de la ZonaEntrega a la que debe llegar
    estado: EstadoPaquete = EstadoPaquete.PENDIENTE


@dataclass
class ZonaEntrega:
    id: str          # z1, z2, ...
    x: int
    y: int


@dataclass
class Obstaculo:
    x: int
    y: int
