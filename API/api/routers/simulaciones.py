"""Endpoints REST de simulación.

Cada endpoint traduce HTTP a una llamada del SimulationService y mapea el
resultado a un DTO. No contiene lógica de negocio.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, status

from api import mappers, schemas
from api.dependencies import get_service
from services.simulation_service import SimulationService

router = APIRouter(prefix="/simulaciones", tags=["simulaciones"])


@router.post(
    "",
    response_model=schemas.SimulacionDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Crear una simulación",
)
def crear(config: schemas.ConfiguracionDTO, servicio: SimulationService = Depends(get_service)):
    """Crea una nueva simulacion a partir de la configuracion enviada."""
    sim = servicio.crear(mappers.config_a_estado(config))
    return mappers.simulacion_a_dto(sim)


@router.get("", response_model=list[schemas.SimulacionDTO], summary="Listar simulaciones activas")
def listar(servicio: SimulationService = Depends(get_service)):
    """Devuelve todas las simulaciones activas en memoria."""
    return [mappers.simulacion_a_dto(s) for s in servicio.listar()]


@router.get("/{id_sim}", response_model=schemas.SimulacionDTO, summary="Obtener el estado actual")
def obtener(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Obtiene el estado actual de una simulacion por su id."""
    return mappers.simulacion_a_dto(servicio.obtener(id_sim))


@router.post("/{id_sim}/paso", response_model=schemas.SimulacionDTO, summary="Avanzar un paso")
def paso(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Ejecuta un solo tick de simulacion."""
    return mappers.simulacion_a_dto(servicio.paso(id_sim))


@router.post(
    "/{id_sim}/ejecutar",
    response_model=schemas.SimulacionDTO,
    summary="Modo automático hasta finalizar (no streaming)",
)
def ejecutar(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Ejecuta la simulacion en modo automatico hasta finalizar o pausar."""
    return mappers.simulacion_a_dto(servicio.ejecutar(id_sim))


@router.post("/{id_sim}/pausar", response_model=schemas.SimulacionDTO, summary="Pausar el modo automático")
def pausar(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Pausa la ejecucion automatica."""
    return mappers.simulacion_a_dto(servicio.pausar(id_sim))


@router.post("/{id_sim}/reanudar", response_model=schemas.SimulacionDTO, summary="Reanudar el modo automático")
def reanudar(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Reanuda desde pausa o inicia la ejecucion automatica."""
    return mappers.simulacion_a_dto(servicio.reanudar(id_sim))


@router.post("/{id_sim}/reiniciar", response_model=schemas.SimulacionDTO, summary="Reiniciar a la configuración inicial")
def reiniciar(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Reinicia la simulacion a su estado original."""
    return mappers.simulacion_a_dto(servicio.reiniciar(id_sim))


@router.get("/{id_sim}/metricas", response_model=schemas.MetricasDTO, summary="Métricas para el dashboard")
def metricas(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Obtiene las metricas actuales de la simulacion."""
    return mappers.metricas_a_dto(servicio.metricas(id_sim))


@router.delete("/{id_sim}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar una simulación")
def eliminar(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Elimina una simulacion activa."""
    servicio.eliminar(id_sim)
