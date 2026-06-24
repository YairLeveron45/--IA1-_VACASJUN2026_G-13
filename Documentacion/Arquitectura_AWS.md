# Arquitectura de Despliegue en AWS

## Diagrama

El diagrama editable para draw.io se encuentra en:

```text
Documentacion/arquitectura-aws-docker-compose.drawio
```

## Descripcion General

El sistema puede desplegarse en una maquina virtual de AWS EC2 utilizando Docker Compose. La instancia ejecuta dos contenedores principales: uno para el frontend y otro para el backend. El backend utiliza la base de conocimiento Prolog y guarda el historial de simulaciones en un archivo JSON persistente.

## Componentes

- Usuario: accede desde un navegador web.
- AWS EC2: maquina virtual donde se instala Docker y Docker Compose.
- Security Group: permite el trafico necesario hacia la instancia.
- Frontend: aplicacion React compilada y servida con Nginx.
- Backend: API desarrollada con FastAPI.
- Prolog: archivo `warehouse.pl` montado dentro del contenedor backend.
- Volumen `sw_data`: almacena `historial.json` para conservar el historial.
- Red `smart_warehouse_net`: red interna de Docker Compose para comunicacion entre servicios.

## Puertos

| Servicio | Puerto en EC2 | Puerto en contenedor | Uso |
| --- | ---: | ---: | --- |
| SSH | 22 | N/A | Administracion de la VM |
| Frontend | 3000 | 80 | Aplicacion web |
| Backend | 8000 | 8000 | API REST y Swagger |

## Flujo de Comunicacion

1. El usuario abre `http://IP_PUBLICA_EC2:3000`.
2. El frontend se carga desde el contenedor Nginx.
3. El frontend llama a la API en `http://IP_PUBLICA_EC2:8000`.
4. El backend recibe las solicitudes de simulacion.
5. El backend consulta Prolog usando `pyswip`.
6. Prolog devuelve la accion recomendada para el robot.
7. El backend actualiza el estado y lo responde al frontend.
8. Cuando una simulacion finaliza, el backend guarda el resultado en `historial.json`.

## Comando de Despliegue

En la instancia EC2, desde la raiz del proyecto:

```bash
VITE_API_URL=http://IP_PUBLICA_EC2:8000 docker compose up -d --build
```

Luego abrir:

```text
Frontend: http://IP_PUBLICA_EC2:3000
API Docs: http://IP_PUBLICA_EC2:8000/docs
```
