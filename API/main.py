"""Punto de entrada de la API (FastAPI) — Smart Warehouse backend.

Ensambla CORS, los routers REST, el WebSocket y los manejadores de error.
La documentación interactiva queda autogenerada en /docs (Swagger) y /redoc.
"""
from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.errores_http import registrar_manejadores
from api.routers import historial, simulaciones, ws

app = FastAPI(
    title="Smart Warehouse API",
    version="1.0.0",
    description=(
        "Backend de simulación de bodega inteligente. Las decisiones de los "
        "robots se toman en SWI-Prolog; esta API expone el control de la "
        "simulación, las métricas y el historial."
    ),
)

# CORS: en desarrollo se permite cualquier origen. En producción, restringir a
# la URL del frontend mediante la variable CORS_ORIGINS (separada por comas).
_origenes = os.environ.get("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origenes,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

registrar_manejadores(app)
app.include_router(simulaciones.router)
app.include_router(historial.router)
app.include_router(ws.router)


@app.get("/", tags=["salud"])
def raiz():
    """Endpoint raiz: informacion basica del servicio."""
    return {"servicio": "smart-warehouse-backend", "estado": "ok"}


@app.get("/health", tags=["salud"])
def health():
    """Health check para Docker Compose."""
    return {"status": "ok"}
