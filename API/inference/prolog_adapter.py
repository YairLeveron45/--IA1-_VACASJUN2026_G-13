"""Puente entre el dominio (Python) y el motor de inferencia (SWI-Prolog) vía pyswip.

Responsabilidad ÚNICA: traducir el estado del mundo a hechos Prolog, consultar
la regla `decidir_accion/2` y devolver la acción elegida para cada robot.

⚠️ Cumple la restricción del enunciado: la DECISIÓN nace en Prolog. Este módulo
no contiene lógica de navegación ni de selección de rutas; solo asierta hechos y
lee el resultado. La ejecución mecánica de la acción ya elegida la realiza
SimulationService (Fase 2).

Nota de diseño: esto es un *adapter*, no un repository. El repository pattern se
aplica a la persistencia (simulaciones activas e historial); el motor de
inferencia es una dependencia externa que se aísla detrás de esta clase.
"""
from __future__ import annotations

from pyswip import Prolog

from domain.estado import EstadoSimulacion

# Predicados dinámicos que se reescriben por completo en cada tick.
_DINAMICOS: list[tuple[str, int]] = [
    ("dimension", 2),
    ("obstaculo", 2),
    ("zona_entrega", 3),
    ("paquete", 5),
    ("robot", 4),
]


class PrologAdapter:
    def __init__(self, ruta_kb: str) -> None:
        self._prolog = Prolog()
        self._prolog.consult(ruta_kb)

    def decidir(self, estado: EstadoSimulacion) -> dict[str, str]:
        """Devuelve {id_robot: accion} con la acción que Prolog eligió para cada robot."""
        self._sincronizar(estado)
        acciones: dict[str, str] = {}
        for robot in estado.robots:
            resultados = list(self._prolog.query(f"decidir_accion({robot.id}, Accion)"))
            acciones[robot.id] = resultados[0]["Accion"] if resultados else "esperar"
        return acciones

    # --- interno ---
    def _sincronizar(self, estado: EstadoSimulacion) -> None:
        # 1) Limpiar el mundo del tick anterior.
        for nombre, aridad in _DINAMICOS:
            comodines = ",".join(["_"] * aridad)
            list(self._prolog.query(f"retractall({nombre}({comodines}))"))

        # 2) Asertar el mundo actual.
        self._prolog.assertz(f"dimension({estado.grid.ancho},{estado.grid.alto})")

        for o in estado.obstaculos:
            self._prolog.assertz(f"obstaculo({o.x},{o.y})")

        for z in estado.zonas:
            self._prolog.assertz(f"zona_entrega({z.id},{z.x},{z.y})")

        for p in estado.paquetes:
            self._prolog.assertz(
                f"paquete({p.id},{p.x},{p.y},{p.zona_destino},{p.estado.value})"
            )

        for r in estado.robots:
            carga = r.carga if r.carga is not None else "libre"
            self._prolog.assertz(f"robot({r.id},{r.x},{r.y},{carga})")
