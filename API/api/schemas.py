"""DTOs de la API (Pydantic).

Son el contrato público que consume el frontend. Se mantienen separados de las
entidades del dominio: el dominio puede evolucionar sin romper la API, y la API
puede versionarse sin tocar la lógica.

Convención de coordenadas (igual que el dominio y la KB Prolog):
    x = columna (crece a la derecha), y = fila (crece hacia abajo),
    origen (0,0) en la esquina superior izquierda.
"""
from __future__ import annotations

from pydantic import BaseModel, Field

# =====================================================================
#  Entrada: configuración para crear una simulación
# =====================================================================


class RobotEntradaDTO(BaseModel):
    id: str = Field(examples=["r1"], description="Átomo Prolog: minúscula inicial.")
    x: int = Field(examples=[0])
    y: int = Field(examples=[0])


class PaqueteEntradaDTO(BaseModel):
    id: str = Field(examples=["p1"])
    x: int = Field(examples=[3])
    y: int = Field(examples=[0])
    zona_destino: str = Field(examples=["z1"], description="Id de una zona existente.")


class ZonaEntradaDTO(BaseModel):
    id: str = Field(examples=["z1"])
    x: int = Field(examples=[9])
    y: int = Field(examples=[0])


class ObstaculoDTO(BaseModel):
    x: int
    y: int


class ConfiguracionDTO(BaseModel):
    ancho: int = Field(ge=10, examples=[10], description="Columnas (mínimo 10).")
    alto: int = Field(ge=10, examples=[10], description="Filas (mínimo 10).")
    robots: list[RobotEntradaDTO]
    paquetes: list[PaqueteEntradaDTO]
    zonas: list[ZonaEntradaDTO]
    obstaculos: list[ObstaculoDTO] = Field(default_factory=list)


# =====================================================================
#  Salida: estado del mundo y de la simulación
# =====================================================================


class RobotDTO(BaseModel):
    id: str
    x: int
    y: int
    carga: str | None = Field(description="Id del paquete que transporta, o null si está libre.")


class PaqueteDTO(BaseModel):
    id: str
    x: int
    y: int
    zona_destino: str
    estado: str = Field(description="pendiente | tomado | entregado")


class ZonaDTO(BaseModel):
    id: str
    x: int
    y: int


class StatsDTO(BaseModel):
    entregas: int
    movimientos: int
    pasos: int


class EstadoDTO(BaseModel):
    ancho: int
    alto: int
    robots: list[RobotDTO]
    paquetes: list[PaqueteDTO]
    zonas: list[ZonaDTO]
    obstaculos: list[ObstaculoDTO]
    stats: StatsDTO


class SimulacionDTO(BaseModel):
    id: str
    ejecucion: str = Field(description="creada | en_ejecucion | pausada | finalizada")
    creada_en: str
    finalizada_en: str | None
    estado: EstadoDTO


class MetricasDTO(BaseModel):
    entregas: int
    total_paquetes: int
    pendientes: int
    movimientos: int
    pasos: int
    tasa_entrega: float
    movimientos_por_entrega: float | None


class RegistroHistorialDTO(BaseModel):
    id: str
    creada_en: str
    finalizada_en: str | None
    ancho: int
    alto: int
    num_robots: int
    num_paquetes: int
    num_zonas: int
    num_obstaculos: int
    entregas: int
    movimientos: int
    pasos: int
    tasa_entrega: float
    estado_final: str
