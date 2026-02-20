//MODOS
export const MODOS_JUEGO = {
    PUBLICA: 'PUBLICA', PRIVADA: 'PRIVADA', RUSH: 'RUSH', COMPETITIVO: 'COMPETITIVO'
};

//TABLEROS
export const TABLEROS = {
    ESTANDAR_TAM: 10, RUSH_TAM: 20,
    PRIVADA_TAM: {
        MIN: 6, MAX: 25
    }
};

//BARCOS
export const BARCOS = {
    POR: {id: 'por', nombre: 'PORTAVIONES', tam: 5, cantidad: 1},
    ACO: {id: 'aco', nombre: 'ACORAZADO', tam: 4, cantidad: 1},
    SUB: {id: 'sub', nombre: 'SUBMARINO', tam: 3, cantidad: 2},
    FRA: {id: 'fra', nombre: 'FRAGATA', tam: 2, cantidad: 1}
}; 

//POWER-UPS
export const POWER_UPS = {
    TORPEDO_DEFLAGRADOR: {
        id: 'deflagrador', 
        nombre: 'TORPEDO DEFLAGRADOR',
        descripcion: 'Golpea la casilla seleccionada y las cuatro casillas adyacentes (en forma de cruz).',
        efecto: 'AREA',
        rango: 1,
        icono: 'deflagrador.png'
    },

    TORPEDO_DOBLE: {
        id: 'doble', 
        nombre: 'TORPEDO DOBLE',
        descripcion: 'Permite seleccionar dos casillas para golpear en un mismo turno.',
        efecto: 'DOBLE',
        disparos: 2,
        icono: 'doble.png'
    },

    TORNADO: {
        id: 'tor', 
        nombre: 'TORNADO',
        descripcion: 'Golpea casillas aleatorias dentro del área seleccionada.',
        efecto: 'AREA_ALEATORIA',
        icono: 'tornado.png'
    },

    ESCUDO: {
        id: 'esc', 
        nombre: 'ESCUDO',
        descripcion: 'Resiste un unico golpe. El oponente recibira una notificación de impacto en escudo.',
        efecto: 'PROTECCION',
        icono: 'escudo.png'
    },

    MINA: {
        id: 'mine', 
        nombre: 'MINA',
        descripcion: 'Si el rival la golpea, pierde su siguiente turno.',
        efecto: 'TRAMPA',
        castigo: 'TURNO_PERDIDO',
        icono: 'mina.png'
    },

    RADAR: {
        id: 'rad', 
        nombre: 'RADAR',
        descripcion: 'Revela cuantos barcos enemigos hay en uno de los cuatro cuadrantes del tablero.',
        efecto: 'REVELAR',
        area: 'CUADRANTE',
        icono: 'radar.png'
    }
};

//CONFIGURACION POWER-UPS
export const POWER_UPS_CONFIG = {
    TOTAL: 10, INVENTARIO_MAX: 20
};

//CONFIGURACION RUSH
export const RUSH_CONFIG = {
    TIPO_BARCO: BARCOS.FRA.id, CANTIDAD_BARCOS: 10
};

//CASILLAS
export const ESTADOS_CASILLAS = {
    VACIO: 0, BARCO: 1, TOCADO: 2, AGUA: 3, MINA: 4, ESCUDO: 5
};