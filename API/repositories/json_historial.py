"""Repositorio de historial sobre un archivo JSON.

Persiste el resumen de cada simulacion finalizada en una lista JSON. Es una
solucion simple para el alcance del proyecto: no requiere motor de base de
datos y permite inspeccionar el historial directamente desde el archivo.
"""
from __future__ import annotations

import json
import os
import tempfile
from dataclasses import asdict

from domain.historial import RegistroHistorial
from repositories.base import HistoryRepository


class HistorialJSON(HistoryRepository):
    def __init__(self, ruta_archivo: str) -> None:
        self._ruta = ruta_archivo
        carpeta = os.path.dirname(ruta_archivo)
        if carpeta:
            os.makedirs(carpeta, exist_ok=True)
        if not os.path.exists(self._ruta):
            self._guardar([])

    def registrar(self, registro: RegistroHistorial) -> None:
        registros = self.listar()
        filtrados = [r for r in registros if r.id != registro.id]
        filtrados.append(registro)
        filtrados.sort(key=lambda r: r.finalizada_en or "", reverse=True)
        self._guardar([asdict(r) for r in filtrados])

    def listar(self) -> list[RegistroHistorial]:
        try:
            with open(self._ruta, "r", encoding="utf-8") as archivo:
                datos = json.load(archivo)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

        if not isinstance(datos, list):
            return []
        return [RegistroHistorial(**item) for item in datos if isinstance(item, dict)]

    def obtener(self, id_sim: str) -> RegistroHistorial | None:
        return next((registro for registro in self.listar() if registro.id == id_sim), None)

    def _guardar(self, datos: list[dict]) -> None:
        carpeta = os.path.dirname(self._ruta) or "."
        fd, temporal = tempfile.mkstemp(prefix=".historial-", suffix=".json", dir=carpeta)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as archivo:
                json.dump(datos, archivo, ensure_ascii=False, indent=2)
                archivo.write("\n")
            os.replace(temporal, self._ruta)
        finally:
            if os.path.exists(temporal):
                os.remove(temporal)
