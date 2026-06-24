% ============================================================
%  Smart Warehouse - Base de conocimiento (motor de decisión)
% ============================================================
%  Toda decisión de acción del robot se ORIGINA aquí, en Prolog.
%  Python (pyswip) únicamente asierta el estado del mundo y lee
%  la acción devuelta por decidir_accion/2. Esto cumple la
%  restricción del enunciado: la lógica de navegación, selección
%  de paquete, recolección y entrega vive en Prolog.
%
%  Convención de coordenadas (importante para el frontend):
%    x = columna, crece hacia la DERECHA   (0 .. Ancho-1)
%    y = fila,    crece hacia ABAJO         (0 .. Alto-1)
%    origen (0,0) = esquina superior izquierda
% ============================================================

% ---- Hechos dinámicos (se reescriben en cada tick desde Python) ----
:- dynamic dimension/2.      % dimension(Ancho, Alto)
:- dynamic obstaculo/2.      % obstaculo(X, Y)
:- dynamic zona_entrega/3.   % zona_entrega(IdZona, X, Y)
:- dynamic paquete/5.        % paquete(IdPaquete, X, Y, IdZonaDestino, Estado)
                             %   Estado: pendiente | tomado | entregado
:- dynamic robot/4.          % robot(IdRobot, X, Y, Carga)
                             %   Carga: libre | IdPaquete

% Acciones posibles que puede devolver decidir_accion/2:
%   mover_arriba, mover_abajo, mover_izquierda, mover_derecha,
%   recoger_paquete, entregar_paquete, esperar


% ============================================================
%  Utilidades de celda
% ============================================================

% Una posición está dentro de los límites del mapa.
dentro_mapa(X, Y) :-
    dimension(Ancho, Alto),
    X >= 0, X < Ancho,
    Y >= 0, Y < Alto.

% Una celda es transitable si está dentro del mapa y no es obstáculo.
celda_libre(X, Y) :-
    dentro_mapa(X, Y),
    \+ obstaculo(X, Y).

% Distancia Manhattan entre dos puntos.
distancia(X1, Y1, X2, Y2, D) :-
    DX is abs(X1 - X2),
    DY is abs(Y1 - Y2),
    D is DX + DY.

% Vecinos de una celda con la acción que lleva a cada uno.
vecino(X, Y, mover_derecha,   NX, Y)  :- NX is X + 1.
vecino(X, Y, mover_izquierda, NX, Y)  :- NX is X - 1.
vecino(X, Y, mover_abajo,     X,  NY) :- NY is Y + 1.
vecino(X, Y, mover_arriba,    X,  NY) :- NY is Y - 1.


% ============================================================
%  Selección de objetivo
% ============================================================

% Paquete objetivo: el paquete PENDIENTE más cercano al robot.
% Uso de listas: se recolectan todos los candidatos con findall y
% se ordenan por distancia con sort.
paquete_objetivo(IdRobot, IdPaquete, PX, PY) :-
    robot(IdRobot, RX, RY, libre),
    findall(Dist-Id-X-Y,
            ( paquete(Id, X, Y, _, pendiente),
              distancia(RX, RY, X, Y, Dist) ),
            Candidatos),
    Candidatos \= [],
    sort(Candidatos, [_-IdPaquete-PX-PY | _]).   % menor distancia primero

% Destino de un robot que ya carga un paquete: la zona de ese paquete.
destino_carga(IdRobot, ZX, ZY) :-
    robot(IdRobot, _, _, IdPaquete),
    IdPaquete \= libre,
    paquete(IdPaquete, _, _, IdZona, _),
    zona_entrega(IdZona, ZX, ZY).


% ============================================================
%  Navegacion (BFS con evasion de obstaculos)
% ============================================================
%  Antes se usaba una eleccion greedy: mirar solo los vecinos inmediatos y
%  tomar el que reducia la distancia Manhattan. Eso falla cuando dos o mas
%  obstaculos forman un bloqueo local. Esta version busca una ruta completa
%  con BFS y devuelve la primera accion del camino mas corto encontrado.

paso_hacia(RX, RY, TX, TY, Accion) :-
    buscar_ruta([[pos(RX, RY, inicio)]], [RX-RY], TX, TY, Ruta),
    Ruta = [pos(RX, RY, inicio), pos(_, _, Accion) | _],
    !.

buscar_ruta([[pos(TX, TY, A) | Resto] | _], _, TX, TY, Ruta) :-
    reverse([pos(TX, TY, A) | Resto], Ruta),
    !.

buscar_ruta([Camino | Cola], Visitados, TX, TY, Ruta) :-
    Camino = [pos(X, Y, _) | _],
    findall([pos(NX, NY, Accion) | Camino]-(NX-NY),
            ( vecino(X, Y, Accion, NX, NY),
              celda_libre(NX, NY),
              \+ memberchk(NX-NY, Visitados) ),
            NuevosPares),
    separar_pares(NuevosPares, NuevosCaminos, NuevosVisitados),
    append(Cola, NuevosCaminos, NuevaCola),
    append(Visitados, NuevosVisitados, VisitadosActualizados),
    buscar_ruta(NuevaCola, VisitadosActualizados, TX, TY, Ruta).

separar_pares([], [], []).
separar_pares([Camino-Visitado | Resto], [Camino | Caminos], [Visitado | Visitados]) :-
    separar_pares(Resto, Caminos, Visitados).


% ============================================================
%  Regla principal de decisión (con prioridades y corte)
% ============================================================
%  El orden de las cláusulas define la prioridad. Cada una termina
%  en corte (!) para no reconsiderar acciones de menor prioridad.

% 1) Estoy libre y hay un paquete pendiente en mi celda -> recogerlo.
decidir_accion(IdRobot, recoger_paquete) :-
    robot(IdRobot, RX, RY, libre),
    paquete(_, RX, RY, _, pendiente),
    !.

% 2) Cargo un paquete y estoy sobre su zona de entrega -> entregar.
decidir_accion(IdRobot, entregar_paquete) :-
    robot(IdRobot, RX, RY, IdPaquete),
    IdPaquete \= libre,
    paquete(IdPaquete, _, _, IdZona, _),
    zona_entrega(IdZona, RX, RY),
    !.

% 3) Cargo un paquete -> navegar hacia su zona de entrega.
decidir_accion(IdRobot, Accion) :-
    robot(IdRobot, RX, RY, IdPaquete),
    IdPaquete \= libre,
    destino_carga(IdRobot, ZX, ZY),
    paso_hacia(RX, RY, ZX, ZY, Accion),
    !.

% 4) Estoy libre -> navegar hacia el paquete pendiente más cercano.
decidir_accion(IdRobot, Accion) :-
    robot(IdRobot, RX, RY, libre),
    paquete_objetivo(IdRobot, _, PX, PY),
    paso_hacia(RX, RY, PX, PY, Accion),
    !.

% 5) Nada que hacer o estoy bloqueado -> esperar.
decidir_accion(_, esperar).
