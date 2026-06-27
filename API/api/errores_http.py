"""Traducción de excepciones de dominio a respuestas HTTP.

Mantiene los routers limpios: lanzan/propagan excepciones de dominio y aquí se
convierten en el código y cuerpo HTTP adecuados.
"""
from __future__ import annotations

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from domain.errores import ConfiguracionInvalida, SimulacionNoEncontrada


def registrar_manejadores(app: FastAPI) -> None:
    """Registra manejadores de excepciones de dominio como errores HTTP."""

    @app.exception_handler(SimulacionNoEncontrada)
    async def _no_encontrada(request: Request, exc: SimulacionNoEncontrada):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detalle": str(exc), "id": exc.id_sim},
        )

    @app.exception_handler(ConfiguracionInvalida)
    async def _config_invalida(request: Request, exc: ConfiguracionInvalida):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detalle": str(exc), "errores": exc.errores},
        )
