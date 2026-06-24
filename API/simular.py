"""Demo de validación de la FASE 1 (decisión 100% en Prolog).

Corre el ciclo decidir -> aplicar con un solo robot hasta entregar todos los
paquetes, imprimiendo el rastro. Usa la misma lógica de dominio que el servicio
de la Fase 2 (domain.acciones.aplicar y mundos.mundo_demo), sin el orquestador.

Ejecutar (desde la carpeta API/):
    PROLOG_FILE=../prolog/warehouse.pl python simular.py
"""
from __future__ import annotations

import os

from domain import acciones
from inference.prolog_adapter import PrologAdapter
from mundos import mundo_demo


def main() -> None:
    ruta = os.environ.get("PROLOG_FILE", "../prolog/warehouse.pl")
    estado = mundo_demo()
    motor = PrologAdapter(ruta)

    MAX_PASOS = 200
    for paso in range(1, MAX_PASOS + 1):
        if estado.todos_entregados():
            print(f"\n✔ Todos los paquetes entregados en {estado.stats.pasos} pasos.")
            break
        estado.stats.pasos = paso
        for id_robot, accion in motor.decidir(estado).items():
            r = estado.robot(id_robot)
            print(f"paso {paso:3d} | {id_robot} ({r.x},{r.y}) carga={r.carga or '-'} -> {accion}")
            acciones.aplicar(estado, id_robot, accion)
    else:
        print("\n✖ Se agotó el límite de pasos sin entregar todo.")

    print(f"\nEntregas: {estado.stats.entregas} | Movimientos: {estado.stats.movimientos}")


if __name__ == "__main__":
    main()
