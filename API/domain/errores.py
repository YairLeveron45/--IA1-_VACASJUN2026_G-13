"""Excepciones de dominio.

Se lanzan desde los servicios y la capa API (Fase 3) las traduce a códigos HTTP
(p. ej. SimulacionNoEncontrada -> 404, ConfiguracionInvalida -> 422).
"""
from __future__ import annotations


class SimulacionNoEncontrada(Exception):
    def __init__(self, id_sim: str):
        super().__init__(f"No existe la simulación '{id_sim}'.")
        self.id_sim = id_sim


class ConfiguracionInvalida(Exception):
    def __init__(self, errores: list[str]):
        super().__init__("Configuración de simulación inválida.")
        self.errores = errores
