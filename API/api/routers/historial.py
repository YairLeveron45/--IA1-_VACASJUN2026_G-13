"""Endpoints REST del historial de simulaciones finalizadas."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from api import mappers, schemas
from api.dependencies import get_service
from services.simulation_service import SimulationService

router = APIRouter(prefix="/historial", tags=["historial"])


@router.get("", response_model=list[schemas.RegistroHistorialDTO], summary="Listar historial")
def listar(servicio: SimulationService = Depends(get_service)):
    """Devuelve todo el historial de simulaciones finalizadas."""
    return [mappers.historial_a_dto(r) for r in servicio.historial()]


@router.get("/{id_sim}", response_model=schemas.RegistroHistorialDTO, summary="Obtener un registro")
def obtener(id_sim: str, servicio: SimulationService = Depends(get_service)):
    """Devuelve un registro de historial por id de simulacion."""
    registro = servicio.historial_de(id_sim)
    if registro is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hay historial para la simulación '{id_sim}'.",
        )
    return mappers.historial_a_dto(registro)
