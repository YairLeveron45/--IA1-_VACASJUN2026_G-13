"""Mundos de ejemplo (fixtures) reutilizables por demos y pruebas."""
from __future__ import annotations

from domain.entities import Obstaculo, Paquete, Robot, ZonaEntrega
from domain.estado import EstadoSimulacion
from domain.grid import Grid


def mundo_demo() -> EstadoSimulacion:
    """Mundo 10x10 con 1 robot, 2 paquetes, 2 zonas y 8 obstáculos.

    Los obstáculos no bloquean las rutas, de modo que la navegación greedy
    entrega ambos paquetes. Sirve para validar el flujo de punta a punta.
    """
    return EstadoSimulacion(
        grid=Grid(ancho=10, alto=10),
        robots=[Robot(id="r1", x=0, y=0)],
        zonas=[
            ZonaEntrega(id="z1", x=9, y=0),
            ZonaEntrega(id="z2", x=9, y=9),
        ],
        paquetes=[
            Paquete(id="p1", x=3, y=0, zona_destino="z1"),
            Paquete(id="p2", x=0, y=9, zona_destino="z2"),
        ],
        obstaculos=[
            Obstaculo(4, 4), Obstaculo(4, 5), Obstaculo(4, 6),
            Obstaculo(5, 4), Obstaculo(5, 5), Obstaculo(5, 6),
            Obstaculo(2, 3), Obstaculo(7, 7),
        ],
    )
