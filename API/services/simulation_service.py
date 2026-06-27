"""Servicio de simulación: orquesta el ciclo de vida completo.

Coordina las cuatro piezas del sistema:
  - el motor de inferencia (PrologAdapter) decide cada acción,
  - el dominio (acciones.aplicar) ejecuta su efecto,
  - el SimulationRepository guarda el estado vivo,
  - el HistoryRepository persiste el resumen al finalizar.

Toda DECISIÓN proviene de Prolog; este servicio solo orquesta y aplica.
"""
from __future__ import annotations

import copy
import threading
import uuid
from datetime import datetime, timezone

from domain import acciones
from domain.errores import ConfiguracionInvalida, SimulacionNoEncontrada
from domain.estado import EstadoSimulacion
from domain.historial import RegistroHistorial
from domain.simulacion import EstadoEjecucion, Simulacion
from domain.validacion import validar
from inference.prolog_adapter import PrologAdapter
from repositories.base import HistoryRepository, SimulationRepository
from services.stats_service import MetricasSimulacion, StatsService

_MAX_PASOS_AUTO = 1000  # tope de seguridad para el modo automático


class SimulationService:
    def __init__(
        self,
        adapter: PrologAdapter,
        sim_repo: SimulationRepository,
        hist_repo: HistoryRepository,
        stats: StatsService | None = None,
    ) -> None:
        self._adapter = adapter     # motor Prolog (decide acciones)
        self._sims = sim_repo       # almacen de simulaciones activas
        self._hist = hist_repo      # repositorio de historial (JSON)
        self._stats = stats or StatsService()
        # Lock para serializar acceso a Prolog (pyswip no es reentrante)
        self._lock = threading.Lock()

    # ---------------- creación / consulta ----------------

    def crear(self, estado: EstadoSimulacion) -> Simulacion:
        """Valida y crea una nueva simulacion, la guarda en memoria."""
        errores = validar(estado)
        if errores:
            raise ConfiguracionInvalida(errores)
        sim = Simulacion(
            id=uuid.uuid4().hex[:8],
            estado=estado,
            estado_inicial=copy.deepcopy(estado),  # snapshot para reiniciar
        )
        self._sims.guardar(sim)
        return sim

    def obtener(self, id_sim: str) -> Simulacion:
        sim = self._sims.obtener(id_sim)
        if sim is None:
            raise SimulacionNoEncontrada(id_sim)
        return sim

    def listar(self) -> list[Simulacion]:
        """Lista todas las simulaciones activas."""
        return self._sims.listar()

    def metricas(self, id_sim: str) -> MetricasSimulacion:
        return self._stats.metricas(self.obtener(id_sim).estado)

    def historial(self) -> list[RegistroHistorial]:
        return self._hist.listar()

    def historial_de(self, id_sim: str) -> RegistroHistorial | None:
        return self._hist.obtener(id_sim)

    # ---------------- control del ciclo ----------------

    def paso(self, id_sim: str) -> Simulacion:
        """Ejecuta un único tick: Prolog decide -> Python aplica."""
        with self._lock:
            sim = self.obtener(id_sim)
            if sim.ejecucion == EstadoEjecucion.FINALIZADA:
                return sim

            acciones_robots = self._adapter.decidir(sim.estado)
            hubo_progreso = False
            for id_robot, accion in acciones_robots.items():
                if accion != "esperar":
                    hubo_progreso = True
                acciones.aplicar(sim.estado, id_robot, accion)
            sim.estado.stats.pasos += 1

            if sim.estado.todos_entregados():
                self._finalizar(sim, "completada")
            elif not hubo_progreso:
                self._finalizar(sim, "detenida")  # deadlock: todos esperan

            self._sims.guardar(sim)
            return sim

    def ejecutar(self, id_sim: str, max_pasos: int = _MAX_PASOS_AUTO) -> Simulacion:
        """Modo automático: ejecuta pasos hasta finalizar, pausar o tope."""
        sim = self.obtener(id_sim)
        if sim.ejecucion != EstadoEjecucion.FINALIZADA:
            sim.ejecucion = EstadoEjecucion.EN_EJECUCION
            self._sims.guardar(sim)

        ejecutados = 0
        while ejecutados < max_pasos:
            sim = self.obtener(id_sim)
            if sim.ejecucion in (EstadoEjecucion.FINALIZADA, EstadoEjecucion.PAUSADA):
                break
            self.paso(id_sim)
            ejecutados += 1
        return self.obtener(id_sim)

    def pausar(self, id_sim: str) -> Simulacion:
        """Pausa el modo automatico."""
        sim = self.obtener(id_sim)
        if sim.ejecucion == EstadoEjecucion.EN_EJECUCION:
            sim.ejecucion = EstadoEjecucion.PAUSADA
            self._sims.guardar(sim)
        return sim

    def reanudar(self, id_sim: str) -> Simulacion:
        """Reanuda desde 'creada' o 'pausada' a 'en_ejecucion'."""
        sim = self.obtener(id_sim)
        if sim.ejecucion in (EstadoEjecucion.CREADA, EstadoEjecucion.PAUSADA):
            sim.ejecucion = EstadoEjecucion.EN_EJECUCION
            self._sims.guardar(sim)
        return sim

    def reiniciar(self, id_sim: str) -> Simulacion:
        """Restaura la simulacion a su estado inicial."""
        sim = self.obtener(id_sim)
        sim.estado = copy.deepcopy(sim.estado_inicial)
        sim.ejecucion = EstadoEjecucion.CREADA
        sim.finalizada_en = None
        self._sims.guardar(sim)
        return sim

    def eliminar(self, id_sim: str) -> None:
        if not self._sims.existe(id_sim):
            raise SimulacionNoEncontrada(id_sim)
        self._sims.eliminar(id_sim)

    # ---------------- interno ----------------

    def _finalizar(self, sim: Simulacion, resultado: str) -> None:
        """Marca como finalizada y persiste el registro en el historial."""
        sim.estado.terminada = True
        sim.ejecucion = EstadoEjecucion.FINALIZADA
        sim.finalizada_en = datetime.now(timezone.utc).isoformat()
        self._hist.registrar(self._construir_registro(sim, resultado))

    def _construir_registro(self, sim: Simulacion, resultado: str) -> RegistroHistorial:
        """Construye el RegistroHistorial a partir del estado final."""
        e = sim.estado
        m = self._stats.metricas(e)
        return RegistroHistorial(
            id=sim.id,
            creada_en=sim.creada_en,
            finalizada_en=sim.finalizada_en,
            ancho=e.grid.ancho,
            alto=e.grid.alto,
            num_robots=len(e.robots),
            num_paquetes=len(e.paquetes),
            num_zonas=len(e.zonas),
            num_obstaculos=len(e.obstaculos),
            entregas=m.entregas,
            movimientos=m.movimientos,
            pasos=m.pasos,
            tasa_entrega=m.tasa_entrega,
            estado_final=resultado,
        )
