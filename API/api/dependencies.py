"""Inyección de dependencias.

Construye el SimulationService una sola vez (singleton vía lru_cache) y lo
inyecta en los routers con Depends(get_service). En los tests se sustituye con
app.dependency_overrides[get_service].
"""
from __future__ import annotations

import os
from functools import lru_cache

from inference.prolog_adapter import PrologAdapter
from repositories.memoria import SimulacionEnMemoria
from repositories.sqlite_historial import HistorialSQLite
from services.simulation_service import SimulationService
from services.stats_service import StatsService


@lru_cache
def get_service() -> SimulationService:
    ruta_kb = os.environ.get("PROLOG_FILE", "prolog/warehouse.pl")
    ruta_db = os.environ.get("HISTORIAL_DB", "data/historial.db")
    return SimulationService(
        adapter=PrologAdapter(ruta_kb),
        sim_repo=SimulacionEnMemoria(),
        hist_repo=HistorialSQLite(ruta_db),
        stats=StatsService(),
    )
