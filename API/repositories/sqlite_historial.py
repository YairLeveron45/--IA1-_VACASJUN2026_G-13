"""Repositorio de historial sobre SQLite.

Persiste el resumen de cada simulación finalizada. Se abre una conexión por
operación (SQLite es ligero y así evitamos problemas de hilos cuando FastAPI
ejecuta handlers en su threadpool).
"""
from __future__ import annotations

import os
import sqlite3

from domain.historial import RegistroHistorial
from repositories.base import HistoryRepository

_COLUMNAS = (
    "id, creada_en, finalizada_en, ancho, alto, "
    "num_robots, num_paquetes, num_zonas, num_obstaculos, "
    "entregas, movimientos, pasos, tasa_entrega, estado_final"
)


class HistorialSQLite(HistoryRepository):
    def __init__(self, ruta_db: str) -> None:
        self._ruta = ruta_db
        carpeta = os.path.dirname(ruta_db)
        if carpeta:
            os.makedirs(carpeta, exist_ok=True)
        self._crear_tabla()

    def _conectar(self) -> sqlite3.Connection:
        con = sqlite3.connect(self._ruta)
        con.row_factory = sqlite3.Row
        return con

    def _crear_tabla(self) -> None:
        with self._conectar() as con:
            con.execute(
                """
                CREATE TABLE IF NOT EXISTS historial (
                    id              TEXT PRIMARY KEY,
                    creada_en       TEXT NOT NULL,
                    finalizada_en   TEXT,
                    ancho           INTEGER NOT NULL,
                    alto            INTEGER NOT NULL,
                    num_robots      INTEGER NOT NULL,
                    num_paquetes    INTEGER NOT NULL,
                    num_zonas       INTEGER NOT NULL,
                    num_obstaculos  INTEGER NOT NULL,
                    entregas        INTEGER NOT NULL,
                    movimientos     INTEGER NOT NULL,
                    pasos           INTEGER NOT NULL,
                    tasa_entrega    REAL NOT NULL,
                    estado_final    TEXT NOT NULL
                )
                """
            )

    def registrar(self, r: RegistroHistorial) -> None:
        with self._conectar() as con:
            con.execute(
                f"INSERT OR REPLACE INTO historial ({_COLUMNAS}) "
                f"VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (
                    r.id, r.creada_en, r.finalizada_en, r.ancho, r.alto,
                    r.num_robots, r.num_paquetes, r.num_zonas, r.num_obstaculos,
                    r.entregas, r.movimientos, r.pasos, r.tasa_entrega, r.estado_final,
                ),
            )

    def listar(self) -> list[RegistroHistorial]:
        with self._conectar() as con:
            filas = con.execute(
                f"SELECT {_COLUMNAS} FROM historial ORDER BY finalizada_en DESC"
            ).fetchall()
        return [self._a_registro(f) for f in filas]

    def obtener(self, id_sim: str) -> RegistroHistorial | None:
        with self._conectar() as con:
            fila = con.execute(
                f"SELECT {_COLUMNAS} FROM historial WHERE id = ?", (id_sim,)
            ).fetchone()
        return self._a_registro(fila) if fila else None

    @staticmethod
    def _a_registro(fila: sqlite3.Row) -> RegistroHistorial:
        return RegistroHistorial(**dict(fila))
