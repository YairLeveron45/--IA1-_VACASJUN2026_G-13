"""Aplicación del efecto mecánico de una acción sobre el mundo.

La acción YA fue decidida por Prolog; aquí solo se ejecuta su efecto sobre el
estado (mover, recoger, entregar) y se actualizan las estadísticas. No hay
ninguna lógica de decisión: eso vive exclusivamente en la base de conocimiento.
"""
from __future__ import annotations

from domain.entities import EstadoPaquete
from domain.estado import EstadoSimulacion

# Desplazamiento (dx, dy) por cada acción de movimiento.
_DELTA = {
    "mover_arriba": (0, -1),
    "mover_abajo": (0, 1),
    "mover_izquierda": (-1, 0),
    "mover_derecha": (1, 0),
}


def aplicar(estado: EstadoSimulacion, id_robot: str, accion: str) -> None:
    """Ejecuta el efecto de una accion sobre el estado (sin decidir, solo ejecutar)."""
    robot = estado.robot(id_robot)

    if accion in _DELTA:                                    # mover robot
        dx, dy = _DELTA[accion]
        nx, ny = robot.x + dx, robot.y + dy
        if estado.grid.dentro(nx, ny) and not estado.hay_obstaculo(nx, ny):
            robot.x, robot.y = nx, ny
            estado.stats.movimientos += 1

    elif accion == "recoger_paquete":                       # tomar paquete si esta en la misma celda
        for p in estado.paquetes:
            if p.estado == EstadoPaquete.PENDIENTE and p.x == robot.x and p.y == robot.y:
                p.estado = EstadoPaquete.TOMADO
                robot.carga = p.id
                break

    elif accion == "entregar_paquete":                      # entregar paquete si esta sobre la zona destino
        if robot.carga is not None:
            p = estado.paquete(robot.carga)
            p.estado = EstadoPaquete.ENTREGADO
            robot.carga = None
            estado.stats.entregas += 1
    # "esperar" -> sin efecto
