"""Validación de invariantes de un estado de simulación.

Devuelve una lista de errores legibles (vacía si todo está bien). Se ejecuta al
crear una simulación, antes de guardarla o de asertarla en Prolog.

Importante: los ids se interpolan dentro de consultas Prolog, por lo que se
exige que sean átomos válidos (minúscula inicial, sin espacios ni símbolos).
Esto también evita inyección de sintaxis en el motor de inferencia.
"""
from __future__ import annotations

import re

from domain.estado import EstadoSimulacion

_ID_VALIDO = re.compile(r"^[a-z][a-zA-Z0-9_]*$")


def validar(estado: EstadoSimulacion) -> list[str]:
    errores: list[str] = []

    # Dimensiones mínimas exigidas por el enunciado.
    if estado.grid.ancho < 10 or estado.grid.alto < 10:
        errores.append("El mapa debe ser de al menos 10x10 casillas.")

    # Ids válidos como átomos Prolog.
    for grupo, etiqueta in (
        (estado.robots, "robot"),
        (estado.paquetes, "paquete"),
        (estado.zonas, "zona"),
    ):
        for elem in grupo:
            if not _ID_VALIDO.match(elem.id):
                errores.append(
                    f"Id de {etiqueta} inválido para Prolog: '{elem.id}' "
                    f"(use minúscula inicial, letras, números o '_')."
                )

    # Posiciones dentro del mapa.
    def fuera(x, y):
        return not estado.grid.dentro(x, y)

    for r in estado.robots:
        if fuera(r.x, r.y):
            errores.append(f"El robot {r.id} está fuera del mapa ({r.x},{r.y}).")
    for p in estado.paquetes:
        if fuera(p.x, p.y):
            errores.append(f"El paquete {p.id} está fuera del mapa ({p.x},{p.y}).")
    for z in estado.zonas:
        if fuera(z.x, z.y):
            errores.append(f"La zona {z.id} está fuera del mapa ({z.x},{z.y}).")
    for o in estado.obstaculos:
        if fuera(o.x, o.y):
            errores.append(f"Hay un obstáculo fuera del mapa ({o.x},{o.y}).")

    # Cada paquete debe apuntar a una zona existente.
    ids_zonas = {z.id for z in estado.zonas}
    for p in estado.paquetes:
        if p.zona_destino not in ids_zonas:
            errores.append(
                f"El paquete {p.id} apunta a una zona inexistente: '{p.zona_destino}'."
            )

    # Un robot no puede iniciar sobre un obstáculo.
    for r in estado.robots:
        if estado.hay_obstaculo(r.x, r.y):
            errores.append(f"El robot {r.id} inicia sobre un obstáculo ({r.x},{r.y}).")

    # Ids únicos dentro de cada categoría.
    for grupo, etiqueta in (
        (estado.robots, "robots"),
        (estado.paquetes, "paquetes"),
        (estado.zonas, "zonas"),
    ):
        ids = [e.id for e in grupo]
        if len(ids) != len(set(ids)):
            errores.append(f"Hay ids duplicados entre los {etiqueta}.")

    return errores
