"""Agregado `Simulacion`: une el estado del mundo con los metadatos de control.

El repository de simulaciones guarda objetos de este tipo (no `EstadoSimulacion`
crudo), porque además del mundo necesitamos saber en qué punto del ciclo de vida
está y poder reiniciarlo a su configuración original.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

from domain.estado import EstadoSimulacion


def _ahora() -> str:
    return datetime.now(timezone.utc).isoformat()       # timestamp ISO 8601 actual


class EstadoEjecucion(str, Enum):
    CREADA = "creada"            # recién construida, sin pasos ejecutados
    EN_EJECUCION = "en_ejecucion"  # corriendo en modo automático
    PAUSADA = "pausada"         # automático detenido temporalmente
    FINALIZADA = "finalizada"   # completada o detenida (no admite más pasos)


@dataclass
class Simulacion:
    id: str
    estado: EstadoSimulacion              # mundo actual (muta con cada paso)
    estado_inicial: EstadoSimulacion      # snapshot para reiniciar
    ejecucion: EstadoEjecucion = EstadoEjecucion.CREADA
    creada_en: str = field(default_factory=_ahora)
    finalizada_en: str | None = None
