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
