"""Conversión entre entidades del dominio y DTOs de la API.

Aísla la traducción en un solo lugar: los routers no construyen DTOs a mano.
"""
from __future__ import annotations

from api import schemas
from domain.entities import Obstaculo, Paquete, Robot, ZonaEntrega
from domain.estado import EstadoSimulacion
from domain.grid import Grid
from domain.historial import RegistroHistorial
from domain.simulacion import Simulacion
from services.stats_service import MetricasSimulacion


def config_a_estado(c: schemas.ConfiguracionDTO) -> EstadoSimulacion:
    """Convierte ConfiguracionDTO (API) a EstadoSimulacion (domain)."""
    return EstadoSimulacion(
        grid=Grid(ancho=c.ancho, alto=c.alto),
        robots=[Robot(id=r.id, x=r.x, y=r.y) for r in c.robots],
        paquetes=[
            Paquete(id=p.id, x=p.x, y=p.y, zona_destino=p.zona_destino)
            for p in c.paquetes
        ],
        zonas=[ZonaEntrega(id=z.id, x=z.x, y=z.y) for z in c.zonas],
        obstaculos=[Obstaculo(x=o.x, y=o.y) for o in c.obstaculos],
    )


def estado_a_dto(e: EstadoSimulacion) -> schemas.EstadoDTO:
    """Convierte EstadoSimulacion (domain) a EstadoDTO (API)."""
    return schemas.EstadoDTO(
        ancho=e.grid.ancho,
        alto=e.grid.alto,
        robots=[schemas.RobotDTO(id=r.id, x=r.x, y=r.y, carga=r.carga) for r in e.robots],
        paquetes=[
            schemas.PaqueteDTO(
                id=p.id, x=p.x, y=p.y,
                zona_destino=p.zona_destino, estado=p.estado.value,
            )
            for p in e.paquetes
        ],
        zonas=[schemas.ZonaDTO(id=z.id, x=z.x, y=z.y) for z in e.zonas],
        obstaculos=[schemas.ObstaculoDTO(x=o.x, y=o.y) for o in e.obstaculos],
        stats=schemas.StatsDTO(
            entregas=e.stats.entregas,
            movimientos=e.stats.movimientos,
            pasos=e.stats.pasos,
        ),
    )


def simulacion_a_dto(s: Simulacion) -> schemas.SimulacionDTO:
    """Convierte Simulacion (domain) a SimulacionDTO (API)."""
    return schemas.SimulacionDTO(
        id=s.id,
        ejecucion=s.ejecucion.value,
        creada_en=s.creada_en,
        finalizada_en=s.finalizada_en,
        estado=estado_a_dto(s.estado),
    )


def metricas_a_dto(m: MetricasSimulacion) -> schemas.MetricasDTO:
    """Convierte MetricasSimulacion a MetricasDTO."""
    return schemas.MetricasDTO(
        entregas=m.entregas,
        total_paquetes=m.total_paquetes,
        pendientes=m.pendientes,
        movimientos=m.movimientos,
        pasos=m.pasos,
        tasa_entrega=m.tasa_entrega,
        movimientos_por_entrega=m.movimientos_por_entrega,
    )


def historial_a_dto(r: RegistroHistorial) -> schemas.RegistroHistorialDTO:
    """Convierte RegistroHistorial a RegistroHistorialDTO."""
    return schemas.RegistroHistorialDTO(**r.__dict__)
