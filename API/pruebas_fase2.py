"""Prueba de integración de la FASE 2.

Ejercita el ciclo completo a través del SimulationService:
  crear -> paso a paso -> automático -> finalización -> historial -> reinicio.

Requiere SWI-Prolog + pyswip (disponibles dentro del contenedor).

Ejecutar (desde la carpeta API/):
    PROLOG_FILE=../prolog/warehouse.pl python pruebas_fase2.py
"""
from __future__ import annotations

import os
import tempfile

from inference.prolog_adapter import PrologAdapter
from mundos import mundo_demo
from repositories.memoria import SimulacionEnMemoria
from repositories.json_historial import HistorialJSON
from services.simulation_service import SimulationService
from services.stats_service import StatsService


def main() -> None:
    """Prueba de integracion Fase 2: crea, paso a paso, automatico, historial y reinicio."""
    ruta_kb = os.environ.get("PROLOG_FILE", "../prolog/warehouse.pl")
    ruta_historial = os.path.join(tempfile.gettempdir(), "historial_test.json")
    if os.path.exists(ruta_historial):
        os.remove(ruta_historial)

    servicio = SimulationService(
        adapter=PrologAdapter(ruta_kb),
        sim_repo=SimulacionEnMemoria(),
        hist_repo=HistorialJSON(ruta_historial),
        stats=StatsService(),
    )

    # 1) Crear simulacion
    sim = servicio.crear(mundo_demo())
    print(f"Creada simulación {sim.id} | estado={sim.ejecucion.value}")
    assert sim.ejecucion.value == "creada"

    # 2) Modo paso a paso (3 pasos)
    for _ in range(3):
        servicio.paso(sim.id)
    m = servicio.metricas(sim.id)
    print(f"Tras 3 pasos -> pasos={m.pasos}, movimientos={m.movimientos}")
    assert m.pasos == 3

    # 3) Modo automatico hasta finalizar
    sim = servicio.ejecutar(sim.id)
    m = servicio.metricas(sim.id)
    print(
        f"Final -> estado={sim.ejecucion.value}, entregas={m.entregas}/"
        f"{m.total_paquetes}, pasos={m.pasos}, tasa={m.tasa_entrega:.2f}"
    )
    assert sim.ejecucion.value == "finalizada"
    assert m.entregas == 2

    # 4) Verificar historial persistido en JSON
    registros = servicio.historial()
    print(f"Registros en historial: {len(registros)} -> {registros[0].estado_final}")
    assert len(registros) == 1
    assert registros[0].estado_final == "completada"

    # 5) Reinicio
    servicio.reiniciar(sim.id)
    m = servicio.metricas(sim.id)
    print(f"Tras reinicio -> entregas={m.entregas}, pasos={m.pasos}")
    assert m.entregas == 0 and m.pasos == 0

    print("\n✔ Fase 2 validada: ciclo completo, historial y reinicio OK.")


if __name__ == "__main__":
    main()
