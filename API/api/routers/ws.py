"""Canal WebSocket para el modo automático en tiempo real.

El frontend abre el socket y envía comandos; el backend empuja el estado tras
cada paso, sin que el cliente tenga que hacer polling.

----------------------------------------------------------------------
Comandos que envía el cliente (JSON):
    {"comando": "ejecutar", "intervalo_ms": 300}   inicia/continúa el automático
    {"comando": "pausar"}                            pausa el automático
    {"comando": "paso"}                              avanza un solo paso
    {"comando": "reiniciar"}                         vuelve al estado inicial
    {"comando": "cerrar"}                            termina la sesión

Mensajes que emite el servidor (JSON):
    {"tipo": "estado", "simulacion": {...}}   tras cada paso (ver SimulacionDTO)
    {"tipo": "fin",    "simulacion": {...}}   cuando la simulación finaliza
    {"tipo": "error",  "mensaje": "..."}      ante un problema
----------------------------------------------------------------------
"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from api import mappers
from api.dependencies import get_service
from domain.errores import SimulacionNoEncontrada
from domain.simulacion import EstadoEjecucion
from services.simulation_service import SimulationService

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/simulaciones/{id_sim}")
async def ws_simulacion(
    websocket: WebSocket,
    id_sim: str,
    servicio: SimulationService = Depends(get_service),
):
    await websocket.accept()

    # Verificar que la simulación exista antes de empezar.
    try:
        servicio.obtener(id_sim)
    except SimulacionNoEncontrada:
        await websocket.send_json({"tipo": "error", "mensaje": f"No existe la simulación '{id_sim}'."})
        await websocket.close(code=4404)
        return

    intervalo = {"s": 0.3}      # mutable para que el receptor lo ajuste
    detener = asyncio.Event()

    async def enviar_estado(sim, tipo: str = "estado"):
        await websocket.send_json(
            {"tipo": tipo, "simulacion": mappers.simulacion_a_dto(sim).model_dump()}
        )

    async def productor():
        """Avanza el automático y empuja cada paso mientras esté EN_EJECUCION."""
        while not detener.is_set():
            sim = servicio.obtener(id_sim)
            if sim.ejecucion == EstadoEjecucion.EN_EJECUCION:
                # paso() toca Prolog (bloqueante) -> a un thread para no frenar el loop.
                sim = await asyncio.to_thread(servicio.paso, id_sim)
                await enviar_estado(sim)
                if sim.ejecucion == EstadoEjecucion.FINALIZADA:
                    await enviar_estado(sim, tipo="fin")
                await asyncio.sleep(intervalo["s"])
            else:
                await asyncio.sleep(0.05)

    async def receptor():
        """Lee comandos del cliente y ajusta el estado de ejecución."""
        while not detener.is_set():
            msg = await websocket.receive_json()
            comando = msg.get("comando")
            if comando == "ejecutar":
                intervalo["s"] = max(0.05, msg.get("intervalo_ms", 300) / 1000)
                servicio.reanudar(id_sim)
            elif comando == "pausar":
                servicio.pausar(id_sim)
            elif comando == "paso":
                sim = await asyncio.to_thread(servicio.paso, id_sim)
                await enviar_estado(sim)
            elif comando == "reiniciar":
                await enviar_estado(servicio.reiniciar(id_sim))
            elif comando == "cerrar":
                detener.set()

    tarea_productor = asyncio.create_task(productor())
    try:
        await receptor()
    except WebSocketDisconnect:
        pass
    finally:
        detener.set()
        tarea_productor.cancel()
        try:
            await tarea_productor
        except asyncio.CancelledError:
            pass
