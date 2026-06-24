# Smart Warehouse

Proyecto 2 de Inteligencia Artificial 1 - Vacaciones de junio 2026.

Smart Warehouse es una simulacion de bodega inteligente donde un robot transporta paquetes hacia zonas de entrega. Las decisiones principales del robot se originan en una base de conocimiento Prolog, mientras que un backend FastAPI coordina la simulacion y un frontend React permite visualizar y controlar el sistema.

## Tecnologias

- SWI-Prolog: motor de inferencia y toma de decisiones.
- Python + FastAPI: API, orquestacion de simulacion e historial.
- React + Vite + Tailwind CSS: interfaz web.
- JSON: historial de simulaciones finalizadas.
- Docker Compose: ejecucion de frontend y backend.

## Ejecucion Rapida

Requisito: Docker Desktop.

```powershell
docker compose up -d --build
```

Abrir:

```text
Frontend: http://localhost:3000
API Docs: http://localhost:8000/docs
```

Detener:

```powershell
docker compose down
```

## Estructura

```text
API/                  Backend FastAPI, dominio, servicios y repositorios
frontend/             Interfaz web React
prolog/warehouse.pl   Base de conocimiento Prolog
Documentacion/        Documento tecnico, manual y evidencias
docker-compose.yaml   Orquestacion de contenedores
```

## Funcionalidades

- Mapa visual de bodega 10x10.
- 1 robot funcional.
- 5 paquetes.
- 2 zonas de entrega.
- 8 obstaculos.
- Modo automatico.
- Modo paso a paso.
- Iniciar, pausar, reanudar y reiniciar simulacion.
- Nuevo mapa aleatorio.
- Estadisticas en tiempo real.
- Historial visual de simulaciones finalizadas.
- API REST documentada con Swagger.

## Documentacion

- [Documento Tecnico](Documentacion/Documento_Tecnico.md)
- [Manual de Usuario](Documentacion/Manual_Usuario.md)
- [Arquitectura AWS](Documentacion/Arquitectura_AWS.md)
- [Evidencias de Funcionamiento](Documentacion/Evidencias.md)
