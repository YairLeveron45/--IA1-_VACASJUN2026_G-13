"""Mapa (grilla) de la bodega.

Convención de coordenadas — clave para que el frontend renderice igual que el
backend razona:

    x = columna, crece hacia la DERECHA   (0 .. ancho-1)
    y = fila,    crece hacia ABAJO        (0 .. alto-1)
    origen (0,0) = esquina superior izquierda

Acciones de movimiento y su efecto sobre las coordenadas:

    mover_derecha   -> x + 1        mover_izquierda -> x - 1
    mover_abajo     -> y + 1        mover_arriba    -> y - 1
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Grid:
    ancho: int   # número de columnas (>= 10 por el enunciado)
    alto: int    # número de filas

    def dentro(self, x: int, y: int) -> bool:
        return 0 <= x < self.ancho and 0 <= y < self.alto      # True si (x,y) esta dentro del mapa
