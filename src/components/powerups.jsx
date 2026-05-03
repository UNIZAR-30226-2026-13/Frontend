import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 

const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa con power-ups
export const generarTabPowerUps = () => {
  let mapa = Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));; // Crea matriz vacía
  const keys = Object.keys(POWER_UPS);
  
  // Ponemos, por ejemplo, 5 power-ups aleatorios
  for (let i = 0; i < 5; i++) {
    let colocado = false;
    while (!colocado) {
      const f = Math.floor(Math.random() * TAM);
      const c = Math.floor(Math.random() * TAM);
      if (mapa[f][c] === ESTADOS_CASILLAS.VACIO) {
        const itemAleatorio = POWER_UPS[keys[Math.floor(Math.random() * keys.length)]];
        mapa[f][c] = itemAleatorio.id; // Guardamos el ID del power-up
        colocado = true;
      }
    }
  }
  return mapa;
};

export const obtenerHoverPowerUp = (f, c, powerUpSeleccionado) => {
  const celdasCoordenadas = obtenerCeldasImpacto( f, c, powerUpSeleccionado?.id);
  return celdasCoordenadas.map(([rf, rc]) => `${rf}-${rc}`);
};


export const obtenerCeldasImpacto = (f, c, tipo) => {
  const celdas = [[f, c]]; // Por defecto

  if (tipo === 'deflagrador') {
    const adyacentes = [
      [f - 1, c], [f + 1, c], 
      [f, c - 1], [f, c + 1]
    ];
    adyacentes.forEach(([af, ac]) => {
      if (af >= 0 && af < TAM && ac >= 0 && ac < TAM) {
        celdas.push([af, ac]);
      }
    });
    return celdas;
  }
  return celdas;
};

export const procesarInventario = (inventarioActual, powerUpUsado, powerUpsEncontrados) => {
  let nuevoInventario = [...inventarioActual];

  // Añadimos los powerups
  powerUpsEncontrados.forEach(id => {
    const powerUpCompleto = Object.values(POWER_UPS).find(p => p.id === id);
    if (powerUpCompleto) nuevoInventario.push(powerUpCompleto);
  });

  // Consumimos los powerups
  if (powerUpUsado) {
    const indice = nuevoInventario.findIndex(p => p?.id === powerUpUsado.id);
    if (indice !== -1) nuevoInventario.splice(indice, 1);
  }

  return nuevoInventario;
};

/* Radar: Revela cuantos barcos hay en el cuadrate de la celda elegida */

export const usarRadar = (f,c,tableroEnemigo) => {
  const mitad = Math.floor(TAM/2);
  const filaMin = f < mitad ? 0 : mitad;
  const filaMax = f < mitad ? mitad : TAM;
  const colMin = c < mitad ? 0 : mitad;
  const colMax = c < mitad ? mitad : TAM;

  let barcosRestantes = 0;
  for (let i = filaMin; i < filaMax; i++){
    for (let j = colMin; j < colMax; j++){
      const tipoR = tableroEnemigo[i][j]?.tipo ?? tableroEnemigo[i][j];
      if (tipoR === ESTADOS_CASILLAS.BARCO){
        barcosRestantes++;
      }
    }
  }

  const cuadrante = (f < mitad ? 0 : 2) + (c < mitad ? 0 : 1);

  return { cuadrante, barcosRestantes, filaMin, filaMax, colMin, colMax};
};

/* Escudo: Aplica un escudo a una celda de tu tablero */
export const aplicarEscudo = (f,c, tableroMio) => {
  const celda = tableroMio[f][c];
  const tipoCelda = celda?.tipo ?? celda;
  if (tipoCelda !== ESTADOS_CASILLAS.BARCO) return null;

  const nuevoTablero = tableroMio.map(fila => [...fila]);
  nuevoTablero[f][c] = typeof celda === 'object' ? { ...celda, tipo: ESTADOS_CASILLAS.ESCUDO }: ESTADOS_CASILLAS.ESCUDO;
  return nuevoTablero;
};

/*Tornado: dispara a 5 celdas random del cuadrante al cual pertenece esa celda */
export const usarTornado = (f, c, tableroEnemigo, powerUpsEnemigos) => {
  const mitad = Math.floor(TAM / 2);
  const filaMin = f < mitad ? 0 : mitad;
  const filaMax = f < mitad ? mitad : TAM;
  const colMin = c < mitad ? 0 : mitad;
  const colMax = c < mitad ? mitad : TAM;

  // Recogemos celdas válidas del cuadrante
  const celdasDisponibles = [];
  for (let i = filaMin; i < filaMax; i++) {
    for (let j = colMin; j < colMax; j++) {
      const tipoT = tableroEnemigo[i][j]?.tipo ?? tableroEnemigo[i][j];
      if (tipoT !== ESTADOS_CASILLAS.TOCADO && tipoT !== ESTADOS_CASILLAS.AGUA && tipoT !== ESTADOS_CASILLAS.HUNDIDO) {
        celdasDisponibles.push([i, j]);
      }
    }
  }

  const rand = celdasDisponibles.sort(() => Math.random() - 0.5);
  const celdasImpacto = rand.slice(0, 5);

  return celdasImpacto;
};


// export default PowerUps;