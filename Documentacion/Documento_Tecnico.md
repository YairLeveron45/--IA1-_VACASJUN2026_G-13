# Documento Tecnico - Smart Warehouse

## 1. Datos Generales

- Curso: Inteligencia Artificial 1
- Proyecto: Smart Warehouse
- Grupo: G13
- Fecha de entrega: 26/06/2026
- Integrantes: completar con los nombres del equipo

## 2. Objetivo

Desarrollar un sistema inteligente capaz de simular una bodega automatizada donde un robot toma decisiones mediante reglas implementadas en Prolog para transportar paquetes hacia zonas de entrega, integrando frontend web, backend Python y motor de inferencia.

## 3. Arquitectura General

![Diagrama de arquitectura](evidencias/Diagrama%20de%20arquitectura.png)

El sistema se despliega en una instancia AWS EC2 usando Docker Compose con dos contenedores:

- **Frontend**: aplicacion React compilada y servida con Nginx en el puerto 3000.
- **Backend**: API FastAPI con Python que se comunica via pyswip con el motor SWI-Prolog para la toma de decisiones. Expone la API REST en el puerto 8000.

El archivo `warehouse.pl` se monta como volumen de solo lectura dentro del contenedor backend. El historial de simulaciones finalizadas se persiste en `historial.json` mediante un volumen nombrado (`sw_data`). Ambos contenedores se comunican a traves de la red interna `smart_warehouse_net`.

El flujo de comunicacion es el siguiente:

1. El usuario accede al frontend via `http://<IP>:3000`.
2. El frontend realiza peticiones HTTP REST al backend en `http://<IP>:8000`.
3. El backend sincroniza el estado con Prolog y consulta la accion a ejecutar.
4. Prolog evalua las reglas y devuelve la accion decidida.
5. El backend aplica la accion y responde al frontend.
6. Al finalizar la simulacion, el backend guarda el registro en `historial.json`.

## 4. Componentes

### Frontend

Ubicacion: `frontend/`

Responsabilidades:

- Mostrar el mapa 10x10.
- Visualizar robot, paquetes, zonas y obstaculos.
- Controlar la simulacion.
- Alternar entre modo automatico y paso a paso.
- Mostrar estadisticas.
- Mostrar historial de inferencia y simulaciones finalizadas.

Tecnologias:

- React
- Vite
- TypeScript
- Tailwind CSS
- lucide-react para iconos SVG

### Backend

Ubicacion: `API/`

Responsabilidades:

- Recibir configuraciones de simulacion.
- Validar el estado inicial.
- Traducir el estado del dominio a hechos Prolog.
- Consultar la accion que Prolog decide para cada robot.
- Aplicar la accion elegida al estado de la simulacion.
- Exponer endpoints REST.
- Guardar historial en JSON.

Tecnologias:

- Python
- FastAPI
- pyswip
- JSON

### Prolog

Ubicacion: `prolog/warehouse.pl`

Responsabilidades:

- Representar hechos dinamicos del mundo.
- Decidir la accion del robot.
- Seleccionar paquete objetivo.
- Determinar destino de entrega.
- Calcular una ruta usando BFS.
- Devolver acciones validas al backend.

### Docker

Archivos:

- `docker-compose.yaml`
- `API/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`

Servicios:

- `backend`: FastAPI + SWI-Prolog.
- `frontend`: React compilado y servido por Nginx.

## 5. Flujo de Simulacion

1. El frontend genera una configuracion inicial.
2. El frontend envia `POST /simulaciones`.
3. El backend crea una simulacion y guarda el estado inicial.
4. En cada paso, el backend sincroniza el estado con Prolog.
5. Prolog evalua reglas y devuelve una accion.
6. El backend aplica la accion al estado.
7. El frontend renderiza el nuevo estado.
8. Al finalizar, el backend guarda un registro en historial.

## 6. Reglas y Predicados Prolog

El archivo `warehouse.pl` contiene:

- `dimension/2`: dimensiones del mapa.
- `obstaculo/2`: posiciones bloqueadas.
- `zona_entrega/3`: zonas validas.
- `paquete/5`: paquetes y estado.
- `robot/4`: robot, posicion y carga.
- `dentro_mapa/2`: valida limites.
- `celda_libre/2`: valida transitabilidad.
- `distancia/5`: distancia Manhattan.
- `vecino/5`: vecinos posibles y accion asociada.
- `paquete_objetivo/4`: selecciona paquete pendiente mas cercano.
- `destino_carga/3`: obtiene zona destino del paquete cargado.
- `paso_hacia/5`: obtiene la siguiente accion hacia un objetivo.
- `buscar_ruta/5`: busqueda BFS para evitar obstaculos.
- `decidir_accion/2`: regla principal de decision.

Acciones disponibles:

- `mover_arriba`
- `mover_abajo`
- `mover_izquierda`
- `mover_derecha`
- `recoger_paquete`
- `entregar_paquete`
- `esperar`

La decision final de cada accion se origina en Prolog. Python solo sincroniza hechos, consulta `decidir_accion/2` y aplica mecanicamente el resultado.

## 7. Endpoints Principales

### Salud

- `GET /health`

### Simulaciones

- `POST /simulaciones`
- `GET /simulaciones`
- `GET /simulaciones/{id_sim}`
- `POST /simulaciones/{id_sim}/paso`
- `POST /simulaciones/{id_sim}/ejecutar`
- `POST /simulaciones/{id_sim}/pausar`
- `POST /simulaciones/{id_sim}/reanudar`
- `POST /simulaciones/{id_sim}/reiniciar`
- `GET /simulaciones/{id_sim}/metricas`
- `DELETE /simulaciones/{id_sim}`

### Historial

- `GET /historial`
- `GET /historial/{id_sim}`

### WebSocket

- `WS /ws/simulaciones/{id_sim}`

## 8. Metricas

El dashboard muestra:

- Entregas realizadas.
- Movimientos ejecutados.
- Eficiencia.
- Tiempo de ejecucion.
- Pasos.

El historial guarda:

- ID de simulacion.
- Fecha de creacion.
- Fecha de finalizacion.
- Dimensiones del mapa.
- Cantidad de robots, paquetes, zonas y obstaculos.
- Entregas.
- Movimientos.
- Pasos.
- Tasa de entrega.
- Estado final.
